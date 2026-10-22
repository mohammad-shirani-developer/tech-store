import { Suspense } from "react";
import type { Metadata } from "next";

import ProductList from "../components/ProductList";
import { ProductCardGridSkeleton } from "../components/ProductCardSkeleton";
import { pageContainerClasses } from "../components/ui/styles";
import { getProducts } from "../lib/api";

export const metadata: Metadata = {
  title: "All Products",
  description:
    "Browse every laptop, phone and gadget in the store — filter by brand, category and price.",
};

type ProductsPageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

const ProductsPage = async ({ searchParams }: ProductsPageProps) => {
  const { q } = await searchParams;

  const initialSearch = (Array.isArray(q) ? q[0] : q) ?? "";

  /* Server-fetched catalog (initialData for TanStack Query) so filters,
     counts and cards are server-rendered. */
  const products = await getProducts();

  /* Keying on the query re-mounts ProductList so header search (?q=...)
     re-seeds the search state (read client-side via useSearchParams)
     on every navigation. The Suspense boundary covers useSearchParams
     during prerendering (Next.js requirement). */
  return (
    <main className={pageContainerClasses}>
      <Suspense fallback={<ProductCardGridSkeleton />}>
        <ProductList key={initialSearch} products={products} />
      </Suspense>
    </main>
  );
};

export default ProductsPage;
