import type { ProgressActivityResponse } from "../api/modules/progress.api";

export function formatActivityChartSummary(
  data: ProgressActivityResponse,
): string {
  const added = data.weeks.reduce((sum, row) => sum + row.added, 0);
  const solved = data.weeks.reduce((sum, row) => sum + row.solved, 0);
  const weeks = data.weeks.length;
  const streak =
    data.streak.currentDays > 0
      ? ` Current solve streak: ${data.streak.currentDays} day${data.streak.currentDays === 1 ? "" : "s"}.`
      : "";
  return `Last ${weeks} weeks (UTC): ${added} problems added, ${solved} solved.${streak}`;
}

export function formatWeekLabel(weekStart: string): string {
  const date = new Date(`${weekStart}T00:00:00.000Z`);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}