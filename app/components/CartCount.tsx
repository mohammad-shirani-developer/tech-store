"use client";

import { useCart } from "../context/CartContext";

const CartCount = () => {
  const { cart, isHydrated } = useCart();

  if (!isHydrated || cart.length === 0) {
    return null;
  }

  return (
    <span
      aria-hidden="true"
      className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white"
    >
      {cart.length}
    </span>
  );
};

export default CartCount;
