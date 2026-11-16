import type { ParentProps } from "solid-js";
import {
  isPlatformSlug,
  platformLabelBySlug,
  platformLabelFromUrl,
  type PlatformSlug,
} from "../../lib/platforms/catalog";
import { PlatformIcon, type PlatformIconProps } from "./PlatformIcon";

export type PlatformMarkProps = ParentProps<
  Omit<PlatformIconProps, "title"> & {
    url?: string;
    slug?: PlatformSlug | string;
    /** Override display text (default: label from slug or URL). */
    label?: string;
    class?: string;
  }
>;

export function PlatformMark(props: PlatformMarkProps) {
  const text = () => {
    if (props.label) return props.label;
    if (props.slug && isPlatformSlug(props.slug))
      return platformLabelBySlug(props.slug);
    if (props.url) return platformLabelFromUrl(props.url);
    return "Other";
  };

  return (
    <span
      class={[
        "inline-flex min-w-0 items-center gap-1.5 text-sm text-muted",
        props.class,
      ]}
    >
      <PlatformIcon slug={props.slug} url={props.url} brandColor />
      <span class="truncate">{text()}</span>
      {props.children}
    </span>
  );
}