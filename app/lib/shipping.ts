/**
 * Shipping rule shared by the cart and checkout pages so both always
 * agree on fees and totals.
 */

export const FREE_SHIPPING_THRESHOLD = 100;
export const SHIPPING_FEE = 9.99;

/** Shipping cost for a subtotal: free at/above the threshold, else flat fee. */
export const getShippingCost = (subtotal: number): number => {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
};

export const formatShipping = (shipping: number): string => {
  return shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`;
};
