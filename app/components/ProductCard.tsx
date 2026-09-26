type ProductCardProps = {
  title: string;
  price: number;
};

const ProductCard = ({ title, price }: ProductCardProps) => {
  return (
    <article className="flex flex-col  items-center justify-center gap-2 rounded-lg border border-gray-300 p-4 ">
      <h3>{title}</h3>
      <p>${price.toFixed(2)}</p>
    </article>
  );
};

export default ProductCard;
