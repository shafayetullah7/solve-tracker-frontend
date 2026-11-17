import { Show } from "solid-js";
import type { ActivityStreak } from "../../lib/api/modules/progress.api";

type DashboardStreakBadgeProps = {
  streak: ActivityStreak;
  dark?: boolean;
};

export function DashboardStreakBadge(props: DashboardStreakBadgeProps) {
  const days = () => props.streak.currentDays;
  return (
    <Show when={days() > 0}>
      <p
        class={
          props.dark
            ? "rounded-full border border-white/20 bg-white/10 px-3 py-1 text-label font-medium tabular-nums text-brand-soft"
            : "rounded-full border border-line bg-surface px-3 py-1 text-label font-medium tabular-nums text-brand"
        }
        role="status"
      >
        {days() === 1 ? "1-day solve streak" : `${days()}-day solve streak`}
      </p>
    </Show>
  );
}
