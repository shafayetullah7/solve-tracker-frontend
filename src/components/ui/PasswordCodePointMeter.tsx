import { Show } from "solid-js";
import { codePointLength } from "../../lib/forms/unicode";

const DEFAULT_MIN = 15;

export function passwordMeterId(fieldId: string): string {
  return `${fieldId}-meter`;
}

export type PasswordCodePointMeterProps = {
  fieldId: string;
  value: string;
  visible: boolean;
  min?: number;
};

export function PasswordCodePointMeter(props: PasswordCodePointMeterProps) {
  const min = () => props.min ?? DEFAULT_MIN;
  const count = () => codePointLength(props.value);

  return (
    <Show when={props.visible}>
      <p id={passwordMeterId(props.fieldId)} class="mt-1 text-sm text-muted">
        {count()} / {min()} characters
      </p>
    </Show>
  );
}