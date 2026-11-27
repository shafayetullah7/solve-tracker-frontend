import { Show } from "solid-js";
import { PASSWORD_MAX, PASSWORD_MIN } from "../../lib/forms/password-policy";
import { codePointLength } from "../../lib/forms/unicode";
import { ProgressBar } from "./ProgressBar";

export function passwordMeterId(fieldId: string): string {
  return `${fieldId}-meter`;
}

export type PasswordCodePointMeterProps = {
  fieldId: string;
  value: string;
  visible: boolean;
  min?: number;
  max?: number;
};

export function PasswordCodePointMeter(props: PasswordCodePointMeterProps) {
  const min = () => props.min ?? PASSWORD_MIN;
  const max = () => props.max ?? PASSWORD_MAX;
  const count = () => codePointLength(props.value);
  const meetsMin = () => count() >= min();

  const progressPercent = () => {
    if (meetsMin()) return 100;
    return Math.min(100, Math.round((count() / min()) * 100));
  };

  return (
    <Show when={props.visible}>
      <div id={passwordMeterId(props.fieldId)} class="mt-2 space-y-1.5">
        <Show when={!meetsMin()}>
          <ProgressBar
            value={progressPercent()}
            label={`Password length progress toward minimum of ${min()} characters`}
          />
        </Show>
        <p class={["text-sm", meetsMin() ? "text-brand" : "text-muted"]}>
          {count()} / {min()} minimum (max {max()})
          <Show when={meetsMin()}>
            <span class="sr-only"> — minimum length met</span>
            <span aria-hidden="true"> — minimum met</span>
          </Show>
        </p>
      </div>
    </Show>
  );
}