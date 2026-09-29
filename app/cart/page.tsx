"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "../context/CartContext";

const CartPage = () => {
  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    getCartTotal,
    isHydrated,
  } = useCart();

  if (!isHydrated) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>

        <div className="mt-12 flex items-center justify-center">
          <p className="text-gray-500">Loading cart...</p>
        </div>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>

        <div className="mt-12 flex flex-col items-center justify-center text-center">
          <h2 className="text-2xl font-semibold">Your cart is empty</h2>

          <p className="mt-3 text-gray-500">
            Start shopping and add some products to your cart.
          </p>

          <Link
            href="/products"
            className="mt-6 rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition hover:bg-blue-600"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold">Shopping Cart</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Cart Items */}
        <div>
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-5 border-b border-gray-800 py-6 sm:flex-row sm:items-center"
            >
              {/* Product Image */}
              <div className="relative h-24 w-24 shrink-0 self-center sm:self-auto">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-contain"
                />
              </div>

              {/* Product Information */}
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <h2 className="font-semibold">{item.title}</h2>

                <p className="mt-2 text-gray-400">
                  ${item.price.toFixed(2)} each
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => decreaseQuantity(item.id)}
                  className="h-9 w-9 rounded border border-gray-700 transition hover:bg-gray-800"
                >
                  -
                </button>

                <span className="min-w-6 text-center font-semibold">
                  {item.quantity}
                </span>

                <button
                  type="button"
                  onClick={() => increaseQuantity(item.id)}
                  className="h-9 w-9 rounded border border-gray-700 transition hover:bg-gray-800"
                >
                  +
                </button>
              </div>

              {/* Item Total + Remove */}
              <div className="flex flex-col items-center gap-2 sm:w-28 sm:items-end">
                <p className="font-semibold">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>

                <button
                  type="button"
                  onClick={() => removeFromCart(item.id)}
                  className="text-sm text-red-500 transition hover:text-red-400"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <aside className="h-fit rounded-lg border border-gray-800 p-6">
          <h2 className="text-xl font-bold">Order Summary</h2>

          <div className="mt-6 flex items-center justify-between text-gray-400">
            <span>Items</span>
            <span>{cart.length}</span>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-gray-800 pt-4">
            <span className="font-semibold">Total</span>

            <span className="text-xl font-bold">
              ${getCartTotal().toFixed(2)}
            </span>
          </div>

          <button
            type="button"
            className="mt-6 w-full rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition hover:bg-blue-600"
          >
            Checkout
          </button>
        </aside>
      </div>
    </main>
  );
};

export default CartPage;
