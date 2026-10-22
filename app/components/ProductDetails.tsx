"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import { useCart } from "../context/CartContext";
import type { Product, ProductReview } from "../lib/api";
import { formatPrice } from "../lib/format";
import { FREE_SHIPPING_THRESHOLD } from "../lib/shipping";
import Stars from "./ui/Stars";
import {
  HEADSET_ICON,
  SHIELD_ICON,
  TRUCK_ICON,
} from "./ui/icons";
import { focusRingClasses, primaryButtonClasses } from "./ui/styles";

/* -----------------------------
   Tabs
----------------------------- */

const TABS = ["description", "specifications", "reviews"] as const;

type Tab = (typeof TABS)[number];

const TAB_LABELS: Record<Tab, string> = {
  description: "Description",
  specifications: "Specifications",
  reviews: "Reviews",
};

/* Rendered in UTC so server and client markup always match. */
const formatReviewDate = (iso: string) => {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
};

/* -----------------------------
   Sub-components
----------------------------- */

type PerkProps = {
  label: string;
  description: string;
  iconPath: string;
};

/* Trust badges row (matches the mockup); the per-product
   shipping/warranty/return facts live in the Specifications tab. */
const PERKS: PerkProps[] = [
  {
    label: "Free Shipping",
    // Derived from the real shipping rule so the badge can never lie.
    description: `On orders over $${FREE_SHIPPING_THRESHOLD}`,
    iconPath: TRUCK_ICON,
  },
  {
    label: "24/7 Support",
    description: "We're here to help",
    iconPath: HEADSET_ICON,
  },
  {
    label: "Easy Returns",
    description: "30 days return",
    iconPath: SHIELD_ICON,
  },
];

const PerkItem = ({ label, description, iconPath }: PerkProps) => {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
        </svg>
      </span>

      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          {label}
        </h3>

        <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
    </div>
  );
};

const ReviewItem = ({ review }: { review: ProductReview }) => {
  return (
    <li className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-gray-900 dark:text-white">
          {review.reviewerName}
        </p>

        <time
          dateTime={review.date}
          className="text-xs text-gray-500 dark:text-gray-400"
        >
          {formatReviewDate(review.date)}
        </time>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <Stars rating={review.rating} />

        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
          {review.rating.toFixed(1)}
        </span>
      </div>

      <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
        {review.comment}
      </p>
    </li>
  );
};

/* Fallback when the payload has no written reviews: a summary of the
   aggregate rating (real product.rating). */
const RatingSummary = ({ rating }: { rating: number }) => {
  return (
    <div className="max-w-3xl rounded-xl border border-gray-200 p-6 text-center dark:border-gray-800">
      <Stars rating={rating} className="justify-center" />

      <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
        {rating.toFixed(1)} out of 5
      </p>

      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        No written reviews to show yet.
      </p>
    </div>
  );
};

/* -----------------------------
   Product details
----------------------------- */

type ProductDetailsProps = {
  product: Product;
};

const ProductDetails = ({ product }: ProductDetailsProps) => {
  const { addToCart } = useCart();

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>("description");

  const tabRefs = useRef<Partial<Record<Tab, HTMLButtonElement | null>>>({});

  const galleryImages =
    product.images.length > 0
      ? product.images
      : [product.image].filter(Boolean);

  const activeImageSrc =
    galleryImages[activeImage] ?? galleryImages[0] ?? product.image;

  const availabilityLabel =
    product.availabilityStatus ||
    (product.stock > 0 ? "In Stock" : "Out of Stock");

  const isInStock = product.stock > 0;

  const maxQuantity = product.stock > 0 ? product.stock : 0;

  /* Price before the discount, computed from the real discount percentage. */
  const originalPrice =
    product.discountPercentage > 0
      ? product.price / (1 - product.discountPercentage / 100)
      : null;

  const handleAddToCart = () => {
    if (maxQuantity === 0) {
      return;
    }

    addToCart(product, quantity);
  };

  const handleTabKeyDown = (event: React.KeyboardEvent, tab: Tab) => {
    const index = TABS.indexOf(tab);
    let nextTab: Tab | null = null;

    if (event.key === "ArrowRight") {
      nextTab = TABS[(index + 1) % TABS.length];
    } else if (event.key === "ArrowLeft") {
      nextTab = TABS[(index - 1 + TABS.length) % TABS.length];
    }

    if (nextTab) {
      event.preventDefault();
      setActiveTab(nextTab);
      tabRefs.current[nextTab]?.focus();
    }
  };

  const specifications = [
    { label: "Brand", value: product.brand },
    { label: "SKU", value: product.sku },
    { label: "Weight", value: product.weight?.toString() },
    {
      label: "Dimensions (W × H × D)",
      value: product.dimensions
        ? `${product.dimensions.width} × ${product.dimensions.height} × ${product.dimensions.depth}`
        : undefined,
    },
    { label: "Availability", value: availabilityLabel },
    { label: "Warranty", value: product.warrantyInformation },
    { label: "Shipping", value: product.shippingInformation },
    { label: "Return policy", value: product.returnPolicy },
  ].filter((spec): spec is { label: string; value: string } =>
    Boolean(spec.value),
  );

  return (
    <div>
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <section aria-label="Product images">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800">
            {activeImageSrc && (
              <Image
                src={activeImageSrc}
                alt={product.title}
                fill
                priority
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-contain p-6"
              />
            )}
          </div>

          {galleryImages.length > 1 && (
            <ul className="mt-4 flex gap-3 overflow-x-auto pb-1">
              {galleryImages.map((image, index) => {
                const isActive = index === activeImage;

                return (
                  <li key={image}>
                    <button
                      type="button"
                      onClick={() => setActiveImage(index)}
                      aria-label={`View image ${index + 1} of ${galleryImages.length}`}
                      aria-pressed={isActive}
                      className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-gray-50 transition dark:bg-gray-800 ${
                        isActive
                          ? "border-blue-600 dark:border-blue-400"
                          : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-500"
                      } ${focusRingClasses}`}
                    >
                      <Image
                        src={image}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-contain p-2"
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Info */}
        <section aria-label="Product information">
          <h1 className="text-3xl font-bold leading-tight text-gray-900 dark:text-white">
            {product.title}
          </h1>

          <div className="mt-3 flex items-center gap-2">
            <Stars rating={product.rating} />

            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {product.rating.toFixed(1)}
            </span>

            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({product.reviewCount}{" "}
              {product.reviewCount === 1 ? "review" : "reviews"})
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatPrice(product.price)}
            </p>

            {originalPrice !== null && (
              <p className="text-xl font-medium text-gray-400 line-through dark:text-gray-500">
                {formatPrice(originalPrice)}
              </p>
            )}

            {product.discountPercentage > 0 && (
              <span className="rounded-full bg-red-100 px-2.5 py-1 text-sm font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-400">
                -{Math.round(product.discountPercentage)}%
              </span>
            )}
          </div>

          <div className="mt-4">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                isInStock
                  ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
              {availabilityLabel}
            </span>
          </div>

          <p className="mt-5 leading-7 text-gray-600 dark:text-gray-400">
            {product.description}
          </p>

          {/* Quantity + Add to Cart */}
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="inline-flex h-12 w-fit items-center self-start rounded-lg border border-gray-300 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
                className="flex h-full w-11 items-center justify-center rounded-l-lg text-lg font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                &minus;
              </button>

              <span
                className="w-10 text-center text-sm font-semibold text-gray-900 dark:text-white"
                aria-live="polite"
              >
                {quantity}
              </span>

              <button
                type="button"
                onClick={() =>
                  setQuantity((current) => Math.min(maxQuantity, current + 1))
                }
                disabled={quantity >= maxQuantity}
                aria-label="Increase quantity"
                className="flex h-full w-11 items-center justify-center rounded-r-lg text-lg font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={maxQuantity === 0}
              className={`${primaryButtonClasses} h-12 flex-1 px-8 sm:flex-none`}
            >
              Add to Cart
            </button>
          </div>

          {/* Perks row (matches the mockup) */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {PERKS.map((perk) => (
              <PerkItem key={perk.label} {...perk} />
            ))}
          </div>
        </section>
      </div>

      {/* Tabs */}
      <section aria-label="Product details" className="mt-12">
        <div
          role="tablist"
          aria-label="Product information tabs"
          className="flex gap-6 border-b border-gray-200 dark:border-gray-800"
        >
          {TABS.map((tab) => {
            const isActive = tab === activeTab;

            return (
              <button
                key={tab}
                ref={(element) => {
                  tabRefs.current[tab] = element;
                }}
                type="button"
                role="tab"
                id={`product-tab-${tab}`}
                aria-selected={isActive}
                aria-controls={`product-panel-${tab}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveTab(tab)}
                onKeyDown={(event) => handleTabKeyDown(event, tab)}
                className={`-mb-px border-b-2 px-1 pb-3 text-sm font-semibold transition ${
                  isActive
                    ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-900 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-white"
                }`}
              >
                {TAB_LABELS[tab]}
              </button>
            );
          })}
        </div>

        <div className="py-6">
          {activeTab === "description" && (
            <div
              role="tabpanel"
              id="product-panel-description"
              aria-labelledby="product-tab-description"
              tabIndex={0}
              className="max-w-3xl leading-7 text-gray-600 focus:outline-none dark:text-gray-400"
            >
              {product.description}
            </div>
          )}

          {activeTab === "specifications" && (
            <div
              role="tabpanel"
              id="product-panel-specifications"
              aria-labelledby="product-tab-specifications"
              tabIndex={0}
              className="max-w-2xl focus:outline-none"
            >
              <dl>
                {specifications.map((spec) => (
                  <div
                    key={spec.label}
                    className="flex items-center justify-between gap-6 border-b border-gray-200 py-3 last:border-b-0 dark:border-gray-800"
                  >
                    <dt className="text-sm text-gray-500 dark:text-gray-400">
                      {spec.label}
                    </dt>

                    <dd className="text-right text-sm font-medium text-gray-900 dark:text-white">
                      {spec.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {activeTab === "reviews" && (
            <div
              role="tabpanel"
              id="product-panel-reviews"
              aria-labelledby="product-tab-reviews"
              tabIndex={0}
              className="focus:outline-none"
            >
              {product.reviews && product.reviews.length > 0 ? (
                <ul className="max-w-3xl space-y-4">
                  {product.reviews.slice(0, 3).map((review, index) => (
                    <ReviewItem
                      key={`${review.reviewerName}-${review.date}-${index}`}
                      review={review}
                    />
                  ))}
                </ul>
              ) : (
                <RatingSummary rating={product.rating} />
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProductDetails;
