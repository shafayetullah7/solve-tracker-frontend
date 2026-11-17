import type { ParentProps } from "solid-js";

export type ProfileIconActionProps = ParentProps<{
  label: string;
  onClick: () => void;
}>;

export function ProfileIconAction(props: ProfileIconActionProps) {
  return (
    <button
      type="button"
      class="flex min-h-11 min-w-11 items-center justify-center rounded-control text-muted transition-colors hover:bg-surface-muted hover:text-ink"
      aria-label={props.label}
      onClick={() => props.onClick()}
    >
      {props.children}
    </button>
  );
}