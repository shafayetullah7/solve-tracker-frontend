import type { PlatformCatalogItem } from "../api/modules/platforms.api";

export type CatalogEntry = PlatformCatalogItem;

export type CatalogSlug = CatalogEntry["slug"];
export type PlatformPreviewFromUrl = {
  slug: CatalogSlug | "other";
  label: string;
};

export function normalizePlatformHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, "");
}

export function catalogSlugSet(entries: readonly CatalogEntry[]): Set<string> {
  return new Set(entries.map((entry) => entry.slug));
}

export function isCatalogSlug(
  entries: readonly CatalogEntry[],
  value: string,
): value is CatalogSlug {
  return catalogSlugSet(entries).has(value);
}

export function platformEntryBySlug(
  entries: readonly CatalogEntry[],
  slug: string,
): CatalogEntry | undefined {
  return entries.find((entry) => entry.slug === slug);
}

export function platformLabelBySlug(
  entries: readonly CatalogEntry[],
  slug: string,
): string {
  return platformEntryBySlug(entries, slug)?.name ?? slug;
}

/** Label for API `platformSlug` (catalog or stored `other`). */
export function platformLabelForStoredSlug(
  entries: readonly CatalogEntry[],
  slug: string,
): string {
  if (slug === "other") return "Other";
  if (isCatalogSlug(entries, slug)) return platformLabelBySlug(entries, slug);
  return slug;
}

export function platformSlugFromUrl(
  entries: readonly CatalogEntry[],
  url: string,
): CatalogSlug | null {
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
  const normalized = normalizePlatformHostname(host);
  for (const entry of entries) {
    for (const pattern of entry.urlHosts) {
      const patternNorm = normalizePlatformHostname(pattern);
      if (
        normalized === patternNorm ||
        host === pattern.toLowerCase() ||
        normalized.endsWith(`.${patternNorm}`)
      ) {
        return entry.slug;
      }
    }
  }
  return null;
}

export function platformPreviewFromUrl(
  entries: readonly CatalogEntry[],
  url: string,
): PlatformPreviewFromUrl {
  const trimmed = url.trim();
  if (!trimmed) {
    return { slug: "other", label: "Enter a URL to detect the judge." };
  }
  const slug = platformSlugFromUrl(entries, trimmed) ?? "other";
  return { slug, label: platformLabelForStoredSlug(entries, slug) };
}

export function platformLabelFromUrl(
  entries: readonly CatalogEntry[],
  url: string,
): string {
  const slug = platformSlugFromUrl(entries, url);
  if (slug) return platformLabelBySlug(entries, slug);
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host || "Other";
  } catch {
    return "Other";
  }
}

export function platformFilterOptionsFromEntries(
  entries: readonly CatalogEntry[],
): { slug: CatalogSlug | "other"; label: string }[] {
  return [
    ...entries.map((entry) => ({ slug: entry.slug, label: entry.name })),
    { slug: "other", label: "Other" },
  ];
}