"use client";

import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";

import ErrorState from "@/app/components/ErrorState";

type ProductErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ProductError({ error, reset }: ProductErrorProps) {
  const router = useRouter();
  const [isRetrying, startRetry] = useTransition();

  useEffect(() => {
    console.error("Product page error:", error);
  }, [error]);

  const handleRetry = () => {
    startRetry(() => {
      /* Re-run the failed server components first, then clear the boundary.
         A plain reset() would just re-render the same failed payload. */
      router.refresh();
      reset();
    });
  };

  return (
    <ErrorState
      onRetry={handleRetry}
      retrying={isRetrying}
      homeHref="/"
    />
  );
}
