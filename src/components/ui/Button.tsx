import type { ParentProps } from "solid-js";
export type ButtonProps = ParentProps<{
  variant?: "primary" | "secondary" | "ghost";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
  class?: string;
  "aria-pressed"?: boolean;
  "aria-busy"?: boolean;
}>;
export function Button(props: ButtonProps) {
  return (
    <button
      class={["ui-button", props.class]}
      data-variant={props.variant ?? "primary"}
      type={props.type ?? "button"}
      disabled={props.disabled}
      onClick={() => props.onClick?.()}
      aria-pressed={
        props["aria-pressed"] === undefined
          ? undefined
          : props["aria-pressed"]
            ? "true"
            : "false"
      }
      aria-busy={
        props["aria-busy"] === undefined
          ? undefined
          : props["aria-busy"]
            ? "true"
            : "false"
      }
    >
      {props.children}
    </button>
  );
}
