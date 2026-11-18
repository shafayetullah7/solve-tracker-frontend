import { Show } from "solid-js";
import type { ProgressCounts } from "../../lib/api/modules/progress.api";
import { overallPercentComplete } from "../../lib/problems/progress-display";
import { problemNewPath } from "../../lib/problems/paths";
import { paths } from "../../router";
import { ProgressBar } from "../ui/ProgressBar";

type DashboardStatsStripProps = {
  counts: ProgressCounts;
  platformCount: number;
  weekSolved?: number;
  weekAdded?: number;
  readOnly?: boolean;
};

function StatCell(props: { label: string; value: string; hint: string }) {
  return (
    <div class="min-w-0 px-5 py-5">
      <p class="text-label font-medium uppercase tracking-wide text-muted">{props.label}</p>
      <p class="mt-1 text-page font-semibold tabular-nums tracking-tight">{props.value}</p>
      <p class="mt-1 text-sm text-muted">{props.hint}</p>
    </div>
  );
}

export function DashboardStatsStrip(props: DashboardStatsStripProps) {
  const percent = () => overallPercentComplete(props.counts);

  return (
    <section
      aria-label="Library totals"
      class="rounded-panel border border-line bg-surface shadow-panel"
    >
      <div class="grid grid-cols-2 divide-x divide-y divide-line sm:grid-cols-4 sm:divide-y-0">
        <StatCell
          label="Total"
          value={String(props.counts.total)}
          hint={
            props.platformCount > 0
              ? `Across ${props.platformCount} platform${props.platformCount === 1 ? "" : "s"}`
              : "No platforms yet"
          }
        />
        <StatCell
          label="Solved"
          value={String(props.counts.solved)}
          hint={
            props.weekSolved != null && props.weekSolved > 0
              ? `+${props.weekSolved} this week`
              : "No solves this week"
          }
        />
        <StatCell
          label="Unsolved"
          value={String(props.counts.unsolved)}
          hint={
            props.weekAdded != null && props.weekAdded > 0
              ? `${props.weekAdded} added this week`
              : "In your queue"
          }
        />
        <StatCell
          label="Complete"
          value={`${percent()}%`}
          hint={`${props.counts.solved} of ${props.counts.total} finished`}
        />
      </div>
      <Show when={props.counts.total > 0}>
        <div class="border-t border-line px-5 py-5">
          <ProgressBar
            value={percent()}
            label={`${percent()}% of problems solved`}
          />
        </div>
      </Show>
      <Show when={props.counts.total === 0 && !props.readOnly}>
        <p class="border-t border-line px-5 py-5 text-sm text-muted">
          No problems yet.{" "}
          <a class="text-brand underline-offset-4 hover:underline" href={problemNewPath()}>
            Add a problem
          </a>{" "}
          or{" "}
          <a class="text-brand underline-offset-4 hover:underline" href={paths.app.topics()}>
            manage topics
          </a>
          .
        </p>
      </Show>
    </section>
  );
}