import { createMemo, For } from "solid-js";
import { discoverCopy } from "../../lib/discover/copy";
import type { CompareResponse } from "../../lib/api/modules/discover.api";

type Side = CompareResponse["me"];

export function CompareSummaryTable(props: {
  me: Side;
  them: Side;
  themLabel: string;
}) {
  const rows = createMemo(() => [
    { label: "Solved", me: props.me.solved, them: props.them.solved },
    { label: "Total", me: props.me.total, them: props.them.total },
    {
      label: discoverCopy("dashboard.benchmarkSolvesPerWeek"),
      me: props.me.solvesPerWeek.toFixed(1),
      them: props.them.solvesPerWeek.toFixed(1),
    },
    {
      label: discoverCopy("dashboard.benchmarkActiveWeeks"),
      me: props.me.activeWeeks,
      them: props.them.activeWeeks,
    },
    { label: "Streak (days)", me: props.me.streakDays, them: props.them.streakDays },
  ]);

  return (
    <section aria-labelledby="compare-summary">
      <h2 id="compare-summary" class="text-title text-ink">
        {discoverCopy("compare.summaryTable")}
      </h2>
      <div class="mt-3 overflow-x-auto rounded-panel border border-line">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-surface-muted/40 text-label text-muted">
            <tr>
              <th class="px-3 py-2 font-medium" scope="col">
                Metric
              </th>
              <th class="px-3 py-2 font-medium text-brand" scope="col">
                You
              </th>
              <th class="px-3 py-2 font-medium" scope="col">
                {props.themLabel}
              </th>
            </tr>
          </thead>
          <tbody>
            <For each={rows()}>{(row) => (
              <tr class="border-t border-line">
                <th class="px-3 py-2 font-normal text-muted" scope="row">
                  {row.label}
                </th>
                <td class="px-3 py-2 tabular-nums font-medium text-brand">{row.me}</td>
                <td class="px-3 py-2 tabular-nums">{row.them}</td>
              </tr>
            )}</For>
          </tbody>
        </table>
      </div>
    </section>
  );
}