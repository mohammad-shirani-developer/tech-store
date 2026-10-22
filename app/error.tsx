"use client";

import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";

import ErrorState from "./components/ErrorState";

type RootErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const RootError = ({ error, reset }: RootErrorProps) => {
  const router = useRouter();
  const [isRetrying, startRetry] = useTransition();

  useEffect(() => {
    console.error("Unhandled app error:", error);
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
};

export default RootError;
