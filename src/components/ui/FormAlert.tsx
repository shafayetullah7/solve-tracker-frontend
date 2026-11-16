import { Show, type ParentProps } from "solid-js";
import { formatRetryAfterHint } from "../../lib/forms/format-retry-after";

export type FormAlertVariant = "error" | "success" | "info";

export type FormAlertProps = ParentProps<{
  variant?: FormAlertVariant;
  retryAfter?: string;
  prominent?: boolean;
  class?: string;
}>;

function roleForVariant(variant: FormAlertVariant): "alert" | "status" {
  return variant === "error" ? "alert" : "status";
}

function classForVariant(variant: FormAlertVariant, prominent: boolean): string {
  if (variant === "error") return "text-sm text-danger";
  if (variant === "success") {
    return prominent
      ? "rounded-lg bg-brand-soft p-3 text-sm text-brand"
      : "text-sm text-brand";
  }
  return "text-sm text-muted";
}

export function FormAlert(props: FormAlertProps) {
  const variant = () => props.variant ?? "error";
  const prominent = () => Boolean(props.prominent);
  const retryHint = () => formatRetryAfterHint(props.retryAfter);

  return (
    <p
      class={[classForVariant(variant(), prominent()), props.class]
        .filter(Boolean)
        .join(" ")}
      role={roleForVariant(variant())}
    >
      {props.children}
      <Show when={retryHint()}>
        <span class="block mt-1">{retryHint()}</span>
      </Show>
    </p>
  );
}