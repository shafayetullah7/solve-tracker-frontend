/** Re-export shared catalog — source of truth lives in the backend package. */
export {
  PLATFORM_CATALOG,
  PLATFORM_FILTER_OPTIONS,
  PLATFORM_SLUGS,
  PLATFORM_SEED_ROWS,
  isPlatformSlug,
  normalizePlatformHostname,
  platformEntryBySlug,
  platformLabelBySlug,
  platformLabelFromUrl,
  platformSlugFromUrl,
  type PlatformCatalogEntry,
  type PlatformSlug,
} from "@platforms/platform-catalog";