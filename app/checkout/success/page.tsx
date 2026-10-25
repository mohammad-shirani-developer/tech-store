"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import {
  clearPlacedOrder,
  readPlacedOrder,
  type PlacedOrder,
} from "../../lib/order";
import { clearCart } from "../../context/CartContext";
import { useLocationSearch } from "../../hooks/useLocationSearch";
import { formatPrice } from "../../lib/format";
import {
  pageContainerClasses,
  primaryButtonClasses,
} from "../../components/ui/styles";

/* -----------------------------
   Success page
----------------------------- */

/* Stripe sessions already processed in this tab: a Back/forward remount
   replays the same ?session_id, and replaying it must never wipe a cart
   the customer rebuilt after that order. */
let lastClearedSessionId: string | null = null;

const SuccessPage = () => {
  /* Read once at mount and render from that snapshot: the confirmation
     must not vanish when the session copy is cleared below, and a later
     Back-navigation remount (session already emptied) correctly shows the
     generic thanks page without touching any cart built since. */
  const [orderSnapshot] = useState<PlacedOrder | null>(() =>
    readPlacedOrder(),
  );
  const cartClearedRef = useRef(false);

  /* Derived from the URL (no setState-in-effect): ?session_id=... means the
     customer is returning from a real Stripe Checkout test session. The
     query stays in the URL so a refresh keeps the badge consistent. */
  const search = useLocationSearch();
  const paidViaStripe =
    new URLSearchParams(search).get("session_id") !== null;

  /* The cart is emptied only when this mount IS the arrival from checkout:
     either a just-placed order snapshot exists (demo path) or the URL
     carries a Stripe session id. Back/forward remounts later in the same
     tab do not qualify — a cart built since the order must survive. */
  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get(
      "session_id",
    );

    const isArrival =
      Boolean(orderSnapshot) || Boolean(sessionId);

    if (!isArrival || cartClearedRef.current) {
      return;
    }

    if (sessionId && lastClearedSessionId === sessionId) {
      cartClearedRef.current = true;
      return;
    }

    cartClearedRef.current = true;

    if (sessionId) {
      lastClearedSessionId = sessionId;
    }

    clearCart();
    clearPlacedOrder();
  }, [orderSnapshot]);

  /* The session copy is dropped on unmount so a stale order can never
     resurface on a later visit to this URL. */
  useEffect(() => {
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
          Thank you{orderSnapshot ? `, ${orderSnapshot.name}` : ""}!
        </h1>

        <p className="mt-3 text-gray-500 dark:text-gray-400">
          Your order has been placed successfully.
        </p>

        {paidViaStripe && (
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M13.479 9.883c-1.626-.604-2.512-1.067-2.512-1.803 0-.622.511-1.231 1.841-1.231 1.182 0 2.047.256 2.63.512l.698-2.398a8.034 8.034 0 0 0-2.966-.548l.001-.002c-1.613 0-2.965.422-3.923 1.209l-.005-.014a3.999 3.999 0 0 0-1.442 3.106c0 1.914 1.32 2.896 3.459 3.652 1.549.548 2.066 1.063 2.066 1.795 0 .725-.626 1.204-1.761 1.204-1.054 0-2.322-.431-3.256-.958l-.699 2.442c1.087.626 2.593 1.03 4.174 1.03 1.775 0 3.192-.435 4.153-1.243a4.031 4.031 0 0 0 1.34-3.115c0-1.955-1.322-2.943-3.798-3.815z" />
            </svg>
            Paid with Stripe (test mode)
          </p>
        )}

        {orderSnapshot && (
          <dl className="mt-6 space-y-3 rounded-lg border border-gray-200 p-4 text-left text-sm dark:border-gray-800">
            <div className="flex items-center justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Order number</dt>
              <dd className="font-semibold text-gray-900 dark:text-white">{orderSnapshot.number}</dd>
            </div>

            <div className="flex items-center justify-between">
              <dt className="text-gray-500 dark:text-gray-400">Total</dt>
              <dd className="font-semibold text-gray-900 dark:text-white">{formatPrice(orderSnapshot.total)}</dd>
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
