import { useMemo, useState } from "react";

import type { Product } from "../lib/api";

export type ProductSortOption = "default" | "price-asc" | "price-desc";

/**
 * Search / category / sort state plus the derived filtered + sorted list.
 * Title search is case-insensitive.
 */
export const useProductFilters = (products: Product[]) => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<ProductSortOption>("default");

  const categories = useMemo(() => {
    return ["all", ...new Set(products.map((product) => product.category))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products.filter(
      (product) =>
        product.title.toLowerCase().includes(normalizedSearch) &&
        (category === "all" || product.category === category),
    );
  }, [products, search, category]);

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];

    if (sort === "price-asc") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sort === "price-desc") {
      sorted.sort((a, b) => b.price - a.price);
    }

    return sorted;
  }, [filteredProducts, sort]);

  return {
    search,
    setSearch,
    category,
    setCategory,
    categories,
    sort,
    setSort,
    sortedProducts,
  };
};
