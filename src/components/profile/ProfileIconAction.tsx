import type { ParentProps } from "solid-js";

export type ProfileIconActionProps = ParentProps<{
  label: string;
  onClick?: (event: MouseEvent) => void;
  class?: string;
}>;

export function ProfileIconAction(props: ProfileIconActionProps) {
  return (
    <button
      type="button"
      class={[
        "flex min-h-11 min-w-11 items-center justify-center rounded-control text-muted transition-colors hover:bg-surface-muted hover:text-ink",
        props.class,
      ]}
      aria-label={props.label}
      onClick={(event) => props.onClick?.(event)}
    >
      {props.children}
    </button>
  );
}