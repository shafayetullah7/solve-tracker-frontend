import type { IconProps } from "./icon-props";

export function IconTopics(props: IconProps) {
  return (
    <svg
      class={props.class}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2H2v10l5-2 5 2V2z" />
      <path d="M22 12H12v10l5-2 5 2V12z" />
    </svg>
  );
}