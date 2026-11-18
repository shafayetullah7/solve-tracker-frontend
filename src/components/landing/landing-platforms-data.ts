import type { PlatformCatalogItem } from "../../lib/api/modules/platforms.api";
import type { CatalogSlug } from "../../lib/platforms/platform-slugs";

export type LandingPlatformCell = {
  slug: CatalogSlug;
  name: string;
  baseUrl?: string;
};

export function resolveAllPlatforms(
  entries: readonly PlatformCatalogItem[] | undefined,
): LandingPlatformCell[] {
  if (!entries?.length) return [];
  return entries
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }))
    .map((e) => ({
      slug: e.slug,
      name: e.name,
      baseUrl: e.baseUrl,
    }));
}