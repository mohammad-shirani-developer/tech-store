import Link from "next/link";

import { primaryButtonClasses } from "./components/ui/styles";

const BOX_ICON =
  "M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z";

const NotFound = () => {
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
        Page not found
      </h1>

      <p className="text-gray-500 dark:text-gray-400">
        The page you are looking for doesn&apos;t exist.
      </p>

      <Link href="/" className={`${primaryButtonClasses} mt-2 px-6 py-3`}>
        Go Back
      </Link>
    </div>
  );
};

export default NotFound;
