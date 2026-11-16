import { For, Show } from "solid-js";
import type { ProblemResponse } from "../../lib/api/modules/problems.api";
import { dashboardBrowseHref } from "../../lib/dashboard/dashboard-queries";
import { problemNewPath } from "../../lib/problems/paths";
import { DashboardProblemPreviewRow } from "./DashboardProblemPreviewRow";

const linkClass =
  "text-brand underline-offset-4 hover:underline focus-visible:outline-offset-2";

type DashboardFocusListProps = {
  problems: ProblemResponse[];
};

export function DashboardFocusList(props: DashboardFocusListProps) {
  const viewAllHref = dashboardBrowseHref("focusQueue");

  return (
    <section
      aria-labelledby="dashboard-pick-up-next"
      class="rounded-panel border border-line bg-surface px-5 py-5"
    >
      <h2 id="dashboard-pick-up-next" class="text-section font-semibold">
        Pick up next
      </h2>
      <Show
        when={props.problems.length > 0}
        fallback={
          <p class="mt-4 text-muted">
            No unsolved problems.{" "}
            <a class={linkClass} href={problemNewPath()}>
              Add a problem
            </a>{" "}
            to build your queue.
          </p>
        }
      >
        <ul class="mt-3 divide-y divide-line">
          <For each={props.problems}>
            {(problem) => <DashboardProblemPreviewRow problem={problem} />}
          </For>
        </ul>
        <p class="mt-4">
          <a class={`text-label ${linkClass}`} href={viewAllHref}>
            View all unsolved
          </a>
        </p>
      </Show>
    </section>
  );
}