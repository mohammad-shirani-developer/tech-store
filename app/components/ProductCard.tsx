type ProductCardProps = {
  title: string;
  price: number;
  imageUrl?: string;
};

const ProductCard = ({ title, price, imageUrl }: ProductCardProps) => {
  return (
    <article className="flex flex-col items-center gap-2 rounded-lg border border-gray-300 p-4 ">
      {imageUrl && (
        <img
          src={imageUrl}
          alt={title}
          className="aspect-[4/3] w-full object-contain p-4"
        />
      )}
      <h3>{title}</h3>
      <p>${price.toFixed(2)}</p>
    </article>
  );
};

export default ProductCard;
