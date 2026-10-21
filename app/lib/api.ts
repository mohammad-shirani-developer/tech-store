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

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const requestJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new ApiError(
      `HTTP error! status: ${response.status}`,
      response.status,
    );
  }

  return (await response.json()) as T;
};

export const mapDummyProductToProduct = (product: DummyProduct): Product => {
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
};

export async function getProducts(): Promise<Product[]> {
  try {
    const data = await requestJson<DummyProductsResponse>(
      "https://dummyjson.com/products",
    );

    return data.products.map(mapDummyProductToProduct);
  } catch (error) {
    console.error("Error fetching products", error);
    throw error;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const product = await requestJson<DummyProduct>(
      `https://dummyjson.com/products/${id}`,
    );

    return mapDummyProductToProduct(product);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}
