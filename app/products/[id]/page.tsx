import ProductDetails from "@/app/components/ProductDetails";
import { pageContainerClasses } from "@/app/components/ui/styles";
import { getProductById } from "@/app/lib/api";
import { notFound } from "next/navigation";

type ProductDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

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
