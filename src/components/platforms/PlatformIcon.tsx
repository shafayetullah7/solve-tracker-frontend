import { createMemo } from "solid-js";
import {
  useOptionalPlatformCatalog,
} from "../../lib/platforms/platform-catalog-context";
import {
  platformLabelBySlug as runtimeLabelBySlug,
  platformSlugFromUrl as runtimeSlugFromUrl,
} from "../../lib/platforms/catalog-runtime";
import type { CatalogSlug } from "../../lib/platforms/catalog-runtime";
import {
  fallbackLabelForStoredSlug,
  isKnownCatalogSlug,
} from "../../lib/platforms/platform-slugs";
import { platformIconHex, platformIconPath } from "../../lib/platforms/icon-registry";

export type PlatformIconProps = {
  slug?: CatalogSlug | string;
  url?: string;
  class?: string;
  /** Use brand hex when set; default uses currentColor for theme fit. */
  brandColor?: boolean;
  title?: string;
};

export function PlatformIcon(props: PlatformIconProps) {
  const catalog = useOptionalPlatformCatalog();

  const slug = createMemo((): CatalogSlug | null => {
    if (props.slug && isKnownCatalogSlug(props.slug)) return props.slug;
    const ready = catalog?.status() === "ready";
    if (props.url && ready) {
      const fromRuntime = runtimeSlugFromUrl(catalog!.entries(), props.url);
      if (fromRuntime) return fromRuntime;
    }
    return null;
  });

  const path = () => {
    const s = slug();
    return s ? platformIconPath(s) : undefined;
  };

  const label = () => {
    if (props.title) return props.title;
    const s = slug();
    if (s) {
      if (catalog?.status() === "ready") {
        return runtimeLabelBySlug(catalog.entries(), s);
      }
      return fallbackLabelForStoredSlug(s);
    }
    return "Platform";
  };

  return (
    <span
      class={[
        "inline-flex h-5 w-5 shrink-0 items-center justify-center",
        props.class,
      ]}
      role="img"
      aria-label={label()}
    >
      {path() ? (
        <svg
          class="h-full w-full"
          viewBox="0 0 24 24"
          aria-hidden="true"
          fill={
            props.brandColor && slug() && platformIconHex(slug()!)
              ? `#${platformIconHex(slug()!)}`
              : "currentColor"
          }
        >
          <path d={path()!} />
        </svg>
      ) : (
        <span
          class="flex h-full w-full items-center justify-center rounded-full bg-surface-muted text-[0.65rem] font-semibold uppercase text-muted"
          aria-hidden="true"
        >
          {(label().replace(/[^A-Za-z0-9]/g, "").slice(0, 2) || "?").slice(0, 2)}
        </span>
      )}
    </span>
  );
}