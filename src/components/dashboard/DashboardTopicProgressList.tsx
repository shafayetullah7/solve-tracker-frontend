import { createMemo, createSignal, For, Show } from "solid-js";
import type { TopicProgress } from "../../lib/api/modules/progress.api";
import {
  sortDashboardTopics,
  type DashboardTopicSortMode,
} from "../../lib/dashboard/sort-dashboard-topics";
import { TopicProgressRow } from "../topics/TopicProgressRow";
import { TopicSortNav } from "../topics/TopicSortNav";
import { paths } from "../../router";

type DashboardTopicProgressListProps = {
  topics: TopicProgress[];
};

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
          <TopicSortNav value={sortMode()} onChange={setSortMode} />
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
        <ul class="mt-4 divide-y divide-line rounded-panel border border-line bg-surface shadow-panel">
          <For each={sortedTopics()}>
            {(row) => (
              <li class="px-5 py-4">
                <TopicProgressRow row={row} />
              </li>
            )}
          </For>
        </ul>
      </Show>
    </section>
  );
}