import type { CatalogSlug, PlatformPreviewFromUrl } from "./catalog-runtime";

/** Keep in sync with OpenAPI `PlatformsController_list` slug enum (regenerate via `pnpm api:generate`). */
export const CATALOG_SLUGS = [
  "codeforces",
  "leetcode",
  "codechef",
  "atcoder",
  "hackerrank",
  "geeksforgeeks",
  "kattis",
  "spoj",
  "cses",
  "beecrowd",
  "codewars",
  "hackerearth",
  "topcoder",
  "projecteuler",
  "uva",
  "aizu",
] as const satisfies readonly CatalogSlug[];

const KNOWN_CATALOG_SLUG_SET = new Set<string>(CATALOG_SLUGS);

export type { CatalogSlug };

export function isKnownCatalogSlug(value: string): value is CatalogSlug {
  return KNOWN_CATALOG_SLUG_SET.has(value);
}

export function isStoredPlatformSlug(
  value: string,
): value is CatalogSlug | "other" {
  return value === "other" || isKnownCatalogSlug(value);
}

export const STORED_PLATFORM_SLUGS = new Set<string>([
  ...CATALOG_SLUGS,
  "other",
]);

/** Label when runtime catalog is not loaded (no judge names). */
export function fallbackLabelForStoredSlug(slug: string): string {
  if (slug === "other") return "Other";
  if (isKnownCatalogSlug(slug)) {
    return slug
      .split(/[-_]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }
  return slug;
}

export function fallbackLabelFromUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "Enter a URL to detect the judge.";
  try {
    const host = new URL(trimmed).hostname.toLowerCase();
    return host || "Unknown judge";
  } catch {
    return "Unknown judge";
  }
}

/** Add/edit preview when runtime catalog is not available. */
export function fallbackPreviewFromUrl(url: string): PlatformPreviewFromUrl {
  const trimmed = url.trim();
  if (!trimmed) {
    return { slug: "other", label: "Enter a URL to detect the judge." };
  }
  return { slug: "other", label: fallbackLabelFromUrl(url) };
}