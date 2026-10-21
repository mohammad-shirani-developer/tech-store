"use client";

import { useCart } from "../context/CartContext";
import type { Product } from "../lib/api";

type AddToCartButtonProps = {
  product: Product;
  className?: string;
};

const AddToCartButton = ({
  product,
  className = "",
}: AddToCartButtonProps) => {
  const { addToCart } = useCart();

  const isOutOfStock = product.stock <= 0;

  return (
    <button
      type="button"
      onClick={() => addToCart(product)}
      disabled={isOutOfStock}
      className={`w-full rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {isOutOfStock ? "Out of Stock" : "Add to Cart"}
    </button>
  );
};

export default AddToCartButton;
