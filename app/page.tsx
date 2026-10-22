import type { Metadata } from "next";

import HomeView from "./components/HomeView";
import { pageContainerClasses } from "./components/ui/styles";
import { getProducts } from "./lib/api";

export const metadata: Metadata = {
  title: "Upgrade Your Tech Life",
  description:
    "Shop the latest laptops, phones and gadgets at the best prices.",
};

/* The catalog changes rarely: cache the server payload for 5 minutes instead
   of firing five upstream category requests on every visitor's render. */
export const revalidate = 300;

/* The catalog is fetched on the server so the hero and product cards are
   server-rendered; TanStack Query picks it up as initialData. */
export default async function Home() {
  const products = await getProducts();

  return (
    <main className={pageContainerClasses}>
      <HomeView products={products} />
    </main>
  );
}
