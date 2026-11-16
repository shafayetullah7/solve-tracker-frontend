import type { ActivityStreak } from "../../lib/api/modules/progress.api";

type DashboardStreakBadgeProps = {
  streak: ActivityStreak;
  dark?: boolean;
};

export function DashboardStreakBadge(props: DashboardStreakBadgeProps) {
  if (props.streak.currentDays <= 0) return null;
  const label =
    props.streak.currentDays === 1
      ? "1-day solve streak"
      : `${props.streak.currentDays}-day solve streak`;
  return (
    <p
      class={
        props.dark
          ? "rounded-full border border-white/20 bg-white/10 px-3 py-1 text-label font-medium tabular-nums text-brand-soft"
          : "rounded-full border border-line bg-surface px-3 py-1 text-label font-medium tabular-nums text-brand"
      }
      role="status"
    >
      {label}
    </p>
  );
}