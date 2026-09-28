const ProductDetailsSkeleton = () => {
  return (
    <div className="mx-auto max-w-7xl animate-pulse p-6">
      <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
        <div className="h-88 rounded-lg bg-gray-800 md:h-125" />

        <div className="flex flex-col justify-center">
          <div className="h-8 w-3/4 rounded bg-gray-800 md:h-10" />

          <div className="mt-6 h-8 w-32 rounded bg-gray-800" />

          <div className="mt-6 space-y-3">
            <div className="h-4 w-full rounded bg-gray-800" />
            <div className="h-4 w-5/6 rounded bg-gray-800" />
            <div className="h-4 w-4/6 rounded bg-gray-800" />
          </div>

          <div className="mt-6 h-4 w-32 rounded bg-gray-800" />

          <div className="mt-6 border-t border-gray-800 pt-4">
            <div className="h-4 w-16 rounded bg-gray-800" />
            <div className="mt-2 h-6 w-40 rounded bg-gray-800" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsSkeleton;
