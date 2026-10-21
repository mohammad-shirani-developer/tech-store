"use client";

import ErrorState from "./components/ErrorState";

type RootErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const RootError = ({ reset }: RootErrorProps) => {
  return <ErrorState onRetry={() => reset()} />;
};

export default RootError;
