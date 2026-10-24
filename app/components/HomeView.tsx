"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { getProducts, type Product } from "../lib/api";
import ErrorState from "./ErrorState";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ProductCardSkeleton";

const LATEST_COUNT = 8;

/* Deterministic pick: the first product of the first two categories,
   so the hero always shows real fetched products with variety. */
const pickHeroProducts = (products: Product[]): Product[] => {
  const picked: Product[] = [];
  const seenCategories = new Set<string>();

  for (const product of products) {
    if (!seenCategories.has(product.category)) {
      seenCategories.add(product.category);
      picked.push(product);
    }

    if (picked.length === 2) {
      break;
    }
  }

  return picked.length > 0 ? picked : products.slice(0, 2);
};

type HomeViewProps = {
  /** Server-fetched catalog used as the query's initial data (SSR). */
  products: Product[];
};

const HomeView = ({ products: initialProducts }: HomeViewProps) => {
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["products"],
    // Forward TanStack's signal so unmounting/superseded queries actually
    // cancel the five upstream category requests.
    queryFn: ({ signal }) => getProducts(signal),
    initialData: initialProducts,
    staleTime: 1000 * 60 * 5,
  });

  const products = data ?? [];

  /* "Latest" = highest ids (DummyJSON ids grow with the catalog) — the raw
     merge order is by category, which made this row all laptops. */
  const latestProducts = [...products]
    .sort((a, b) => b.id - a.id)
    .slice(0, LATEST_COUNT);

  const heroProducts = pickHeroProducts(products);

  return (
    <>
      {/* Hero banner (navy in both themes) */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white shadow-2xl">
        {/* Decorative radial glows */}
        <div
          className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute -bottom-24 -right-16 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col-reverse items-center gap-10 px-6 py-12 sm:px-12 lg:flex-row lg:justify-between">
          <div className="max-w-xl text-center lg:text-left">
            <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
              Upgrade Your
              <br />
              <span className="text-blue-400">Tech Life</span>
            </h1>

            <p className="mt-4 max-w-md max-lg:mx-auto text-lg text-gray-300">
              Discover the latest gadgets, laptops, phones and more at the best
              prices.
            </p>

            <div className="mt-8">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-3 font-semibold shadow-lg shadow-blue-600/30 transition-transform hover:-translate-y-0.5 hover:bg-blue-500"
              >
                Shop Now
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </Link>
            </div>
          </div>

          {/* Collage of real product images (hidden on small screens) */}
          {heroProducts.length > 0 && (
            <div
              className="relative hidden h-72 w-96 shrink-0 lg:block"
              aria-hidden="true"
            >
              {heroProducts[0] && (
                <div className="absolute left-0 top-10 h-44 w-44 -rotate-6 overflow-hidden rounded-xl bg-white/95 p-2 shadow-2xl ring-1 ring-white/20">
                  <Image
                    src={heroProducts[0].image}
                    alt=""
                    fill
                    priority
                    sizes="176px"
                    className="object-contain"
                  />
                </div>
              )}

              {heroProducts[1] && (
                <div className="absolute right-0 top-0 h-48 w-48 rotate-6 overflow-hidden rounded-xl bg-white/95 p-2 shadow-2xl ring-1 ring-white/20">
                  <Image
                    src={heroProducts[1].image}
                    alt=""
                    fill
                    priority
                    sizes="192px"
                    className="object-contain"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Latest products */}
      <section className="mt-12">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Latest Products
          </h2>

          <Link
            href="/products"
            className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            View All &rarr;
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: LATEST_COUNT }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} retrying={isFetching} />
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {latestProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} priority={index < 4} />
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default HomeView;
