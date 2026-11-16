import { For } from "solid-js";
import type { ActivityWeekBucket } from "../../lib/api/modules/progress.api";
import { formatWeekLabel } from "../../lib/dashboard/format-activity-summary";

type DashboardActivityTableProps = {
  weeks: ActivityWeekBucket[];
};

export function DashboardActivityTable(props: DashboardActivityTableProps) {
  return (
    <div class="overflow-x-auto">
      <table class="w-full min-w-[16rem] text-left text-sm">
        <caption class="sr-only">
          Weekly activity by week start date (UTC)
        </caption>
        <thead>
          <tr class="border-b border-line text-muted">
            <th scope="col" class="py-2 pr-4 font-medium">
              Week
            </th>
            <th scope="col" class="py-2 pr-4 font-medium tabular-nums">
              Added
            </th>
            <th scope="col" class="py-2 font-medium tabular-nums">
              Solved
            </th>
          </tr>
        </thead>
        <tbody>
          <For each={props.weeks}>
            {(row) => (
              <tr class="border-b border-line last:border-0">
                <th scope="row" class="py-2 pr-4 font-normal tabular-nums">
                  {formatWeekLabel(row.weekStart)}
                </th>
                <td class="py-2 pr-4 tabular-nums">{row.added}</td>
                <td class="py-2 tabular-nums">{row.solved}</td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );
}