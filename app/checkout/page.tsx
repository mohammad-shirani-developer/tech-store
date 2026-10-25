"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useCart } from "../context/CartContext";
import { useLocationSearch } from "../hooks/useLocationSearch";
import {
  focusRingClasses,
  inputClasses,
  inputErrorClasses,
  pageContainerClasses,
  primaryButtonClasses,
} from "../components/ui/styles";
import { formatPrice } from "../lib/format";
import { createOrderNumber, savePlacedOrder } from "../lib/order";
import { formatShipping, getShippingCost } from "../lib/shipping";
import {
  shippingFormSchema,
  type ShippingFormValues,
} from "../lib/validation";

type FieldErrorLike = {
  message?: string;
};

const FieldErrorMessage = ({ error }: { error?: FieldErrorLike }) => {
  if (!error?.message) {
    return null;
  }

  return (
    <p className="mt-1.5 text-sm text-red-600 dark:text-red-400" role="alert">
      {error.message}
    </p>
  );
};

type CheckoutSessionResponse = {
  url?: string;
  orderNumber?: string;
  total?: number;
  error?: string;
};

const CheckoutPage = () => {
  const { cart, getCartTotal, isHydrated } = useCart();
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  /* null = still checking, true = real Stripe Checkout, false = demo mode. */
  const [stripeEnabled, setStripeEnabled] = useState<boolean | null>(null);

  /* Derived from the URL (no setState-in-effect): arriving back from a
     canceled Stripe Checkout keeps the cart — tell the customer instead of
     showing a mysterious clean form. */
  const search = useLocationSearch();
  const notice =
    new URLSearchParams(search).get("canceled") === "1"
      ? "Payment canceled — your cart is untouched. You can try again whenever you are ready."
      : null;

  useEffect(() => {
    let active = true;

    // Does the server have a Stripe test key? Decides the button label and
    // which checkout path the submit takes (real vs simulated demo).
    fetch("/api/checkout-session")
      .then((response) =>
        response.ok ? response.json() : { stripeEnabled: false },
      )
      .then((data: { stripeEnabled?: boolean }) => {
        if (active) {
          setStripeEnabled(Boolean(data.stripeEnabled));
        }
      })
      .catch(() => {
        if (active) {
          setStripeEnabled(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
    },
  });

  const subtotal = getCartTotal();
  const shipping = getShippingCost(subtotal);
  const total = subtotal + shipping;

  /* Simulated demo order — the fallback used when the server has no Stripe
     test key configured. Kept from the original checkout flow. */
  const placeDemoOrder = async (values: ShippingFormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // total = subtotal + shipping so the stored amount matches the
    // summary the customer confirmed (demo store: no real backend).
    const order = {
      number: createOrderNumber(),
      total,
      name: values.fullName,
    };

    try {
      const saved = savePlacedOrder(order);

      if (!saved) {
        setSubmitError("Could not save your order. Please try again.");
        return;
      }
    } catch {
      setSubmitError("Could not save your order. Please try again.");
      return;
    }

    // Navigate FIRST and let the confirmation page empty the cart: clearing
    // before the App Router navigation committed used to flash the "Your
    // cart is empty" state on slow transitions.
    router.push("/checkout/success");
  };

  const onSubmit = async (values: ShippingFormValues) => {
    setSubmitError(null);

    /* The client only sends product IDs and quantities — the API re-prices
       every line from the real catalog server-side. */
    const payload = {
      items: cart.map((item) => ({ id: item.id, quantity: item.quantity })),
      customer: values,
    };

    try {
      const response = await fetch("/api/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // 503 = the server has no Stripe test key: run the demo flow.
      if (response.status === 503) {
        await placeDemoOrder(values);
        return;
      }

      if (response.ok) {
        const data = (await response.json()) as CheckoutSessionResponse;

        if (!data.url || !data.orderNumber || typeof data.total !== "number") {
          setSubmitError("Could not start the payment. Please try again.");
          return;
        }

        // sessionStorage survives the external redirect to Stripe, so the
        // confirmation page can show the order details on the way back.
        const saved = savePlacedOrder({
          number: data.orderNumber,
          total: data.total,
          name: values.fullName,
        });

        if (!saved) {
          setSubmitError("Could not save your order. Please try again.");
          return;
        }

        // Stripe Checkout is an external hosted page — a full browser
        // navigation is required (router.push cannot leave the app).
        window.location.assign(data.url);
        return;
      }

      const data = (await response.json().catch(() => null)) as
        | CheckoutSessionResponse
        | null;

      if (data?.error === "insufficient_stock") {
        setSubmitError(
          "Some items in your cart just ran out of stock. Please review your cart and try again.",
        );
        return;
      }

      setSubmitError("Could not start the payment. Please try again.");
    } catch {
      setSubmitError("Could not start the payment. Please try again.");
    }
  };

  if (!isHydrated) {
    return (
      <main className={pageContainerClasses}>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Checkout</h1>

        <div className="mt-12 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">Loading checkout...</p>
        </div>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className={pageContainerClasses}>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Checkout</h1>

        <div className="mt-12 flex flex-col items-center justify-center text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Your cart is empty</h2>

          <p className="mt-3 text-gray-500 dark:text-gray-400">
            Add some products to your cart before checking out.
          </p>

          <Link href="/products" className={`${primaryButtonClasses} mt-6 px-6 py-3`}>
            Back to Products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={pageContainerClasses}>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Checkout</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Shipping Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-[var(--card-shadow)] dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Shipping Details</h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="fullName"
                  className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Ali Ahmadi"
                  aria-invalid={Boolean(errors.fullName)}
                  {...register("fullName")}
                  className={`${inputClasses} ${errors.fullName ? inputErrorClasses : ""}`}
                />
                <FieldErrorMessage error={errors.fullName} />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="ali@example.com"
                  aria-invalid={Boolean(errors.email)}
                  {...register("email")}
                  className={`${inputClasses} ${errors.email ? inputErrorClasses : ""}`}
                />
                <FieldErrorMessage error={errors.email} />
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="09123456789"
                  aria-invalid={Boolean(errors.phone)}
                  {...register("phone")}
                  className={`${inputClasses} ${errors.phone ? inputErrorClasses : ""}`}
                />
                <FieldErrorMessage error={errors.phone} />
              </div>

              {/* Street Address */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="address"
                  className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Street Address
                </label>
                <input
                  id="address"
                  type="text"
                  autoComplete="street-address"
                  placeholder="Valiasr Street, No. 10, Unit 4"
                  aria-invalid={Boolean(errors.address)}
                  {...register("address")}
                  className={`${inputClasses} ${errors.address ? inputErrorClasses : ""}`}
                />
                <FieldErrorMessage error={errors.address} />
              </div>

              {/* City */}
              <div>
                <label
                  htmlFor="city"
                  className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-white"
                >
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  autoComplete="address-level2"
                  placeholder="Tehran"
                  aria-invalid={Boolean(errors.city)}
                  {...register("city")}
                  className={`${inputClasses} ${errors.city ? inputErrorClasses : ""}`}
                />
                <FieldErrorMessage error={errors.city} />
              </div>

              {/* Postal Code */}
              <div>
                <label
                  htmlFor="postalCode"
                  className="mb-1.5 block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Postal Code
                </label>
                <input
                  id="postalCode"
                  type="text"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  placeholder="1234567890"
                  aria-invalid={Boolean(errors.postalCode)}
                  {...register("postalCode")}
                  className={`${inputClasses} ${errors.postalCode ? inputErrorClasses : ""}`}
                />
                <FieldErrorMessage error={errors.postalCode} />
              </div>
            </div>

            {notice && (
              <p
                className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
                role="status"
              >
                {notice}
              </p>
            )}

            {submitError && (
              <p className="mt-4 text-sm text-red-600 dark:text-red-400" role="alert">
                {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`mt-6 w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-10 ${focusRingClasses}`}
            >
              {isSubmitting
                ? "Placing order..."
                : stripeEnabled
                  ? "Pay with card"
                  : "Place Order"}
            </button>

            {stripeEnabled === false && (
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                Stripe test keys are not configured — orders are simulated in
                demo mode (see .env.example to enable Stripe Checkout).
              </p>
            )}
          </section>
        </form>

        {/* Order Summary */}
        <aside
          aria-label="Order summary"
          className="h-fit rounded-xl border border-gray-200 bg-white p-6 shadow-[var(--card-shadow)] dark:border-gray-800 dark:bg-gray-900 lg:sticky lg:top-24"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Order Summary</h2>

          <ul className="mt-6 space-y-4">
            {cart.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-4 text-sm"
              >
                <span className="min-w-0 flex-1 truncate text-gray-500 dark:text-gray-400">
                  {item.title} × {item.quantity}
                </span>

                <span className="font-medium text-gray-900 dark:text-white">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-3 border-t border-gray-200 pt-4 text-sm dark:border-gray-800">
            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
              <span>Subtotal</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatPrice(subtotal)}</span>
            </div>

            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
              <span>Shipping</span>

              <span
                className={`font-medium ${
                  shipping === 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-gray-900 dark:text-white"
                }`}
              >
                {formatShipping(shipping)}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-800">
            <span className="font-semibold text-gray-900 dark:text-white">Total</span>

            <span className="text-xl font-bold text-gray-900 dark:text-white">{formatPrice(total)}</span>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default CheckoutPage;
