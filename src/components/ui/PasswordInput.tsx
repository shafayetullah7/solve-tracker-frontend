import type { JSX } from "@solidjs/web";
import { createSignal, Show } from "solid-js";
import { IconEye, IconEyeOff } from "../../icons";

export type PasswordInputProps = Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onInput" | "onFocus" | "onBlur"
> & {
  value: string;
  onInput: JSX.InputEventHandler<HTMLInputElement, InputEvent>;
  onFocus?: JSX.FocusEventHandler<HTMLInputElement, FocusEvent>;
  onBlur?: JSX.FocusEventHandler<HTMLInputElement, FocusEvent>;
};

export function PasswordInput(props: PasswordInputProps) {
  const [visible, setVisible] = createSignal(false);

  return (
    <div class="ui-password-field">
      <input
        id={props.id}
        name={props.name}
        class={["ui-field ui-field--password", props.class]}
        type={visible() ? "text" : "password"}
        autocomplete={props.autocomplete}
        disabled={props.disabled}
        value={props.value}
        onInput={(event) => props.onInput(event)}
        onFocus={(event) => props.onFocus?.(event)}
        onBlur={(event) => props.onBlur?.(event)}
        readonly={props.readonly}
        required={props.required}
        aria-invalid={props["aria-invalid"]}
        aria-describedby={props["aria-describedby"]}
        aria-required={props["aria-required"]}
      />
      <button
        type="button"
        class="ui-password-toggle"
        aria-pressed={visible() ? "true" : "false"}
        aria-label={visible() ? "Hide password" : "Show password"}
        disabled={props.disabled}
        onClick={() => setVisible((current) => !current)}
      >
        <Show when={visible()} fallback={<IconEye class="h-5 w-5" />}>
          <IconEyeOff class="h-5 w-5" />
        </Show>
      </button>
    </div>
  );
}
