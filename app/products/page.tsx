import ProductList from "../components/ProductList";

export default function ProductsPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Products</h1>

      <ProductList />
    </main>
  );
}
