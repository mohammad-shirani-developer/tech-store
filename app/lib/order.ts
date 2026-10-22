// Session storage key for the last placed order (demo store only).
export const ORDER_SESSION_KEY = "lastOrder";

export type PlacedOrder = {
  number: string;
  total: number;
  name: string;
};

/* Generates a short demo order number, e.g. "ORD-9f3c1a82". UUID-based so
   two tabs checking out in the same millisecond can never collide (the old
   Date.now().slice(-8) suffix could). */
export const createOrderNumber = () => {
  const unique =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 8)
      : Date.now().toString().slice(-8);

  return `ORD-${unique}`;
};

const isPlacedOrder = (value: unknown): value is PlacedOrder => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const order = value as PlacedOrder;

  return (
    typeof order.number === "string" &&
    order.number.length > 0 &&
    typeof order.total === "number" &&
    Number.isFinite(order.total) &&
    typeof order.name === "string"
  );
};

/** Persists the order; false when sessionStorage is unavailable. */
export const savePlacedOrder = (order: PlacedOrder): boolean => {
  try {
    sessionStorage.setItem(ORDER_SESSION_KEY, JSON.stringify(order));
    return true;
  } catch {
    return false;
  }
};

/** Reads and validates the placed order; corrupt data reads as "no order". */
export const readPlacedOrder = (): PlacedOrder | null => {
  try {
    const raw = sessionStorage.getItem(ORDER_SESSION_KEY);

    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);

    return isPlacedOrder(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const clearPlacedOrder = () => {
  try {
    sessionStorage.removeItem(ORDER_SESSION_KEY);
  } catch {
    // Nothing depends on the cleanup succeeding.
  }
};
