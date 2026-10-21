/**
 * Canonical tech category configuration for the storefront.
 *
 * The store only sells tech, so `getProducts` fetches exactly these
 * DummyJSON categories and the UI renders them through the display-name
 * and icon maps below.
 */

export const TECH_CATEGORIES = [
  "laptops",
  "smartphones",
  "mobile-accessories",
  "tablets",
  "mens-watches",
] as const;

export type TechCategory = (typeof TECH_CATEGORIES)[number];

/** DummyJSON slug -> customer-facing display name. */
export const CATEGORY_DISPLAY_NAMES: Record<TechCategory, string> = {
  laptops: "Laptops",
  smartphones: "Phones",
  tablets: "Tablets",
  "mobile-accessories": "Accessories",
  "mens-watches": "Wearables",
};

/** DummyJSON slug -> inline SVG path (Heroicons v2 outline, 24px). */
export const CATEGORY_ICON_PATHS: Record<TechCategory, string> = {
  laptops:
    "M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25",
  smartphones:
    "M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3",
  tablets:
    "M10.5 19.5h3m-6.75 2.25h10.5a2.25 2.25 0 002.25-2.25V4.5a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 4.5v15a2.25 2.25 0 002.25 2.25z",
  "mobile-accessories":
    "M20.25 7.512l-.25-2.262a4.5 4.5 0 00-8.49 1.518l-.002.012m8.742 4.232v6.268a2.25 2.25 0 01-2.25 2.25h-1.5a2.25 2.25 0 01-2.25-2.25v-6.268m8.25 0a48.66 48.66 0 00-8.25-.75 48.66 48.66 0 00-8.25.75m0 0v6.268a2.25 2.25 0 002.25 2.25h1.5a2.25 2.25 0 002.25-2.25v-6.268M3.75 7.512l.25-2.262a4.5 4.5 0 018.49 1.518l.002.012m-8.742 4.232v6.268a2.25 2.25 0 002.25 2.25h1.5a2.25 2.25 0 002.25-2.25v-6.268",
  /* Wearables: a clock face reads as a wrist watch. */
  "mens-watches":
    "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
};

/** Icon path for the "All" entry in the category filter. */
export const ALL_CATEGORIES_ICON_PATH =
  "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z";

/** Human label for a category slug (falls back to Title Casing the slug). */
export const getCategoryDisplayName = (value: string): string => {
  const known = CATEGORY_DISPLAY_NAMES[value as TechCategory];

  if (known) {
    return known;
  }

  return value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

/** Icon path for a category slug (falls back to a generic grid icon). */
export const getCategoryIconPath = (value: string): string => {
  return CATEGORY_ICON_PATHS[value as TechCategory] ?? ALL_CATEGORIES_ICON_PATH;
};
