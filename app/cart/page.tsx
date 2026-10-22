"use client";

import Image from "next/image";
import Link from "next/link";

import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/format";
import { FREE_SHIPPING_THRESHOLD, formatShipping, getShippingCost } from "../lib/shipping";
import { CART_ICON } from "../components/ui/icons";
import {
  pageContainerClasses,
  primaryButtonClasses,
} from "../components/ui/styles";

const TRASH_ICON =
  "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0";

const CartPage = () => {
  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    getCartTotal,
    isHydrated,
  } = useCart();

  const subtotal = getCartTotal();
  const shipping = getShippingCost(subtotal);
  const total = subtotal + shipping;

  if (!isHydrated) {
    return (
      <main className={pageContainerClasses}>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Your Cart
        </h1>

        <div className="mt-12 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">Loading cart...</p>
        </div>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className={pageContainerClasses}>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Your Cart
        </h1>

        <div className="mt-12 flex flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <svg
              className="h-8 w-8 text-gray-500 dark:text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={CART_ICON}
              />
            </svg>
          </div>

          <h2 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-white">
            Your cart is empty
          </h2>

          <p className="mt-3 text-gray-500 dark:text-gray-400">
            Start shopping and add some products to your cart.
          </p>

          <Link href="/products" className={`${primaryButtonClasses} mt-6 px-6 py-3`}>
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={pageContainerClasses}>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Your Cart ({cart.length})
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Cart items */}
        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
          {cart.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-4 py-6 first:pt-0 sm:flex-row sm:items-center"
            >
              {/* Product image (empty-string images get a placeholder so
                  next/image never sees an invalid src) */}
              <div className="relative h-24 w-24 shrink-0 self-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800 sm:self-auto">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="96px"
                    className="object-contain p-1"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="flex h-full w-full items-center justify-center text-gray-400 dark:text-gray-500"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.8}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d={CART_ICON}
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Product info */}
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <h2 className="truncate font-semibold text-gray-900 dark:text-white">
                  {item.title}
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {formatPrice(item.price)} each
                </p>
              </div>

              {/* Quantity controls */}
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => decreaseQuantity(item.id)}
                  disabled={item.quantity <= 1}
                  aria-label={`Decrease quantity of ${item.title}`}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-lg text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  &minus;
                </button>

                <span
                  className="min-w-6 text-center font-semibold text-gray-900 dark:text-white"
                  aria-live="polite"
                >
                  {item.quantity}
                </span>

                <button
                  type="button"
                  onClick={() => increaseQuantity(item.id)}
                  disabled={item.quantity >= item.stock}
                  aria-label={`Increase quantity of ${item.title}`}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-lg text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  +
                </button>
              </div>

              {/* Line total + remove */}
              <div className="flex items-center justify-center gap-4 sm:w-24 sm:flex-col sm:gap-2">
                <p className="font-bold text-gray-900 dark:text-white">
                  {formatPrice(item.price * item.quantity)}
                </p>

                <button
                  type="button"
                  onClick={() => removeFromCart(item.id)}
                  aria-label={`Remove ${item.title} from cart`}
                  className="text-gray-400 transition hover:text-red-600 dark:hover:text-red-400"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={TRASH_ICON}
                    />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>

        {/* Order summary */}
        <aside
          aria-label="Order summary"
          className="h-fit rounded-xl border border-gray-200 bg-white p-6 shadow-[var(--card-shadow)] dark:border-gray-800 dark:bg-gray-900 lg:sticky lg:top-24"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Order Summary
          </h2>

          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Subtotal</dt>

              <dd className="font-medium text-gray-900 dark:text-white">
                {formatPrice(subtotal)}
              </dd>
            </div>

            <div className="flex items-center justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Shipping</dt>

              <dd
                className={`font-medium ${
                  shipping === 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-gray-900 dark:text-white"
                }`}
              >
                {formatShipping(shipping)}
              </dd>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-800">
              <dt className="text-base font-bold text-gray-900 dark:text-white">
                Total
              </dt>

              <dd className="text-xl font-bold text-gray-900 dark:text-white">
                {formatPrice(total)}
              </dd>
            </div>
          </dl>

          {shipping > 0 && (
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              Free shipping on orders over ${FREE_SHIPPING_THRESHOLD}.
            </p>
          )}

          <Link
            href="/checkout"
            className={`${primaryButtonClasses} mt-6 w-full py-3 text-base`}
          >
            Proceed to Checkout
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        </aside>
      </div>
    </main>
  );
};

export default CartPage;
