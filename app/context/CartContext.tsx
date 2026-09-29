"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import { Product } from "../lib/api";

type CartItem = {
  id: number;
  title: string;
  price: number;
  image: string;
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  increaseQuantity: (productId: number) => void;
  decreaseQuantity: (productId: number) => void;
  removeFromCart: (productId: number) => void;
  getCartTotal: () => number;
  isHydrated: boolean;
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

  let cart: CartItem[] = [];

  if (cartSnapshotValue) {
    try {
      cart = JSON.parse(cartSnapshotValue) as CartItem[];
    } catch {
      cart = [];
    }
  }

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.id === product.id);

    if (!existingItem) {
      const newItem: CartItem = {
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        quantity: 1,
      };

      updateCart([...cart, newItem]);

      return;
    }

    updateCart(
      cart.map((item) =>
        item.id === product.id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      ),
    );
  };

  const increaseQuantity = (productId: number) => {
    updateCart(
      cart.map((item) =>
        item.id === productId
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
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
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
