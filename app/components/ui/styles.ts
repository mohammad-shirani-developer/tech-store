/**
 * Shared class-name constants used across the storefront so buttons,
 * inputs and page containers stay visually consistent.
 */

export const focusRingClasses =
  "outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950";

export const primaryButtonClasses = `inline-flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50 ${focusRingClasses}`;

export const secondaryButtonClasses = `inline-flex items-center justify-center gap-2 rounded-lg border border-gray-700 bg-transparent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 ${focusRingClasses}`;

export const inputClasses =
  "w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-white placeholder:text-gray-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30";

export const inputErrorClasses =
  "border-red-500 focus:border-red-500 focus:ring-red-500/30";

export const scrollbarThinClasses =
  "overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#374151_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-thumb:hover]:bg-gray-600";

export const pageContainerClasses =
  "mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8";
