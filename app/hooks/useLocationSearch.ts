"use client";

import { useSyncExternalStore } from "react";

/* Listeners notified when the URL query changes without a remount
   (back/forward navigation). replaceState/pushState callers can dispatch
   these manually if they need the store to re-read immediately. */
const searchListeners = new Set<() => void>();

const subscribeToLocationSearch = (listener: () => void) => {
  searchListeners.add(listener);
  window.addEventListener("popstate", listener);

  return () => {
    searchListeners.delete(listener);
    window.removeEventListener("popstate", listener);
  };
};

const getServerSearch = () => "";

/**
 * Reads the current URL query string as an external store. Lets client
 * components derive one-shot flags from the URL (e.g. "came back from a
 * canceled Stripe Checkout") without setState-inside-effect and without
 * hydration mismatches: during SSR and the hydration render the server
 * snapshot (empty) is used, then React re-renders with the real value.
 */
export const useLocationSearch = () => {
  return useSyncExternalStore(
    subscribeToLocationSearch,
    () => window.location.search,
    getServerSearch,
  );
};
