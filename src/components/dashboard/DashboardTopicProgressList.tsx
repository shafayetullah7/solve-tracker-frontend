import { createMemo, createSignal, For, Show } from "solid-js";
import type { TopicProgress } from "../../lib/api/modules/progress.api";
import {
  sortDashboardTopics,
  type DashboardTopicSortMode,
} from "../../lib/dashboard/sort-dashboard-topics";
import { formatTopicProgress } from "../../lib/problems/progress-display";
import { paths } from "../../router";
import { ProgressBar } from "../ui/ProgressBar";

type DashboardTopicProgressListProps = {
  topics: TopicProgress[];
};

const sortLinkClass =
  "text-brand underline-offset-4 hover:underline focus-visible:outline-offset-2";
const sortIdleClass = "text-muted hover:text-foreground";

const SORT_OPTIONS: { id: DashboardTopicSortMode; label: string }[] = [
  { id: "default", label: "Default" },
  { id: "mostIncomplete", label: "Most incomplete" },
  { id: "mostRemaining", label: "Most remaining" },
];

export function DashboardTopicProgressList(props: DashboardTopicProgressListProps) {
  const [sortMode, setSortMode] = createSignal<DashboardTopicSortMode>("default");

  const sortedTopics = createMemo(() =>
    sortDashboardTopics(props.topics, sortMode()),
  );

  return (
    <section aria-labelledby="dashboard-by-topic">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
        <h2 id="dashboard-by-topic" class="text-section font-semibold">
          By topic
        </h2>
        <Show when={props.topics.length > 0}>
          <nav aria-label="Sort topics" class="flex flex-wrap items-center gap-x-2 gap-y-1 text-label">
            <For each={SORT_OPTIONS}>
              {(option, index) => (
                <span class="inline-flex items-center gap-x-2">
                  <Show when={index() > 0}>
                    <span class="text-muted" aria-hidden="true">
                      ·
                    </span>
                  </Show>
                  <button
                    type="button"
                    class={
                      sortMode() === option.id ? sortLinkClass : sortIdleClass
                    }
                    aria-current={sortMode() === option.id ? "true" : undefined}
                    onClick={() => setSortMode(option.id)}
                  >
                    {option.label}
                  </button>
                </span>
              )}
            </For>
          </nav>
        </Show>
      </div>
      <Show
        when={props.topics.length > 0}
        fallback={
          <p class="mt-4 text-muted">
            No topics yet.{" "}
            <a
              class="text-brand underline-offset-4 hover:underline"
              href={paths.app.topics()}
            >
              Create topics
            </a>{" "}
            to organize your library.
          </p>
        }
      >
        <ul class="mt-4 divide-y divide-line rounded-panel border border-line bg-surface">
          <For each={sortedTopics()}>
            {(row) => (
              <li class="space-y-2 px-5 py-4">
                <a
                  class="text-body font-medium text-brand underline-offset-4 hover:underline"
                  href={`${paths.app.problems()}?topicId=${row.id}`}
                >
                  {row.name}
                </a>
                <ProgressBar
                  value={row.percentComplete}
                  label={`${row.name}: ${row.percentComplete}% complete`}
                />
                <p class="text-sm text-muted tabular-nums">
                  {formatTopicProgress(row)}
                </p>
              </li>
            )}
          </For>
        </ul>
      </Show>
    </section>
  );
}