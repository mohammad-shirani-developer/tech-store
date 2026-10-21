"use client";

import { useQuery } from "@tanstack/react-query";

import { useProductFilters } from "../hooks/useProductFilters";
import { getProducts } from "../lib/api";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ProductCardSkeleton";
import Dropdown from "./ui/Dropdown";
import { inputClasses, primaryButtonClasses } from "./ui/styles";

const ProductList = () => {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    staleTime: 1000 * 60 * 5,
  });

  const products = data ?? [];

  const {
    search,
    setSearch,
    category,
    setCategory,
    categories,
    sort,
    setSort,
    sortedProducts,
  } = useProductFilters(products);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p>Failed to load products.</p>;
  }

  return (
    <>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className={primaryButtonClasses}
        >
          {isFetching ? "Refreshing..." : "Refresh Products"}
        </button>

        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search products..."
          aria-label="Search products"
          className={inputClasses}
        />

        <Dropdown
          ariaLabel="Filter by category"
          label={category === "all" ? "All categories" : category}
          value={category}
          onChange={setCategory}
          options={categories.map((value) => ({
            value,
            label: value === "all" ? "All categories" : value,
          }))}
        />

        <Dropdown
          ariaLabel="Sort products"
          value={sort}
          onChange={setSort}
          label={
            sort === "default"
              ? "Sort by"
              : sort === "price-asc"
                ? "Price: Low to High"
                : "Price: High to Low"
          }
          options={[
            { value: "default", label: "Default" },
            { value: "price-asc", label: "Price: Low to High" },
            { value: "price-desc", label: "Price: High to Low" },
          ]}
        />
      </div>

      {sortedProducts.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          No products found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              price={product.price}
              imageUrl={product.image}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default ProductList;
