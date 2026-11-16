import { createMemo, For } from "solid-js";
import type { ProgressActivityResponse } from "../../lib/api/modules/progress.api";
import {
  formatActivityChartSummary,
  formatWeekLabel,
} from "../../lib/dashboard/format-activity-summary";

type DashboardActivityChartProps = {
  data: ProgressActivityResponse;
};

const BAR_MAX_PX = 96;

export function DashboardActivityChart(props: DashboardActivityChartProps) {
  const maxCount = createMemo(() => {
    let max = 1;
    for (const row of props.data.weeks) {
      max = Math.max(max, row.added, row.solved);
    }
    return max;
  });

  const summary = () => formatActivityChartSummary(props.data);

  const barHeight = (value: number) =>
    Math.max(4, Math.round((value / maxCount()) * BAR_MAX_PX));

  return (
    <div class="space-y-3" aria-label={summary()}>
      <ul class="flex items-end justify-between gap-1 sm:gap-2" aria-hidden="true">
        <For each={props.data.weeks}>
          {(row) => (
            <li class="flex min-w-0 flex-1 flex-col items-center gap-1">
              <div class="flex h-28 w-full items-end justify-center gap-0.5">
                <div
                  class="w-[45%] rounded-t-sm bg-surface-muted"
                  style={{ height: `${barHeight(row.added)}px` }}
                  title={`${formatWeekLabel(row.weekStart)}: ${row.added} added`}
                />
                <div
                  class="w-[45%] rounded-t-sm bg-brand"
                  style={{ height: `${barHeight(row.solved)}px` }}
                  title={`${formatWeekLabel(row.weekStart)}: ${row.solved} solved`}
                />
              </div>
              <span class="truncate text-[10px] text-muted tabular-nums sm:text-xs">
                {formatWeekLabel(row.weekStart)}
              </span>
            </li>
          )}
        </For>
      </ul>
      <p class="flex flex-wrap items-center gap-x-4 gap-y-1 text-label text-muted">
        <span class="inline-flex items-center gap-1.5">
          <span class="size-2 rounded-sm bg-surface-muted" aria-hidden="true" />
          Added
        </span>
        <span class="inline-flex items-center gap-1.5">
          <span class="size-2 rounded-sm bg-brand" aria-hidden="true" />
          Solved
        </span>
      </p>
    </div>
  );
}