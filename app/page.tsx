import Header from "./components/Header";
import ProductCard from "./components/ProductCard";
import { getProducts } from "./lib/api";

export default async function Home() {
  const products = await getProducts();
  return (
    <main>
      <Header title="TechStore" />

      <section className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="mb-4">Featured Products</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              title={product.title}
              price={product.price}
              imageUrl={product.image}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
