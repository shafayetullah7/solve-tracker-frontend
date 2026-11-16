import type { ParentProps } from "solid-js";
import { Button } from "../ui/Button";

export type AuthFormActionsProps = ParentProps<{
  pending: boolean;
  submitLabel: string;
  pendingLabel: string;
}>;

export function authFormLinkClass(variant: "accent" | "muted" = "accent") {
  return variant === "accent"
    ? "text-sm text-brand underline-offset-4 hover:underline"
    : "text-sm text-muted underline-offset-4 hover:underline";
}

/** Shared submit row for auth forms: primary button + inline links. */
export function AuthFormActions(props: AuthFormActionsProps) {
  return (
    <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <Button type="submit" disabled={props.pending}>
        {props.pending ? props.pendingLabel : props.submitLabel}
      </Button>
      <div class="flex flex-wrap items-center gap-x-4 gap-y-2">{props.children}</div>
    </div>
  );
}