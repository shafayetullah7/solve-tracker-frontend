import { For, Show } from "solid-js";
import type { DashboardTopicSortMode } from "../../lib/dashboard/sort-dashboard-topics";

const sortLinkClass =
  "text-brand underline-offset-4 hover:underline focus-visible:outline-offset-2";
const sortIdleClass = "text-muted hover:text-foreground";

export const TOPIC_SORT_OPTIONS: { id: DashboardTopicSortMode; label: string }[] = [
  { id: "default", label: "Default" },
  { id: "mostIncomplete", label: "Incomplete" },
  { id: "mostRemaining", label: "Remaining" },
];

export type TopicSortNavProps = {
  value: DashboardTopicSortMode;
  onChange: (mode: DashboardTopicSortMode) => void;
  ariaLabel?: string;
};

export function TopicSortNav(props: TopicSortNavProps) {
  const label = () => props.ariaLabel ?? "Sort topics";

  return (
    <nav
      aria-label={label()}
      class="flex flex-wrap items-center gap-x-2 gap-y-1 text-label"
    >
      <For each={TOPIC_SORT_OPTIONS}>
        {(option, index) => (
          <span class="inline-flex items-center gap-x-2">
            <Show when={index() > 0}>
              <span class="text-muted" aria-hidden="true">
                ·
              </span>
            </Show>
            <button
              type="button"
              class={props.value === option.id ? sortLinkClass : sortIdleClass}
              aria-current={props.value === option.id ? "true" : undefined}
              onClick={() => props.onChange(option.id)}
            >
              {option.label}
            </button>
          </span>
        )}
      </For>
    </nav>
  );
}