/** Relative label for dashboard preview rows (UTC input ISO strings). */
export function formatDashboardWhen(iso: string | null | undefined): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";

  const now = Date.now();
  const diffMs = now - then;

  const startToday = new Date();
  startToday.setHours(0, 0, 0, 0);
  const startThen = new Date(iso);
  startThen.setHours(0, 0, 0, 0);
  const dayDiff = Math.round((startToday.getTime() - startThen.getTime()) / (86400000));

  if (diffMs < 0) {
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
  if (dayDiff === 0) return "Today";

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 24) {
    if (diffHours < 1) return "Just now";
    return `${diffHours}h ago`;
  }
  if (dayDiff === 1) return "Yesterday";
  if (dayDiff < 7) return `${dayDiff}d ago`;

  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatWeekRangeLabel(weekStart: string): string {
  const start = new Date(`${weekStart}T00:00:00.000Z`);
  const end = new Date(start.getTime() + 6 * 86400000);
  const sameMonth = start.getUTCMonth() === end.getUTCMonth();
  const startFmt = start.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  const endFmt = end.toLocaleDateString(undefined, {
    month: sameMonth ? undefined : "short",
    day: "numeric",
    timeZone: "UTC",
  });
  return `${startFmt} – ${endFmt}`;
}