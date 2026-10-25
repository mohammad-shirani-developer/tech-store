import Stripe from "stripe";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getProductById } from "../../lib/api";
import { createOrderNumber } from "../../lib/order";
import { getShippingCost } from "../../lib/shipping";
import { shippingFormSchema } from "../../lib/validation";

/* Stripe Checkout needs the Node runtime (the SDK is server-only and the
   route talks to the DummyJSON API to re-price every line). */
export const runtime = "nodejs";

/* Max quantities per line keep a hostile client from ordering 1e9 units —
   the stock check below is the real guard, this just bounds the request. */
const checkoutRequestSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.number().int().positive(),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1, "Cart is empty")
    .max(50),
  /* The shipping form schema is shared verbatim: the API rejects anything
     the browser form would have rejected, so client and server agree. */
  customer: shippingFormSchema,
});

type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;

const getStripeSecretKey = () => process.env.STRIPE_SECRET_KEY?.trim() ?? "";

const originFromRequest = (request: Request) => {
  const origin = request.headers.get("origin");

  if (origin) {
    return origin;
  }

  return new URL(request.url).origin;
};

/** GET — tells the checkout page whether real Stripe payments are enabled
 *  or the demo fallback should be used. Always 200 so the page can render
 *  its button state even without any configuration. */
export async function GET() {
  return NextResponse.json({
    stripeEnabled: Boolean(getStripeSecretKey()),
  });
}

/** POST — creates a Stripe Checkout Session for the cart.
 *
 *  Security: the client only sends product IDs and quantities. Prices are
 *  re-read from the DummyJSON API on the server, so a tampered request
 *  cannot buy a $1,599 iPhone for $0.01. Stock is re-checked too.
 *
 *  When STRIPE_SECRET_KEY is missing the route answers 503 and the checkout
 *  page falls back to its simulated demo order, so the store keeps working
 *  with zero configuration. */
export async function POST(request: Request) {
  const secretKey = getStripeSecretKey();

  if (!secretKey) {
    return NextResponse.json(
      { error: "stripe_not_configured" },
      { status: 503 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = checkoutRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_request" },
      { status: 400 },
    );
  }

  const { items, customer } = parsed.data as CheckoutRequest;

  // Re-price every line server-side (never trust client prices).
  type PricedLine = { product: NonNullable<Awaited<ReturnType<typeof getProductById>>>; quantity: number };
  const lines: PricedLine[] = [];

  for (const item of items) {
    const product = await getProductById(String(item.id));

    if (!product) {
      return NextResponse.json(
        { error: "product_not_found", productId: item.id },
        { status: 400 },
      );
    }

    if (product.stock < item.quantity) {
      return NextResponse.json(
        { error: "insufficient_stock", productId: item.id },
        { status: 409 },
      );
    }

    lines.push({ product, quantity: item.quantity });
  }

  const subtotal =
    Math.round(
      lines.reduce(
        (sum, line) => sum + line.product.price * line.quantity,
        0,
      ) * 100,
    ) / 100;
  const shipping = getShippingCost(subtotal);
  const total = Math.round((subtotal + shipping) * 100) / 100;

  /* Stripe wants integer amounts in cents. DummyJSON prices are USD, the
     same currency the whole UI already shows. */
  const lineItems = lines.map((line) => ({
    quantity: line.quantity,
    price_data: {
      currency: "usd",
      unit_amount: Math.round(line.product.price * 100),
      product_data: {
        name: line.product.title,
        ...(line.product.image ? { images: [line.product.image] } : {}),
      },
    },
  }));

  if (shipping > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: Math.round(shipping * 100),
        product_data: { name: "Shipping" },
      },
    });
  }

  const orderNumber = createOrderNumber();

  // Metadata values must be strings (max 500 chars each).
  const metadata = {
    orderNumber,
    fullName: customer.fullName.slice(0, 500),
    phone: customer.phone.slice(0, 500),
    address: customer.address.slice(0, 500),
    city: customer.city.slice(0, 500),
    postalCode: customer.postalCode.slice(0, 500),
  };

  try {
    const stripe = new Stripe(secretKey);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      customer_email: customer.email,
      metadata,
      success_url: `${originFromRequest(request)}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${originFromRequest(request)}/checkout?canceled=1`,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "stripe_error" },
        { status: 502 },
      );
    }

    return NextResponse.json({
      url: session.url,
      orderNumber,
      total,
    });
  } catch (error) {
    console.error("Stripe Checkout Session failed:", error);

    return NextResponse.json({ error: "stripe_error" }, { status: 502 });
  }
}
