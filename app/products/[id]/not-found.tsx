import NotFoundState from "@/app/components/NotFoundState";

const ProductNotFound = () => {
  return (
    <NotFoundState
      heading="Product not found"
      message="The product you are looking for doesn't exist."
      ctaHref="/products"
    />
  );
};

export default ProductNotFound;
