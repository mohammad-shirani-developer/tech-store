import { getProductById } from "@/app/lib/api";
import Image from "next/image";
import { notFound } from "next/navigation";

type ProductDetailsPageProps = {
  params: {
    id: string;
  };
};

const ProductDetailsPage = async ({ params }: ProductDetailsPageProps) => {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="flex h-[500px] items-center justify-center rounded-lg  p-6">
          <Image
            src={product.image}
            alt={product.title}
            width={500}
            height={500}
            className="h-full w-full object-center"
          />
        </div>

        <div className="flex flex-col justify-center">
          <h1 className="text-2xl font-bold leading-tight">{product.title}</h1>
          <p className=" mt-6 text-2xl font-bold">
            ${product.price.toFixed(2)}
          </p>

          <p className="mt-4  max-w-xl leading-7 text-gray-600">
            {product.description}
          </p>

          <p className="mt-6 text-sm text-gray-500">
            Category: {product.category}
          </p>

          <div className="mt-6 border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-500">Rating</p>

            <div className="mt-1 flex items-center gap-2">
              <span className="text-xl font-bold">★ {product.rating.rate}</span>

              <span className="text-sm text-gray-500">
                {product.rating.count} reviews
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
