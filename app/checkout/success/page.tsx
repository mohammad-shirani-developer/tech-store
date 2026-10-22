"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";

import {
  clearPlacedOrder,
  readPlacedOrder,
  type PlacedOrder,
  ORDER_SESSION_KEY,
} from "../../lib/order";
import { clearCart } from "../../context/CartContext";
import { formatPrice } from "../../lib/format";
import {
  pageContainerClasses,
  primaryButtonClasses,
} from "../../components/ui/styles";

/* -----------------------------
   Session order store
----------------------------- */

const subscribeToOrder = () => {
  // sessionStorage does not change while this page is open.
  return () => {};
};

let cachedRawOrder: string | null = null;
let cachedOrder: PlacedOrder | null = null;

const getClientOrderSnapshot = (): PlacedOrder | null => {
  let raw: string | null = null;

  try {
    raw = sessionStorage.getItem(ORDER_SESSION_KEY);
  } catch {
    raw = null;
  }

  if (raw !== cachedRawOrder) {
    cachedRawOrder = raw;
    // Structured validation: a corrupted payload reads as "no order"
    // instead of crashing the snapshot getter.
    cachedOrder = readPlacedOrder();
  }

  return cachedOrder;
};

const getServerOrderSnapshot = (): PlacedOrder | null => {
  return null;
};

/* -----------------------------
   Success page
----------------------------- */

const SuccessPage = () => {
  const order = useSyncExternalStore(
    subscribeToOrder,
    getClientOrderSnapshot,
    getServerOrderSnapshot,
  );

  /* The cart is emptied once the confirmation is on screen (checkout no
     longer clears it before navigating), and the session copy is dropped
     when the user leaves so a stale order can never resurface on a later
     visit. A refresh keeps the confirmation because sessionStorage
     survives in-tab reloads. */
  useEffect(() => {
    clearCart();

    return () => {
      clearPlacedOrder();
    };
  }, []);

  return (
    <main className={pageContainerClasses}>
      <div className="mx-auto mt-8 max-w-lg rounded-xl border border-gray-200 bg-white p-8 text-center shadow-[var(--card-shadow)] dark:border-gray-800 dark:bg-gray-900">
        {/* Green check circle */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/10">
          <svg
            className="h-8 w-8 text-green-600 dark:text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>

        <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
          Thank you{order ? `, ${order.name}` : ""}!
        </h1>

        <p className="mt-3 text-gray-500 dark:text-gray-400">
          Your order has been placed successfully.
        </p>

        {order && (
          <dl className="mt-6 space-y-3 rounded-lg border border-gray-200 p-4 text-left text-sm dark:border-gray-800">
            <div className="flex items-center justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Order number</dt>
              <dd className="font-semibold text-gray-900 dark:text-white">{order.number}</dd>
            </div>

            <div className="flex items-center justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Total</dt>
              <dd className="font-semibold text-gray-900 dark:text-white">{formatPrice(order.total)}</dd>
            </div>
          </dl>
        )}

        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          This is a demo store — no real payment was processed and nothing will
          be shipped.
        </p>

        <Link
          href="/products"
          className={`${primaryButtonClasses} mt-6 px-6 py-3`}
        >
          Back to Products
        </Link>
      </div>
    </main>
  );
};

export default SuccessPage;
