import Image from "next/image";
import Link from "next/link";

type ProductCardProps = {
  id: number;
  title: string;
  price: number;
  imageUrl?: string;
};

const ProductCard = ({ id, title, price, imageUrl }: ProductCardProps) => {
  return (
    <Link href={`/products/${id}`}>
      <article className="flex flex-col items-center gap-2 rounded-lg border border-gray-800 bg-gray-950 p-4 transition duration-200 hover:-translate-y-1 hover:border-gray-600 hover:shadow-lg">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={title}
            width={300}
            height={225}
            className="aspect-[4/3] w-full object-contain p-4"
          />
        )}
        <h3 className="font-semibold">{title}</h3>
        <p className="text-lg font-bold">${price.toFixed(2)}</p>
      </article>
    </Link>
  );
};

export default ProductCard;
