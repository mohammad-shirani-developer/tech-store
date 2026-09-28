const ProductCardSkeleton = () => {
  return (
    <article className="animate-pulse rounded-lg border border-gray-800 p-4">
      <div className="h-48 w-full rounded-lg bg-gray-800" />

      <div className="mt-4 h-5 w-3/4 rounded bg-gray-800" />

      <div className="mt-3 h-5 w-24 rounded bg-gray-800" />
    </article>
  );
};

export default ProductCardSkeleton;
