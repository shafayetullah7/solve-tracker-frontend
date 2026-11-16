import {
  isPlatformSlug,
  platformLabelBySlug,
  platformSlugFromUrl,
  type PlatformSlug,
} from "../../lib/platforms/catalog";
import { platformIconHex, platformIconPath } from "../../lib/platforms/icon-registry";

export type PlatformIconProps = {
  slug?: PlatformSlug | string;
  url?: string;
  class?: string;
  /** Use brand hex when set; default uses currentColor for theme fit. */
  brandColor?: boolean;
  title?: string;
};

function resolvedSlug(props: PlatformIconProps): PlatformSlug | null {
  if (props.slug && isPlatformSlug(props.slug)) return props.slug;
  if (props.url) return platformSlugFromUrl(props.url);
  return null;
}

export function PlatformIcon(props: PlatformIconProps) {
  const slug = () => resolvedSlug(props);
  const path = () => {
    const s = slug();
    return s ? platformIconPath(s) : undefined;
  };
  const label = () => {
    const s = slug();
    if (s) return platformLabelBySlug(s);
    if (props.title) return props.title;
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