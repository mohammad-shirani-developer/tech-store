import Header from "./components/Header";
import ProductCard from "./components/ProductCard";

const products = [
  { id: 1, title: "Laptop", price: 999.99 },
  { id: 2, title: "Smartphone", price: 699.99 },
  { id: 3, title: "Headphones", price: 199.99 },
];

export default function Home() {
  return (
    <main>
      <Header title="TechStore" />
      <p>My first Next.js project</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            title={product.title}
            price={product.price}
          />
        ))}
      </div>
    </main>
  );
}
