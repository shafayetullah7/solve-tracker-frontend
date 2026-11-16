import type { JSX } from "@solidjs/web";
import type { ParentProps } from "solid-js";
import { Show } from "solid-js";

export function Panel(
  props: ParentProps<{
    title?: string;
    description?: string;
    actions?: JSX.Element;
  }>,
) {
  const showHeader = () => Boolean(props.title || props.description || props.actions);

  return (
    <section class="rounded-panel border border-line bg-surface p-5 shadow-panel sm:p-6">
      <Show when={showHeader()}>
        <header class="mb-5 flex flex-wrap items-start justify-between gap-3">
          <Show when={props.title || props.description}>
            <div>
              <Show when={props.title}>
                <h2 class="text-section font-semibold tracking-tight">{props.title}</h2>
              </Show>
              <Show when={props.description}>
                <p class="mt-1 text-label text-muted">{props.description}</p>
              </Show>
            </div>
          </Show>
          {props.actions}
        </header>
      </Show>
      {props.children}
    </section>
  );
}
