import { TECH_CATEGORIES, type TechCategory } from "./categories";

export type ProductDimensions = {
  width: number;
  height: number;
  depth: number;
};

export type ProductReview = {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
};

export type Product = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  /* Real DummyJSON fields (list + detail endpoints). */
  images: string[];
  brand: string | null;
  rating: number;
  reviewCount: number;
  discountPercentage: number;
  stock: number;
  availabilityStatus: string;
  /* Detail-only fields (present on /products/:id). */
  reviews?: ProductReview[];
  sku?: string;
  weight?: number;
  dimensions?: ProductDimensions;
  warrantyInformation?: string;
  shippingInformation?: string;
  returnPolicy?: string;
  tags?: string[];
};

type DummyProduct = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  images: string[];
  brand?: string;
  rating: number;
  reviews?: ProductReview[];
  discountPercentage?: number;
  stock?: number;
  availabilityStatus?: string;
  sku?: string;
  weight?: number;
  dimensions?: ProductDimensions;
  warrantyInformation?: string;
  shippingInformation?: string;
  returnPolicy?: string;
  tags?: string[];
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

/**
 * Pure mapper from the raw DummyJSON product to the app Product shape.
 * Only real API fields are mapped — nothing is invented.
 */
export const mapDummyProductToProduct = (
  product: DummyProduct,
): Product => {
  return {
    id: product.id,
    title: product.title,
    price: product.price,
    description: product.description,
    category: product.category,
    image: product.images[0] ?? "",
    images: product.images,
    brand: product.brand ?? null,
    rating: product.rating,
    reviewCount: product.reviews?.length ?? 0,
    discountPercentage: product.discountPercentage ?? 0,
    stock: product.stock ?? 0,
    availabilityStatus: product.availabilityStatus ?? "",
    reviews: product.reviews,
    sku: product.sku,
    weight: product.weight,
    dimensions: product.dimensions,
    warrantyInformation: product.warrantyInformation,
    shippingInformation: product.shippingInformation,
    returnPolicy: product.returnPolicy,
    tags: product.tags,
  };
};

/**
 * TechStore only sells tech, so products are fetched per tech category
 * (in parallel) and merged — instead of pulling every DummyJSON product
 * (cosmetics, groceries, ...).
 */
export async function getProducts(): Promise<Product[]> {
  try {
    const responses = await Promise.all(
      TECH_CATEGORIES.map((category) =>
        requestJson<DummyProductsResponse>(
          /* limit=0 returns every product of the category (DummyJSON
             would otherwise cap the response at its default page size). */
          `https://dummyjson.com/products/category/${category}?limit=0`,
        ),
      ),
    );

    /* Merge category results, deduplicating by id (Map keeps first
       occurrence, preserving TECH_CATEGORIES order). */
    const productsById = new Map<number, Product>();

    for (const response of responses) {
      for (const product of response.products) {
        if (!productsById.has(product.id)) {
          productsById.set(product.id, mapDummyProductToProduct(product));
        }
      }
    }

    return [...productsById.values()];
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

    const mapped = mapDummyProductToProduct(product);

    /* The store only sells tech — a direct link to any other DummyJSON
       category (fragrances, groceries, ...) is a 404, keeping the catalog
       consistent between the listing and the detail pages. */
    if (!TECH_CATEGORIES.includes(mapped.category as TechCategory)) {
      return null;
    }

    return mapped;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}
