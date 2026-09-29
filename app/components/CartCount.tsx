"use client";

import { useCart } from "../context/CartContext";

const CartCount = () => {
  const { cart, isHydrated } = useCart();

  if (!isHydrated) {
    return (
      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-500 px-1 text-xs font-bold text-white">
        ...
      </span>
    );
  }

  return (
    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-500 px-1 text-xs font-bold text-white">
      {cart.length}
    </span>
  );
};

export default CartCount;
