import Link from "next/link";

import { BOX_ICON } from "./ui/icons";
import { primaryButtonClasses } from "./ui/styles";

type NotFoundStateProps = {
  heading: string;
  message: string;
  ctaHref: string;
};

/** Shared 404 body used by the root and product-scoped not-found pages. */
const NotFoundState = ({ heading, message, ctaHref }: NotFoundStateProps) => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
        <svg
          className="h-8 w-8 text-gray-500 dark:text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={BOX_ICON} />
        </svg>
      </div>

      <p
        className="text-7xl font-extrabold tracking-tight text-blue-600 dark:text-blue-400"
        aria-hidden="true"
      >
        404
      </p>

      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        {heading}
      </h1>

      <p className="text-gray-500 dark:text-gray-400">{message}</p>

      <Link href={ctaHref} className={`${primaryButtonClasses} mt-2 px-6 py-3`}>
        Go Back
      </Link>
    </div>
  );
};

export default NotFoundState;
