import { Show } from "solid-js";
import type { ProgressCounts } from "../../lib/api/modules/progress.api";
import { overallPercentComplete } from "../../lib/problems/progress-display";
import { problemNewPath } from "../../lib/problems/paths";
import { paths } from "../../router";
import { Panel } from "../ui/Panel";
import { ProgressBar } from "../ui/ProgressBar";

type DashboardOverallPanelProps = {
  counts: ProgressCounts;
};

function StatBlock(props: { label: string; value: number }) {
  return (
    <div class="rounded-control border border-line bg-surface-muted/40 px-4 py-3">
      <p class="text-label text-muted">{props.label}</p>
      <p class="mt-1 text-section font-semibold tabular-nums tracking-tight">
        {props.value}
      </p>
    </div>
  );
}

export function DashboardOverallPanel(props: DashboardOverallPanelProps) {
  const percent = () => overallPercentComplete(props.counts);

  return (
    <Panel title="Overall" description="Full library — not affected by browse filters.">
      <div
        class="grid grid-cols-2 gap-3 sm:grid-cols-4"
        role="group"
        aria-label="Library totals"
      >
        <StatBlock label="Total" value={props.counts.total} />
        <StatBlock label="Solved" value={props.counts.solved} />
        <StatBlock label="Unsolved" value={props.counts.unsolved} />
        <StatBlock label="Complete" value={percent()} />
      </div>

      <Show when={props.counts.total > 0}>
        <div class="mt-5">
          <ProgressBar
            value={percent()}
            label={`${percent()}% of problems solved`}
          />
        </div>
      </Show>

      <Show when={props.counts.total === 0}>
        <p class="mt-5 text-muted">
          You have not saved any problems yet.{" "}
          <a
            class="text-brand underline-offset-4 hover:underline"
            href={problemNewPath()}
          >
            Add a problem
          </a>{" "}
          or{" "}
          <a
            class="text-brand underline-offset-4 hover:underline"
            href={paths.app.topics()}
          >
            manage topics
          </a>{" "}
          to get started.
        </p>
      </Show>
    </Panel>
  );
}