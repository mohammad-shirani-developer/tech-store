"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useSyncExternalStore,
} from "react";
import { Product } from "../lib/api";

type CartItem = {
  id: number;
  title: string;
  price: number;
  image: string;
  quantity: number;
  /** Stock snapshot taken when the line was added, so quantity is clamped. */
  stock: number;
};

/* Carts saved before `stock` existed keep a practically unlimited ceiling
   instead of being discarded on upgrade. */
const LEGACY_STOCK_FALLBACK = 999_999;

/* Structured validation for whatever localStorage returns: a corrupted or
   wrong-shape payload must degrade to an empty cart instead of crashing
   every page that reads the cart (or rendering "$NaN" totals). */
const parseCartItems = (raw: string): CartItem[] => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) {
    return [];
  }

  const items: CartItem[] = [];

  for (const entry of parsed) {
    if (
      typeof entry === "object" &&
      entry !== null &&
      typeof (entry as CartItem).id === "number" &&
      typeof (entry as CartItem).title === "string" &&
      typeof (entry as CartItem).price === "number" &&
      typeof (entry as CartItem).quantity === "number" &&
      (entry as CartItem).quantity >= 1
    ) {
      const item = entry as CartItem;

      items.push({
        ...item,
        image: typeof item.image === "string" ? item.image : "",
        quantity: Math.floor(item.quantity),
        stock:
          typeof item.stock === "number" && item.stock >= 0
            ? item.stock
            : LEGACY_STOCK_FALLBACK,
      });
    }
  }

  return items;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  increaseQuantity: (productId: number) => void;
  decreaseQuantity: (productId: number) => void;
  removeFromCart: (productId: number) => void;
  getCartTotal: () => number;
  isHydrated: boolean;
  /* Toast event for the last "added to cart" action, consumed by
     <CartToast/>. Null when there is nothing to show. */
  lastAdded: { title: string; at: number } | null;
  dismissToast: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = "cart";

/* -----------------------------
   Cart Store
----------------------------- */

let cartSnapshot = "";
let cartInitialized = false;

const cartListeners = new Set<() => void>();

const subscribeToCart = (listener: () => void) => {
  cartListeners.add(listener);

  return () => {
    cartListeners.delete(listener);
  };
};

const getCartSnapshot = () => {
  if (typeof window === "undefined") {
    return "";
  }

  if (!cartInitialized) {
    cartInitialized = true;
    cartSnapshot = localStorage.getItem(CART_KEY) ?? "";
  }

  return cartSnapshot;
};

const getServerCartSnapshot = () => {
  return "";
};

const updateCart = (newCart: CartItem[]) => {
  const newSnapshot = JSON.stringify(newCart);

  cartSnapshot = newSnapshot;

  localStorage.setItem(CART_KEY, newSnapshot);

  cartListeners.forEach((listener) => {
    listener();
  });
};

export const clearCart = () => {
  updateCart([]);
};

/* -----------------------------
   Hydration Store
----------------------------- */

const emptySubscribe = () => () => {};

const getClientHydrationSnapshot = () => {
  return true;
};

const getServerHydrationSnapshot = () => {
  return false;
};

/* -----------------------------
   Cart Provider
----------------------------- */

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const cartSnapshotValue = useSyncExternalStore(
    subscribeToCart,
    getCartSnapshot,
    getServerCartSnapshot,
  );

  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );

  /* Local toast state ("added to cart" notification). Kept here so the
     toast fires from the same action that mutates the cart. */
  const [lastAdded, setLastAdded] = useState<{
    title: string;
    at: number;
  } | null>(null);

  const dismissToast = useCallback(() => {
    setLastAdded(null);
  }, []);

  let cart: CartItem[] = [];

  if (cartSnapshotValue) {
    cart = parseCartItems(cartSnapshotValue);
  }

  // Optional quantity lets a single click add N units atomically
  // (repeated same-tick calls would read the same stale snapshot).
  const addToCart = (product: Product, quantity = 1) => {
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      // Never order more units than the store actually has in stock.
      updateCart(
        cart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: Math.min(item.quantity + quantity, item.stock),
              }
            : item,
        ),
      );
    } else {
      if (product.stock <= 0) {
        return;
      }

      const newItem: CartItem = {
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        quantity: Math.min(quantity, product.stock),
        stock: product.stock,
      };

      updateCart([...cart, newItem]);
    }

    // Toast event for <CartToast/>; `at` (timestamp) drives the
    // auto-dismiss timer and re-arming when items are added in a row.
    setLastAdded({ title: product.title, at: Date.now() });
  };

  const increaseQuantity = (productId: number) => {
    updateCart(
      cart.map((item) =>
        item.id === productId && item.quantity < item.stock
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      ),
    );
  };

  const decreaseQuantity = (productId: number) => {
    updateCart(
      cart.map((item) =>
        item.id === productId && item.quantity > 1
          ? {
              ...item,
              quantity: item.quantity - 1,
            }
          : item,
      ),
    );
  };

  const removeFromCart = (productId: number) => {
    updateCart(cart.filter((item) => item.id !== productId));
  };

  const getCartTotal = () => {
    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // Canonicalize float money before it is compared against the shipping
    // threshold or persisted on the order (avoids 99.99999999999997 cases).
    return Math.round(total * 100) / 100;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        getCartTotal,
        isHydrated,
        lastAdded,
        dismissToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

/* -----------------------------
   useCart
----------------------------- */

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
};
