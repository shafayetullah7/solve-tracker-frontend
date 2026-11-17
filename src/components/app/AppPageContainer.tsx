import type { ParentProps } from "solid-js";

/** Shared width/padding for signed-in workspace pages (`max-w-6xl`). */
export function AppPageContainer(props: ParentProps) {
  return (
    <div class="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      {props.children}
    </div>
  );
}