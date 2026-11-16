import type { ParentProps } from "solid-js";

export default function ProblemsLayout(props: ParentProps) {
  return (
    <main class="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">{props.children}</main>
  );
}