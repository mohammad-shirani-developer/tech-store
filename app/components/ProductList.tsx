"use client";

import { useEffect, useRef, useState } from "react";
import { Product } from "../lib/api";
import ProductCard from "./ProductCard";

type ProductListProps = {
  products: Product[];
};
type SortOption = "default" | "price-asc" | "price-desc";

const ProductList = ({ products }: ProductListProps) => {
  const [search, setSearch] = useState("");

  const [category, setCategory] = useState("all");

  const [isOpen, setIsOpen] = useState(false);

  const [sort, setSort] = useState<SortOption>("default");

  const [isSortOpen, setIsSortOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("useEffect executed");

    const handleClickOutside = (event: MouseEvent) => {
      console.log("document clicked");

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }

      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSortOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const categories = [
    "all",
    ...new Set(products.map((product) => product.category)),
  ];

  const filteredProducts = products.filter(
    (product) =>
      product.title.toLowerCase().includes(search.toLowerCase()) &&
      (category === "all" || product.category === category),
  );

  const sortedProducts = [...filteredProducts];

  if (sort === "price-asc") {
    sortedProducts.sort((a, b) => a.price - b.price);
  } else if (sort === "price-desc") {
    sortedProducts.sort((a, b) => b.price - a.price);
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 md:flex-row ">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full max-w-md  rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />

        <div ref={dropdownRef} className="relative w-full max-w-md">
          <button
            type="button"
            onClick={() => {
              setIsOpen(!isOpen);
              setIsSortOpen(false);
            }}
            className="flex w-full items-center justify-between rounded-lg border border-gray-300 px-4 py-2 text-left text-white outline-none transition hover:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            {category === "all" ? "All categories" : category}
            <span>{isOpen ? "▲" : "▼"}</span>
          </button>

          {isOpen && (
            <div className="absolute  left-0 top-full z-10 mt-2 w-full max-w-md rounded-lg border border-gray-700 bg-gray-900 p-1 shadow-lg  ">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className="w-full rounded-md px-4 py-3 text-left text-white transition  hover:bg-gray-800 "
                  onClick={() => {
                    setCategory(category);
                    setIsOpen(false);
                  }}
                >
                  {category === "all" ? "All categories" : category}
                </button>
              ))}
            </div>
          )}
        </div>

        <div ref={sortDropdownRef} className="relative w-full max-w-md">
          <button
            type="button"
            onClick={() => {
              setIsSortOpen(!isSortOpen);
              setIsOpen(false);
            }}
            className="flex w-full items-center justify-between rounded-lg border border-gray-300 px-4 py-2 text-left text-white outline-none transition hover:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            {sort === "default"
              ? "Sort by"
              : sort === "price-asc"
                ? "Price: Low to High"
                : "Price: High to Low"}

            <span>{isSortOpen ? "▲" : "▼"}</span>
          </button>

          {isSortOpen && (
            <div className="absolute left-0 top-full z-10 mt-2 w-full rounded-lg border border-gray-700 bg-gray-900 p-1 shadow-lg">
              <button
                type="button"
                onClick={() => {
                  setSort("default");
                  setIsSortOpen(false);
                }}
                className="w-full rounded-md px-4 py-3 text-left text-white hover:bg-gray-800"
              >
                Default
              </button>

              <button
                type="button"
                onClick={() => {
                  setSort("price-asc");
                  setIsSortOpen(false);
                }}
                className="w-full rounded-md px-4 py-3 text-left text-white hover:bg-gray-800"
              >
                Price: Low to High
              </button>

              <button
                type="button"
                onClick={() => {
                  setSort("price-desc");
                  setIsSortOpen(false);
                }}
                className="w-full rounded-md px-4 py-3 text-left text-white hover:bg-gray-800"
              >
                Price: High to Low
              </button>
            </div>
          )}
        </div>
      </div>

      {sortedProducts.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          No products found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
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
