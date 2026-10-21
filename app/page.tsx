import HomeView from "./components/HomeView";
import { pageContainerClasses } from "./components/ui/styles";
import { getProducts } from "./lib/api";

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
