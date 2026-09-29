"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "./context/CartContext";
import { queryClient } from "./lib/query-client";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>{children}</CartProvider>
    </QueryClientProvider>
  );
}
