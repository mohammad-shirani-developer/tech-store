import { useMemo, useState } from "react";

import { TECH_CATEGORIES } from "../lib/categories";
import type { Product } from "../lib/api";

export type ProductSortOption =
  | "newest"
  | "price-asc"
  | "price-desc"
  | "top-rated";

export type FilterOption = {
  value: string;
  count: number;
};

/** Brand filter value standing in for products without a brand. */
export const OTHER_BRAND = "Other";

/**
 * Search / category / brand / price / sort state plus the derived
 * filtered + sorted list (single source of filter truth for the
 * storefront).
 * - Categories and brands are multi-select (empty selection = no filter).
 * - Brands come from product.brand; products without one are grouped
 *   under the "Other" option so they stay reachable by the filter.
 *   Membership is matched through a Set for O(1) lookups.
 * - minPrice/maxPrice are range bounds; null keeps a bound open (min 0 /
 *   pinned to the highest available price, rounded up for a clean slider
 *   end) until the user moves a slider.
 * - "newest" sorts by descending id (DummyJSON assigns sequential ids as
 *   products are added, so it is the closest thing to newest-first).
 * - Title search is case-insensitive.
 */
export const useProductFilters = (
  products: Product[],
  initialSearch = "",
) => {
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [sort, setSort] = useState<ProductSortOption>("newest");

  const selectedBrandSet = useMemo(
    () => new Set(selectedBrands),
    [selectedBrands],
  );

  const categories = useMemo<FilterOption[]>(() => {
    const counts = new Map<string, number>();

    for (const product of products) {
      counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
    }

    return [...counts.entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => {
        /* Canonical tech categories keep their declared order;
           anything else falls back to alphabetical. */
        const knownCategories = TECH_CATEGORIES as readonly string[];
        const aIndex = knownCategories.indexOf(a.value);
        const bIndex = knownCategories.indexOf(b.value);

        if (aIndex !== -1 || bIndex !== -1) {
          return (
            (aIndex === -1 ? knownCategories.length : aIndex) -
            (bIndex === -1 ? knownCategories.length : bIndex)
          );
        }

        return a.value.localeCompare(b.value);
      });
  }, [products]);

  const brands = useMemo<FilterOption[]>(() => {
    const counts = new Map<string, number>();
    let otherCount = 0;

    for (const product of products) {
      if (product.brand) {
        counts.set(product.brand, (counts.get(product.brand) ?? 0) + 1);
      } else {
        otherCount += 1;
      }
    }

    const brandOptions = [...counts.entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => a.value.localeCompare(b.value));

    /* "Other" (products without a brand) is pinned last, like the mockup. */
    if (otherCount > 0) {
      brandOptions.push({ value: OTHER_BRAND, count: otherCount });
    }

    return brandOptions;
  }, [products]);

  /* Slider upper bound derived from the data, rounded up for a clean end. */
  const highestPrice = useMemo(() => {
    const rawHighest = products.reduce(
      (max, product) => Math.max(max, product.price),
      0,
    );

    return Math.ceil(rawHighest);
  }, [products]);

  const effectiveMinPrice = minPrice ?? 0;
  const effectiveMaxPrice = maxPrice ?? highestPrice;

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products.filter(
      (product) =>
        product.title.toLowerCase().includes(normalizedSearch) &&
        (selectedCategories.length === 0 ||
          selectedCategories.includes(product.category)) &&
        (selectedBrandSet.size === 0 ||
          (product.brand === null
            ? selectedBrandSet.has(OTHER_BRAND)
            : selectedBrandSet.has(product.brand))) &&
        product.price >= effectiveMinPrice &&
        product.price <= effectiveMaxPrice,
    );
  }, [
    products,
    search,
    selectedCategories,
    selectedBrandSet,
    effectiveMinPrice,
    effectiveMaxPrice,
  ]);

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];

    if (sort === "price-asc") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sort === "price-desc") {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sort === "top-rated") {
      sorted.sort(
        (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
      );
    } else if (sort === "newest") {
      /* Descending id = most recently added first (sequential ids). */
      sorted.sort((a, b) => b.id - a.id);
    }

    return sorted;
  }, [filteredProducts, sort]);

  const toggleCategory = (value: string) => {
    setSelectedCategories((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  };

  const toggleBrand = (value: string) => {
    setSelectedBrands((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedCategories([]);
    setSelectedBrands([]);
    setMinPrice(null);
    setMaxPrice(null);
    setSort("newest");
  };

  /* True when any filter/sort deviates from its default (drives the
     "Clear all" button). The raw min/max state is used so the open
     defaults do not count as active filters. */
  const hasActiveFilters =
    search.trim() !== "" ||
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    minPrice !== null ||
    maxPrice !== null ||
    sort !== "newest";

  return {
    search,
    setSearch,
    selectedCategories,
    setSelectedCategories,
    toggleCategory,
    selectedBrands,
    setSelectedBrands,
    toggleBrand,
    categories,
    brands,
    highestPrice,
    minPrice: effectiveMinPrice,
    setMinPrice,
    maxPrice: effectiveMaxPrice,
    setMaxPrice,
    sort,
    setSort,
    sortedProducts,
    resetFilters,
    hasActiveFilters,
  };
};
