"use client";

import ErrorState from "@/app/components/ErrorState";

type ProductErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ProductError({ reset }: ProductErrorProps) {
  return <ErrorState onRetry={() => reset()} />;
}
