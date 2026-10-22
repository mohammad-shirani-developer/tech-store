import type { Metadata } from "next";
import Link from "next/link";

import {
  pageContainerClasses,
  primaryButtonClasses,
  secondaryButtonClasses,
} from "../components/ui/styles";

export const metadata: Metadata = {
  // The root layout template appends "| TechStore" already.
  title: "About",
  description:
    "Learn more about TechStore — a demo storefront built with Next.js, TypeScript and Tailwind CSS, powered by the DummyJSON demo API.",
};

const TECH_STACK = [
  "Next.js 16 (App Router)",
  "TypeScript",
  "Tailwind CSS 4",
  "TanStack Query",
  "React Hook Form + Zod",
  "next-themes (light / dark)",
] as const;

const AboutPage = () => {
  return (
    <main className={pageContainerClasses}>
      {/* Page header */}
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
          About TechStore
        </h1>

        <p className="mt-4 leading-7 text-gray-600 dark:text-gray-400">
          TechStore is your one stop tech store — a storefront demo focused on
          laptops, phones, tablets and accessories. Browse the catalog, filter
          by category, brand or price, and run the full cart-to-checkout flow.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {/* What is TechStore */}
        <section
          aria-label="What is TechStore"
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-[var(--card-shadow)] dark:border-gray-800 dark:bg-gray-900"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            What is TechStore?
          </h2>

          <div className="mt-4 space-y-4 leading-7 text-gray-600 dark:text-gray-400">
            <p>
              TechStore is a demo e-commerce experience built to feel like a
              real shop: a searchable tech catalog, live filters, product
              galleries with real customer reviews, a persistent cart and a
              validated checkout — all in a clean light and dark theme.
            </p>

            <p>
              The catalog is powered by the{" "}
              <a
                href="https://dummyjson.com/docs/products"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                DummyJSON demo API
              </a>{" "}
              (the tech product categories). Products, prices, ratings and
              reviews all come straight from the API — nothing in the store is
              hardcoded, and no real payment is ever processed.
            </p>

            <p>
              Your cart is stored locally in your browser, so it survives
              page reloads. Placing an order simply simulates the final step of
              a checkout flow.
            </p>
          </div>
        </section>

        {/* Tech stack */}
        <section
          aria-label="Tech stack"
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-[var(--card-shadow)] dark:border-gray-800 dark:bg-gray-900"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Built with
          </h2>

          <ul className="mt-4 flex flex-wrap gap-2">
            {TECH_STACK.map((item) => (
              <li
                key={item}
                className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-white/5 dark:text-gray-300"
              >
                {item}
              </li>
            ))}
          </ul>

          <p className="mt-4 leading-7 text-gray-600 dark:text-gray-400">
            The app is fully typed with TypeScript strict mode, fetches data
            through TanStack Query with a shared cache, and validates the
            checkout form with React Hook Form and a Zod schema.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/products" className={primaryButtonClasses}>
              Browse Products
            </Link>

            <Link href="/cart" className={secondaryButtonClasses}>
              View Cart
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
};

export default AboutPage;
