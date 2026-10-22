/**
 * Single money formatter for every price display in the store, so cards,
 * the cart, checkout and the confirmation always render identical currency
 * strings (the sidebar slider keeps its own integer formatting on purpose).
 */
const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const formatPrice = (value: number): string =>
  priceFormatter.format(value);
