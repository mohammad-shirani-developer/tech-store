"use client";

import Link from "next/link";
import {
  primaryButtonClasses,
  secondaryButtonClasses,
} from "./ui/styles";

type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  /** True while the retry is in flight — disables the button and shows progress. */
  retrying?: boolean;
  /** When set, renders a secondary "Go to ..." link below the retry button. */
  homeHref?: string;
  homeLabel?: string;
};

const ErrorState = ({
  title = "Something went wrong!",
  message = "Failed to load data. Please try again.",
  onRetry,
  retrying = false,
  homeHref,
  homeLabel = "Go to Home",
}: ErrorStateProps) => {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10">
        <svg
          className="h-7 w-7 text-red-600 dark:text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        {title}
      </h2>

      <p className="text-gray-500 dark:text-gray-400">{message}</p>

      {onRetry && (
        <>
          <button
            type="button"
            onClick={onRetry}
            disabled={retrying}
            className={primaryButtonClasses}
          >
            {retrying ? "Retrying..." : "Try Again"}
          </button>

          {homeHref && (
            <Link href={homeHref} className={secondaryButtonClasses}>
              {homeLabel}
            </Link>
          )}

          <p
            className="h-5 text-sm text-gray-500 dark:text-gray-400"
            aria-live="polite"
          >
            {retrying ? "Reconnecting..." : ""}
          </p>
        </>
      )}
    </div>
  );
};

export default ErrorState;
