const Loading = () => {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 rounded-xl border border-gray-200 bg-white px-4 py-16 text-center shadow-[var(--card-shadow)] dark:border-gray-800 dark:bg-gray-900">
      <span
        className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400"
        aria-hidden="true"
      />

      <p className="text-sm font-medium text-gray-900 dark:text-white">
        Loading...
      </p>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        Please wait while we fetch products.
      </p>
    </div>
  );
};

export default Loading;
