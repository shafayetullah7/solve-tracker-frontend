import type { IconProps } from "../../icons/icon-props";

export type PracticeMarkProps = IconProps & {
  /** When set, the mark is named for assistive technologies. */
  title?: string;
};

/**
 * Product mark: ascending effort (sessions / skills) with the wordmark “.” as focus.
 */
export function PracticeMark(props: PracticeMarkProps) {
  const label = () => props.title;
  return (
    <svg
      class={props.class}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 72 78"
      fill="none"
      role={label() ? "img" : undefined}
      aria-hidden={label() ? undefined : "true"}
      aria-label={label()}
    >
      {label() ? <title>{label()}</title> : null}
      <rect x="8" y="40" width="14" height="26" rx="4" fill="currentColor" />
      <rect x="29" y="28" width="14" height="38" rx="4" fill="currentColor" />
      <rect x="50" y="16" width="14" height="50" rx="4" fill="currentColor" />
      <circle cx="57" cy="11" r="5" fill="currentColor" />
    </svg>
  );
}