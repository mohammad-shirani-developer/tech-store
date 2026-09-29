"use client";

import { useCart } from "../context/CartContext";
import { Product } from "../lib/api";

type AddToCartButtonProps = {
  product: Product;
};

const AddToCartButton = ({ product }: AddToCartButtonProps) => {
  const { addToCart } = useCart();
  return (
    <button
      onClick={() => addToCart(product)}
      className="mt-6 w-full rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition hover:bg-blue-600 active:scale-[0.98] md:w-fit"
    >
      Add to Cart
    </button>
  );
};

export default AddToCartButton;
