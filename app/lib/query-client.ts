import { QueryClient } from "@tanstack/react-query";

/* requestJson in lib/api.ts already retries transient failures (3 attempts
   with backoff + 10s timeout each). A single query-level retry on top is
   enough — the TanStack default of 3 stacked up to 9 upstream requests per
   failed query and kept the error UI hidden for ~30s. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
