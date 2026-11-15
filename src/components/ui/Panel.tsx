import type { JSX } from "@solidjs/web";
import type { ParentProps } from "solid-js";
export function Panel(
  props: ParentProps<{
    title: string;
    description?: string;
    actions?: JSX.Element;
  }>,
) {
  return (
    <section class="rounded-panel border border-line bg-surface p-5 shadow-panel sm:p-6">
      <header class="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 class="text-section font-semibold tracking-tight">{props.title}</h2>
          <p class="mt-1 text-label text-muted">{props.description}</p>
        </div>
        {props.actions}
      </header>
      {props.children}
    </section>
  );
}
