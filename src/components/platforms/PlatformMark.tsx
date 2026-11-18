import type { ParentProps } from "solid-js";
import { usePlatformLabels } from "../../lib/platforms/platform-catalog-context";
import type { CatalogSlug } from "../../lib/platforms/catalog-runtime";
import { PlatformIcon, type PlatformIconProps } from "./PlatformIcon";

export type PlatformMarkProps = ParentProps<
  Omit<PlatformIconProps, "title"> & {
    url?: string;
    slug?: CatalogSlug | string;
    /** Override display text (default: label from slug or URL). */
    label?: string;
    class?: string;
  }
>;

export function PlatformMark(props: PlatformMarkProps) {
  const labels = usePlatformLabels();
  const text = () => {
    if (props.label) return props.label;
    const helpers = labels();
    if (props.slug) return helpers.labelForStoredSlug(props.slug);
    if (props.url) return helpers.labelFromUrl(props.url);
    return "Other";
  };

  return (
    <span
      class={[
        "inline-flex min-w-0 items-center gap-1.5 text-sm text-muted",
        props.class,
      ]}
    >
      <PlatformIcon
        slug={props.slug}
        url={props.url}
        brandColor
        title={text()}
      />
      <span class="truncate">{text()}</span>
      {props.children}
    </span>
  );
}