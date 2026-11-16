import { For, Show } from "solid-js";
import type { ProblemResponse } from "../../lib/api/modules/problems.api";
import { problemNewPath } from "../../lib/problems/paths";
import { DashboardProblemPreviewRow } from "./DashboardProblemPreviewRow";

const linkClass =
  "text-brand underline-offset-4 hover:underline focus-visible:outline-offset-2";

type DashboardQueueColumnProps = {
  id: string;
  title: string;
  problems: ProblemResponse[];
  whenField?: "createdAt" | "solvedAt";
  empty: string;
  footerHref?: string;
  footerLabel?: string;
};

export function DashboardQueueColumn(props: DashboardQueueColumnProps) {
  return (
    <section
      aria-labelledby={props.id}
      class="flex min-h-[12rem] flex-col rounded-panel border border-line bg-surface px-5 py-5 shadow-panel"
    >
      <h2 id={props.id} class="text-body font-semibold">
        {props.title}
      </h2>
      <Show
        when={props.problems.length > 0}
        fallback={<p class="mt-3 flex-1 text-sm text-muted">{props.empty}</p>}
      >
        <ul class="mt-3 flex flex-1 flex-col gap-2">
          <For each={props.problems}>
            {(problem) => (
              <DashboardProblemPreviewRow
                problem={problem}
                whenField={props.whenField}
              />
            )}
          </For>
        </ul>
      </Show>
      <Show when={props.footerHref && props.footerLabel}>
        <p class="mt-3 border-t border-line pt-3">
          <a class={`text-label ${linkClass}`} href={props.footerHref!}>
            {props.footerLabel}
          </a>
        </p>
      </Show>
      <Show when={props.problems.length === 0 && props.title === "Pick up next"}>
        <p class="mt-2">
          <a class={`text-label ${linkClass}`} href={problemNewPath()}>
            Add a problem
          </a>
        </p>
      </Show>
    </section>
  );
}