import Header from "./components/Header";
import ProductList from "./components/ProductList";

export default async function Home() {
  return (
    <main>
      <Header title="TechStore" />

      <section className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="mb-4">Featured Products</h2>

        <ProductList />
      </section>
    </main>
  );
}
