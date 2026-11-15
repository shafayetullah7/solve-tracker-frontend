import type { ParentProps } from "solid-js";
export function Badge(
  props: ParentProps<{
    tone?: "neutral" | "brand" | "success" | "warning" | "danger";
  }>,
) {
  return (
    <span class="ui-badge" data-tone={props.tone ?? "neutral"}>
      {props.children}
    </span>
  );
}
