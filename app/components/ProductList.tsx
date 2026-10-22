"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { useProductFilters } from "../hooks/useProductFilters";
import type { ProductSortOption } from "../hooks/useProductFilters";
import {
  ALL_CATEGORIES_ICON_PATH,
  getCategoryDisplayName,
  getCategoryIconPath,
} from "../lib/categories";
import { getProducts, type Product } from "../lib/api";
import ErrorState from "./ErrorState";
import ProductCard from "./ProductCard";
import { ProductCardGridSkeleton } from "./ProductCardSkeleton";
import Dropdown from "./ui/Dropdown";
import {
  focusRingClasses,
  inputClasses,
  rangeInputClasses,
  secondaryButtonClasses,
} from "./ui/styles";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "top-rated", label: "Top Rated" },
] as const satisfies ReadonlyArray<{
  value: ProductSortOption;
  label: string;
}>;

const getSortLabel = (value: ProductSortOption) =>
  SORT_OPTIONS.find((option) => option.value === value)?.label ?? value;

const sectionHeadingClasses =
  "text-sm font-bold text-gray-900 dark:text-white";

/* Selected category row highlight (mirrors the mockup). */
const activeCategoryClasses =
  "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400";

const idleCategoryClasses =
  "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/60";

const formatRangePrice = (value: number) =>
  `$${Math.round(value).toLocaleString("en-US")}`;

type ProductListProps = {
  /** Server-fetched catalog used as the query's initial data (SSR). */
  products: Product[];
};

const ProductList = ({ products: initialProducts }: ProductListProps) => {
  /* Search state is seeded from the header search (?q=...). */
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("q") ?? "";

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["products"],
    // Forward TanStack's signal so unmounting/superseded queries actually
    // cancel the five upstream category requests.
    queryFn: ({ signal }) => getProducts(signal),
    initialData: initialProducts,
    staleTime: 1000 * 60 * 5,
  });

  const products = data ?? [];

  const {
    search,
    setSearch,
    selectedCategories,
    setSelectedCategories,
    toggleCategory,
    selectedBrands,
    toggleBrand,
    categories,
    brands,
    highestPrice,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    sort,
    setSort,
    sortedProducts,
    resetFilters,
    hasActiveFilters,
  } = useProductFilters(products, initialSearch);

  /* Sidebar is collapsible on small screens, always visible on desktop. */
  const [showFilters, setShowFilters] = useState(false);

  if (isLoading) {
    return <ProductCardGridSkeleton />;
  }

  if (isError) {
    return <ErrorState onRetry={() => refetch()} retrying={isFetching} />;
  }

  const priceRangeLabel = `${formatRangePrice(minPrice)} \u2013 ${formatRangePrice(maxPrice)}`;

  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
      {/* Sidebar filters */}
      <aside>
        <button
          type="button"
          onClick={() => setShowFilters((open) => !open)}
          aria-expanded={showFilters}
          className="mb-4 flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 transition hover:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white lg:hidden"
        >
          Filters
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform ${
              showFilters ? "rotate-180" : ""
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.23 8.29a.75.75 0 010-1.08z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <div
          className={`${
            showFilters ? "block" : "hidden"
          } space-y-6 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 lg:sticky lg:top-24 lg:block`}
        >
          {/* Sidebar header + Clear all */}
          <div className="flex items-center justify-between">
            <h2 className={sectionHeadingClasses}>Filters</h2>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Categories */}
          <fieldset>
            <legend className={sectionHeadingClasses}>Categories</legend>

            <ul className="mt-3 space-y-1">
              {/* All */}
              <li>
                <button
                  type="button"
                  onClick={() => setSelectedCategories([])}
                  aria-pressed={selectedCategories.length === 0}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition ${focusRingClasses} ${
                    selectedCategories.length === 0
                      ? activeCategoryClasses
                      : idleCategoryClasses
                  }`}
                >
                  <svg
                    className="h-4 w-4 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={ALL_CATEGORIES_ICON_PATH}
                    />
                  </svg>
                  All
                  <span className="ml-auto text-xs opacity-70">
                    ({products.length})
                  </span>
                </button>
              </li>

              {categories.map((category) => {
                const isSelected = selectedCategories.includes(category.value);

                return (
                  <li key={category.value}>
                    <button
                      type="button"
                      onClick={() => toggleCategory(category.value)}
                      aria-pressed={isSelected}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition ${focusRingClasses} ${
                        isSelected ? activeCategoryClasses : idleCategoryClasses
                      }`}
                    >
                      <svg
                        className="h-4 w-4 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.8}
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d={getCategoryIconPath(category.value)}
                        />
                      </svg>
                      {getCategoryDisplayName(category.value)}
                      <span className="ml-auto text-xs opacity-70">
                        ({category.count})
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </fieldset>

          {/* Price range (min + max sliders) */}
          <div>
            <h3 className={sectionHeadingClasses}>Price Range</h3>

            <p
              className="mt-2 text-sm font-medium text-gray-900 dark:text-white"
              aria-live="polite"
            >
              {priceRangeLabel}
            </p>

            <input
              type="range"
              min={0}
              max={highestPrice}
              step={1}
              value={minPrice}
              onChange={(event) => {
                const value = Number(event.target.value);

                setMinPrice(
                  value <= 0 ? null : Math.min(value, maxPrice),
                );
              }}
              disabled={highestPrice === 0}
              aria-label="Minimum price"
              aria-valuetext={formatRangePrice(minPrice)}
              className={`mt-3 ${rangeInputClasses}`}
            />

            <input
              type="range"
              min={0}
              max={highestPrice}
              step={1}
              value={maxPrice}
              onChange={(event) => {
                const value = Number(event.target.value);

                setMaxPrice(
                  value >= highestPrice ? null : Math.max(value, minPrice),
                );
              }}
              disabled={highestPrice === 0}
              aria-label="Maximum price"
              aria-valuetext={formatRangePrice(maxPrice)}
              className={`mt-2 ${rangeInputClasses}`}
            />
          </div>

          {/* Brands */}
          {brands.length > 0 && (
            <fieldset>
              <legend className={sectionHeadingClasses}>Brand</legend>

              <ul className="mt-3 space-y-2.5">
                {brands.map((brand) => (
                  <li key={brand.value}>
                    <label className="flex cursor-pointer items-center justify-between gap-2 text-sm">
                      <span className="flex items-center gap-2.5 text-gray-700 dark:text-gray-300">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand.value)}
                          onChange={() => toggleBrand(brand.value)}
                          className="h-4 w-4 rounded accent-blue-600"
                        />
                        {brand.value}
                      </span>

                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {brand.count}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>
          )}
        </div>
      </aside>

      {/* Product grid */}
      <div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            All Products ({sortedProducts.length})
          </h1>

          <Dropdown
            ariaLabel="Sort products"
            label={`Sort by: ${getSortLabel(sort)}`}
            value={sort}
            onChange={setSort}
            options={SORT_OPTIONS}
            className="w-48"
          />
        </div>

        {/* Search — the header search bar is hidden below lg */}
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search products..."
          aria-label="Search products"
          className={`${inputClasses} mb-6 lg:hidden`}
        />

        {sortedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-gray-300 py-16 text-center dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">
              No products found.
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className={secondaryButtonClasses}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
