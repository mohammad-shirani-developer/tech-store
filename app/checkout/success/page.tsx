"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { ORDER_SESSION_KEY } from "../../lib/order";

type PlacedOrder = {
  number: string;
  total: number;
  name: string;
};

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
    cachedOrder = raw ? (JSON.parse(raw) as PlacedOrder) : null;
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

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mx-auto mt-8 max-w-lg rounded-lg border border-gray-800 p-8 text-center">
        {/* Green check circle */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
          <svg
            className="h-8 w-8 text-green-500"
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

        <h1 className="mt-6 text-3xl font-bold">
          Thank you{order ? `, ${order.name}` : ""}!
        </h1>

        <p className="mt-3 text-gray-500">
          Your order has been placed successfully.
        </p>

        {order && (
          <dl className="mt-6 space-y-3 rounded-lg border border-gray-800 p-4 text-left text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-gray-500">Order number</dt>
              <dd className="font-semibold">{order.number}</dd>
            </div>

            <div className="flex items-center justify-between">
              <dt className="text-gray-500">Total</dt>
              <dd className="font-semibold">${order.total.toFixed(2)}</dd>
            </div>
          </dl>
        )}

        <p className="mt-6 text-sm text-gray-500">
          This is a demo store — no real payment was processed and nothing will
          be shipped.
        </p>

        <Link
          href="/products"
          className="mt-6 inline-block rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition hover:bg-blue-600"
        >
          Back to Products
        </Link>
      </div>
    </main>
  );
};

export default SuccessPage;
