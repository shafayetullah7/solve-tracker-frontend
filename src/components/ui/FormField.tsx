import { Show, type ParentProps } from "solid-js";
import {
  formFieldControlAttrs,
  formFieldErrorId,
  formFieldHintId,
} from "../../lib/forms/form-field-control-attrs";

export { formFieldControlAttrs };

export type FormFieldProps = ParentProps<{
  id: string;
  label: string;
  hint?: string;
  /** When `sr-only`, hint is linked for assistive tech but not shown visually. */
  hintVisibility?: "visible" | "sr-only";
  error?: string;
  required?: boolean;
  class?: string;
}>;

export function FormField(props: FormFieldProps) {
  return (
    <div class={props.class}>
      <label class="mb-2 block text-sm font-medium" for={props.id}>
        {props.label}
        <Show when={props.required}>
          <span class="text-muted"> (required)</span>
        </Show>
      </label>
      {props.children}
      <Show when={props.hint}>
        <p
          id={formFieldHintId(props.id)}
          class={
            props.hintVisibility === "sr-only"
              ? "sr-only"
              : "mt-2 text-sm text-muted"
          }
        >
          {props.hint}
        </p>
      </Show>
      <Show when={props.error}>
        <p id={formFieldErrorId(props.id)} class="mt-2 text-sm text-danger">
          {props.error}
        </p>
      </Show>
    </div>
  );
}