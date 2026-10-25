import type { Metadata } from "next";
import ProductDetails from "@/app/components/ProductDetails";
import { pageContainerClasses } from "@/app/components/ui/styles";
import { getProductById } from "@/app/lib/api";
import { notFound } from "next/navigation";

type ProductDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

/* ISR: the product data refreshes at most every 5 minutes instead of
   firing upstream DummyJSON requests on every visit. */
export const revalidate = 300;

/* Product pages are the money pages for SEO/sharing: title, storyline and
   the product photo go into the metadata (same fetch is request-memoized
   with the page render, so nothing extra hits the API). */
export async function generateMetadata({
  params,
}: ProductDetailsPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const product = await getProductById(id);

    if (!product) {
      return { title: "Product not found" };
    }

    const description =
      product.description.trim() ||
      `Buy ${product.title} at TechStore — fast shipping and easy returns.`;
    const imageUrl = product.image || undefined;

    return {
      title: product.title,
      description: description.slice(0, 200),
      openGraph: {
        title: product.title,
        description: description.slice(0, 200),
        images: imageUrl ? [imageUrl] : undefined,
      },
    };
  } catch {
    return { title: "Product details" };
  }
}

const ProductDetailsPage = async ({ params }: ProductDetailsPageProps) => {
  const { id } = await params;

  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <main className={pageContainerClasses}>
      <ProductDetails product={product} />
    </main>
  );
};

export default ProductDetailsPage;
