"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { getCategoryDisplayName } from "../lib/categories";
import type { Product } from "../lib/api";
import AddToCartButton from "./AddToCartButton";
import Stars from "./ui/Stars";
import { focusRingClasses } from "./ui/styles";

const HEART_ICON =
  "M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z";

type ProductCardProps = {
  product: Product;
};

const ProductCard = ({ product }: ProductCardProps) => {
  /* Visual-only wishlist toggle (mockup detail; no persisted data). */
  const [isWishlisted, setIsWishlisted] = useState(false);

  /* Mockup's small meta line: brand when known, else the category. */
  const metaLine = product.brand ?? getCategoryDisplayName(product.category);

  return (
    <article className="group flex flex-col rounded-xl border border-gray-100 bg-white p-4 shadow-[var(--card-shadow)] transition duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900">
      <div className="relative mb-4">
        <Link
          href={`/products/${product.id}`}
          aria-label={product.title}
          className="block aspect-square overflow-hidden rounded-lg bg-gray-50 dark:bg-white/5"
        >
          {product.image && (
            <Image
              src={product.image}
              alt={product.title}
              fill
              sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 50vw, 50vw"
              className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
            />
          )}
        </Link>

        <button
          type="button"
          onClick={() => setIsWishlisted((wishlisted) => !wishlisted)}
          aria-pressed={isWishlisted}
          aria-label={
            isWishlisted
              ? `Remove ${product.title} from wishlist`
              : `Add ${product.title} to wishlist`
          }
          className={`absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm ring-1 ring-gray-200 backdrop-blur transition hover:scale-105 dark:bg-gray-900/90 dark:ring-gray-700 ${focusRingClasses}`}
        >
          <svg
            className={`h-4 w-4 transition-colors ${
              isWishlisted ? "text-red-500" : "text-gray-400"
            }`}
            viewBox="0 0 24 24"
            fill={isWishlisted ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={1.8}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d={HEART_ICON} />
          </svg>
        </button>
      </div>

      <Link
        href={`/products/${product.id}`}
        className="line-clamp-2 text-sm font-semibold text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
      >
        {product.title}
      </Link>

      <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
        {metaLine}
      </p>

      <div className="mt-2 flex items-center gap-1.5">
        <Stars rating={product.rating} />

        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
          {product.rating.toFixed(1)}
        </span>
      </div>

      <div className="mt-2 text-lg font-bold text-gray-900 dark:text-white">
        ${product.price.toFixed(2)}
      </div>

      <AddToCartButton product={product} className="mt-3" />
    </article>
  );
};

export default ProductCard;
