import { For, Show } from "solid-js";
import type { ProblemResponse } from "../../lib/api/modules/problems.api";
import { dashboardBrowseHref } from "../../lib/dashboard/dashboard-queries";
import { paths } from "../../router";
import { DashboardProblemPreviewRow } from "./DashboardProblemPreviewRow";

const linkClass =
  "text-brand underline-offset-4 hover:underline focus-visible:outline-offset-2";

type DashboardRecentListsProps = {
  recentAdded: ProblemResponse[];
  recentSolved: ProblemResponse[];
};

export function DashboardRecentLists(props: DashboardRecentListsProps) {
  const addedHref = dashboardBrowseHref("recentAdded");
  const solvedHref = dashboardBrowseHref("recentSolved");

  return (
    <div class="space-y-8">
      <section
        aria-labelledby="dashboard-recently-added"
        class="rounded-panel border border-line bg-surface px-5 py-5"
      >
        <h2 id="dashboard-recently-added" class="text-section font-semibold">
          Recently added
        </h2>
        <Show
          when={props.recentAdded.length > 0}
          fallback={
            <p class="mt-4 text-muted">
              Nothing saved yet.{" "}
              <a class={linkClass} href={paths.app.problems()}>
                Browse your library
              </a>{" "}
              or add a problem.
            </p>
          }
        >
          <ul class="mt-3 divide-y divide-line">
            <For each={props.recentAdded}>
              {(problem) => <DashboardProblemPreviewRow problem={problem} />}
            </For>
          </ul>
          <p class="mt-4">
            <a class={`text-label ${linkClass}`} href={addedHref}>
              View all by date added
            </a>
          </p>
        </Show>
      </section>

      <section
        aria-labelledby="dashboard-recently-solved"
        class="rounded-panel border border-line bg-surface px-5 py-5"
      >
        <h2 id="dashboard-recently-solved" class="text-section font-semibold">
          Recently solved
        </h2>
        <Show
          when={props.recentSolved.length > 0}
          fallback={
            <p class="mt-4 text-muted">
              No solves yet.{" "}
              <a class={linkClass} href={solvedHref}>
                View solved problems
              </a>{" "}
              when you finish one.
            </p>
          }
        >
          <ul class="mt-3 divide-y divide-line">
            <For each={props.recentSolved}>
              {(problem) => <DashboardProblemPreviewRow problem={problem} />}
            </For>
          </ul>
          <p class="mt-4">
            <a class={`text-label ${linkClass}`} href={solvedHref}>
              View all recently solved
            </a>
          </p>
        </Show>
      </section>
    </div>
  );
}