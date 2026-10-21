// Session storage key for the last placed order (demo store only).
export const ORDER_SESSION_KEY = "lastOrder";

// Generates a short demo order number, e.g. "ORD-12345678".
export const createOrderNumber = () => {
  return `ORD-${Date.now().toString().slice(-8)}`;
};
