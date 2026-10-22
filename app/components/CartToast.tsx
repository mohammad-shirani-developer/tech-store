"use client";

import { useEffect, useState } from "react";

import { useCart } from "../context/CartContext";
import { CLOSE_ICON } from "./ui/icons";
import { focusRingClasses } from "./ui/styles";

const CHECK_ICON =
  "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z";

const TOAST_DURATION_MS = 3000;

/**
 * "Added to cart!" toast, fixed bottom-right. Renders only after the cart
 * has hydrated (isHydrated guard) and reacts to the lastAdded event stored
 * in CartContext — auto-dismissing ~3s after the most recent add, pausing
 * while the user hovers it.
 */
const CartToast = () => {
  const { lastAdded, dismissToast, isHydrated } = useCart();

  /* Pause state is derived, not synced: the pause belongs to one specific
     toast (its `at` timestamp), so a fresh add automatically un-pauses
     without any setState-in-effect dance. */
  const [pausedFor, setPausedFor] = useState<number | null>(null);
  const isPaused = pausedFor !== null && lastAdded?.at === pausedFor;

  useEffect(() => {
    if (!lastAdded || isPaused) {
      return;
    }

    const timer = setTimeout(() => dismissToast(), TOAST_DURATION_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [lastAdded, dismissToast, isPaused]);

  if (!isHydrated || !lastAdded) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      onMouseEnter={() =>
        setPausedFor(lastAdded ? lastAdded.at : null)
      }
      onMouseLeave={() => setPausedFor(null)}
      className="animate-toast-in fixed bottom-4 right-4 z-50 flex max-w-[calc(100vw-2rem)] items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-800 dark:bg-gray-900 sm:bottom-6 sm:right-6"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400">
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={CHECK_ICON} />
        </svg>
      </span>

      <div className="min-w-0 py-0.5">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          Added to cart!
        </p>

        <p className="mt-0.5 text-xs leading-5 text-gray-500 dark:text-gray-400">
          {lastAdded.title} has been added to your cart.
        </p>
      </div>

      <button
        type="button"
        onClick={dismissToast}
        aria-label="Dismiss notification"
        className={`-mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 ${focusRingClasses}`}
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={CLOSE_ICON} />
        </svg>
      </button>
    </div>
  );
};

export default CartToast;
