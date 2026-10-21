const ProductCardSkeleton = () => {
  return (
    <article className="animate-pulse rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="aspect-square w-full rounded-lg bg-gray-200 dark:bg-gray-800" />

      <div className="mt-4 h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-800" />

      <div className="mt-3 h-3.5 w-24 rounded bg-gray-200 dark:bg-gray-800" />

      <div className="mt-3 h-4 w-20 rounded bg-gray-200 dark:bg-gray-800" />

      <div className="mt-4 h-8 w-full rounded-lg bg-gray-200 dark:bg-gray-800" />
    </article>
  );
};

/**
 * Full grid of card skeletons — the shared loading state for the products
 * page (route-level Suspense fallback + client refetch placeholder).
 */
const ProductCardGridSkeleton = ({ count = 8 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};

export { ProductCardGridSkeleton };
export default ProductCardSkeleton;
