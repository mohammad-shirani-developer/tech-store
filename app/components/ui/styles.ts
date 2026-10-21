/**
 * Shared class-name constants used across the storefront so buttons,
 * inputs and page containers stay visually consistent (light + dark).
 */

export const focusRingClasses =
  "outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950";

export const primaryButtonClasses = `inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50 ${focusRingClasses}`;

export const secondaryButtonClasses = `inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800 ${focusRingClasses}`;

export const inputClasses =
  "w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder:text-gray-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-400";

/* Appended on top of inputClasses; important flags win over the
   dark:border-* variant so error borders stay visible in both themes. */
export const inputErrorClasses =
  "border-red-600! focus:border-red-600! focus:ring-red-600/30! dark:border-red-500! dark:focus:border-red-500! dark:focus:ring-red-500/30!";

/* Price-range sliders in the products sidebar. */
export const rangeInputClasses =
  "w-full accent-blue-600 disabled:cursor-not-allowed disabled:opacity-50";

export const scrollbarThinClasses =
  "overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent] dark:[scrollbar-color:#374151_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-thumb:hover]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb:hover]:bg-gray-600";

export const pageContainerClasses =
  "mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8";
