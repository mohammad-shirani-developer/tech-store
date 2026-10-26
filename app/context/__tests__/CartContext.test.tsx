import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CartProvider, clearCart, useCart } from "../CartContext";
import type { Product } from "../../lib/api";

const KEY = "cart";

/* A complete, valid Product — every test overrides only the fields it
   cares about (price, stock, ...). */
const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 1,
  title: "Phone X",
  price: 19.99,
  description: "",
  category: "smartphones",
  image: "https://example.com/phone-x.jpg",
  images: [],
  brand: null,
  rating: 4.5,
  reviewCount: 12,
  discountPercentage: 0,
  stock: 3,
  availabilityStatus: "In Stock",
  ...overrides,
});

const phoneX = makeProduct();
const keyboard = makeProduct({ id: 2, title: "Keyboard Pro", price: 49.5 });

const readStorage = () => JSON.parse(window.localStorage.getItem(KEY) ?? "[]");

describe("mutations", () => {
  const renderCart = () => renderHook(() => useCart(), { wrapper: CartProvider });

  beforeEach(() => {
    window.localStorage.clear();
    clearCart();
  });

  it("adds a product and persists the line to localStorage", () => {
    const { result } = renderCart();

    act(() => result.current.addToCart(phoneX));

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0]).toMatchObject({
      id: 1,
      title: "Phone X",
      price: 19.99,
      quantity: 1,
    });
    expect(readStorage()).toHaveLength(1);
  });

  it("clamps the requested quantity to the available stock", () => {
    const { result } = renderCart();

    /* Asking for 10 when the store only has 3 must not oversell. */
    act(() => result.current.addToCart(phoneX, 10));

    expect(result.current.cart[0].quantity).toBe(3);
  });

  it("refuses to add a product that has zero stock", () => {
    const { result } = renderCart();

    act(() => result.current.addToCart(makeProduct({ id: 3, stock: 0 })));

    expect(result.current.cart).toHaveLength(0);
    expect(readStorage()).toEqual([]);
  });

  it("increase stops at the stock and decrease never goes below one", () => {
    const { result } = renderCart();

    act(() => result.current.addToCart(phoneX));

    /* Each click is its own event — separate act() blocks so every
       mutation reads the freshly re-rendered cart (same-tick calls would
       share the stale snapshot the app itself documents). */
    act(() => result.current.increaseQuantity(1));
    act(() => result.current.increaseQuantity(1));
    act(() => result.current.increaseQuantity(1)); // stock is 3 — must not apply
    expect(result.current.cart[0].quantity).toBe(3);

    act(() => result.current.decreaseQuantity(1));
    act(() => result.current.decreaseQuantity(1));
    act(() => result.current.decreaseQuantity(1)); // floor is 1 — line stays
    expect(result.current.cart[0].quantity).toBe(1);
  });

  it("remove deletes only the targeted line", () => {
    const { result } = renderCart();

    act(() => result.current.addToCart(phoneX));
    act(() => result.current.addToCart(keyboard));

    act(() => result.current.removeFromCart(1));

    expect(result.current.cart.map((item) => item.id)).toEqual([2]);
    expect(readStorage().map((item: { id: number }) => item.id)).toEqual([2]);
  });

  it("totals stay float-safe (19.99 × 3 = 59.97, not 59.9700000001)", () => {
    const { result } = renderCart();

    act(() => result.current.addToCart(phoneX, 3));

    expect(result.current.getCartTotal()).toBe(59.97);
  });

  it("stays silent when re-adding a line that is already at its stock cap", () => {
    const { result } = renderCart();

    act(() => result.current.addToCart(phoneX, 3)); // fills the stock, toast fires
    act(() => result.current.dismissToast());
    expect(result.current.lastAdded).toBeNull();

    /* Re-adding changes nothing (still capped at 3) — so the toast must
       NOT claim another item was added. */
    act(() => result.current.addToCart(phoneX, 1));

    expect(result.current.lastAdded).toBeNull();
    expect(result.current.cart[0].quantity).toBe(3);
  });
});

describe("reading a saved cart", () => {
  /* The cart module keeps its snapshot in module-level state — a fresh
     copy of the module makes it re-read localStorage instead of reusing
     whatever the previous test left in the cache. */
  const renderFreshCart = async () => {
    vi.resetModules();

    const Module = await import("../CartContext");

    return renderHook(() => Module.useCart(), {
      wrapper: Module.CartProvider,
    });
  };

  it("degrades a corrupted payload to an empty cart", async () => {
    window.localStorage.setItem(KEY, "{broken json");

    const { result } = await renderFreshCart();

    expect(result.current.cart).toEqual([]);
    expect(result.current.getCartTotal()).toBe(0);
  });

  it("drops duplicate ids and wrong shapes but keeps valid lines", async () => {
    window.localStorage.setItem(
      KEY,
      JSON.stringify([
        {
          id: 7,
          title: "Valid Monitor",
          price: 199,
          image: "",
          quantity: 1,
          stock: 2,
        },
        { id: 7, title: "Duplicate Monitor", price: 199, quantity: 5 },
        { id: "not-a-number", title: "Bad Id", price: 1, quantity: 1 },
        { id: 9, title: "Zero Quantity", price: 1, quantity: 0 },
        { id: 11, price: 5, quantity: 1 },
        42,
      ]),
    );

    const { result } = await renderFreshCart();

    expect(result.current.cart.map((item) => item.id)).toEqual([7]);
    expect(result.current.cart[0].title).toBe("Valid Monitor");
  });

  it("still lets legacy lines without a stock field increase", async () => {
    /* Carts saved before `stock` existed must keep working, not vanish. */
    window.localStorage.setItem(
      KEY,
      JSON.stringify([
        {
          id: 5,
          title: "Legacy Mouse",
          price: 25,
          image: "",
          quantity: 1,
        },
      ]),
    );

    const { result } = await renderFreshCart();

    expect(result.current.cart[0].title).toBe("Legacy Mouse");

    act(() => result.current.increaseQuantity(5));
    act(() => result.current.increaseQuantity(5));

    expect(result.current.cart[0].quantity).toBe(3);
  });
});
