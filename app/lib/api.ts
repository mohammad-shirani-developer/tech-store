export type Product = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
};

type DummyProduct = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  images: string[];
  rating: number;
  reviews?: {
    rating: number;
    comment: string;
  }[];
};

type DummyProductsResponse = {
  products: DummyProduct[];
};

function mapDummyProductToProduct(product: DummyProduct): Product {
  return {
    id: product.id,
    title: product.title,
    price: product.price,
    description: product.description,
    category: product.category,
    image: product.images[0] ?? "",
    rating: {
      rate: product.rating,
      count: product.reviews?.length ?? 0,
    },
  };
}

export async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch("https://dummyjson.com/products");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: DummyProductsResponse = await response.json();

    return data.products.map(mapDummyProductToProduct);
  } catch (error) {
    console.error("Error fetching products", error);
    throw error;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  const response = await fetch(`https://dummyjson.com/products/${id}`);

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }

    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const product: DummyProduct = await response.json();

  return mapDummyProductToProduct(product);
}
