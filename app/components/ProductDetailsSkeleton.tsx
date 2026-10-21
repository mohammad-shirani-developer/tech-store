const ProductDetailsSkeleton = () => {
  return (
    <div className="mx-auto w-full max-w-7xl animate-pulse px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="aspect-square rounded-2xl bg-gray-200 dark:bg-gray-800" />

          <div className="mt-4 flex gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-20 w-20 rounded-lg bg-gray-200 dark:bg-gray-800"
              />
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center">
          <div className="h-8 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />

          <div className="mt-4 h-5 w-44 rounded bg-gray-200 dark:bg-gray-800" />

          <div className="mt-4 h-9 w-32 rounded bg-gray-200 dark:bg-gray-800" />

          <div className="mt-6 space-y-3">
            <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-4 w-4/6 rounded bg-gray-200 dark:bg-gray-800" />
          </div>

          <div className="mt-6 flex gap-4">
            <div className="h-12 w-40 rounded-lg bg-gray-200 dark:bg-gray-800" />
            <div className="h-12 flex-1 rounded-lg bg-gray-200 dark:bg-gray-800" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsSkeleton;
