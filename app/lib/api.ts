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

/* Runtime override of the API base URL (server-side only — non-public env
   vars never reach the browser, which keeps calling dummyjson.com). Used to
   simulate API outages in E2E tests and to support self-hosted proxies. */
const API_BASE_URL =
  process.env.DUMMYJSON_BASE_URL ?? "https://dummyjson.com";

const REQUEST_TIMEOUT_MS = 10_000;
const RETRY_DELAYS_MS = [500, 1000];

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/* Timeouts and network failures are transient — retry them. A 4xx ApiError
   is permanent (bad id, missing product) — retrying cannot help. */
const isRetryableError = (error: unknown) => {
  if (error instanceof ApiError) {
    return error.status >= 500;
  }

  return true;
};

/**
 * Fetch JSON with a hard timeout and transient-failure retries (the same
 * strategy as the movie-explorer Cinemeta layer): network errors, timeouts
 * and 5xx responses are retried with backoff, while 4xx responses fail
 * immediately.
 */
const requestJson = async <T>(url: string): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    if (attempt > 0) {
      await sleep(RETRY_DELAYS_MS[attempt - 1]);
    }

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (!response.ok) {
        throw new ApiError(
          `HTTP error! status: ${response.status}`,
          response.status,
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      lastError = error;

      if (!isRetryableError(error)) {
        throw error;
      }
    }
  }

  throw lastError;
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
          `${API_BASE_URL}/products/category/${category}?limit=0`,
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
      `${API_BASE_URL}/products/${id}`,
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
