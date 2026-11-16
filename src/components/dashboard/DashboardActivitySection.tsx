import { createMemo, For, Match, Show, Switch } from "solid-js";
import type { ProgressActivityResponse } from "../../lib/api/modules/progress.api";
import { formatWeekRangeLabel } from "../../lib/dashboard/format-dashboard-dates";
import { problemNewPath } from "../../lib/problems/paths";
import { paths } from "../../router";
import { Button } from "../ui/Button";
import { LoadingPlaceholder } from "../ui/LoadingPlaceholder";
import { DashboardActivityChart } from "./DashboardActivityChart";
import { DashboardStreakBadge } from "./DashboardStreakBadge";

const linkClass =
  "text-brand underline-offset-4 hover:underline focus-visible:outline-offset-2";

type DashboardActivitySectionProps = {
  status: "idle" | "loading" | "ready" | "error";
  data?: ProgressActivityResponse;
  errorMessage?: string;
  onRetry?: () => void;
};

function isActivityEmpty(data: ProgressActivityResponse): boolean {
  return data.weeks.every((row) => row.added === 0 && row.solved === 0);
}

function momentumLabel(data: ProgressActivityResponse): string | null {
  const recent = data.weeks.slice(-2);
  if (recent.length < 2) return null;
  const [prev, curr] = recent;
  const prevTotal = prev.added + prev.solved;
  const currTotal = curr.added + curr.solved;
  if (prevTotal === 0 && currTotal === 0) return null;
  if (prevTotal === 0) return "Activity picking up";
  const pct = Math.round(((currTotal - prevTotal) / prevTotal) * 100);
  if (pct === 0) return "Steady week";
  return `${pct > 0 ? "+" : ""}${pct}% vs last week`;
}

export function DashboardActivitySection(props: DashboardActivitySectionProps) {
  const chartData = createMemo(() => {
    if (!props.data) return undefined;
    return {
      ...props.data,
      weeks: props.data.weeks.slice(-8),
    };
  });

  const recentWeekRows = createMemo(() => props.data?.weeks.slice(-4).reverse() ?? []);

  return (
    <section
      aria-labelledby="dashboard-activity"
      class="rounded-panel border border-line bg-[#0f1513] px-5 py-5 text-[#e8eeec] shadow-panel"
    >
      <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id="dashboard-activity" class="text-section font-semibold text-white">
            Activity
          </h2>
          <p class="mt-1 text-label text-[#9aa8a3]">12-week window (UTC)</p>
        </div>
        <Show when={props.status === "ready" && props.data}>
          {(data) => <DashboardStreakBadge streak={data().streak} dark />}
        </Show>
      </div>
      <Switch>
        <Match when={props.status === "idle" || props.status === "loading"}>
          <div class="mt-4">
            <LoadingPlaceholder variant="block" />
          </div>
        </Match>
        <Match when={props.status === "error"}>
          <div class="mt-4 space-y-4" role="alert">
            <p class="text-[#9aa8a3]">{props.errorMessage ?? "Could not load activity."}</p>
            {props.onRetry ? (
              <Button variant="secondary" onClick={() => props.onRetry!()}>
                Try again
              </Button>
            ) : null}
          </div>
        </Match>
        <Match when={props.status === "ready" && props.data}>
          {(data) => (
            <>
              {isActivityEmpty(data()) ? (
                <p class="mt-4 text-[#9aa8a3]">
                  No activity in this window yet.{" "}
                  <a class={linkClass} href={paths.app.problems()}>
                    Browse library
                  </a>{" "}
                  or{" "}
                  <a class={linkClass} href={problemNewPath()}>
                    add a problem
                  </a>
                  .
                </p>
              ) : (
                <div class="mt-4">
                  <Show when={chartData()}>
                    {(cd) => <DashboardActivityChart data={cd()} dark />}
                  </Show>
                  <ul class="mt-6 space-y-3 border-t border-[#2a3330] pt-4" role="list">
                    <For each={recentWeekRows()}>
                      {(row) => (
                        <li class="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                          <span class="font-medium text-white">
                            {formatWeekRangeLabel(row.weekStart)}
                          </span>
                          <span class="text-[#9aa8a3] tabular-nums">
                            Added: {row.added} · Solved: {row.solved}
                          </span>
                        </li>
                      )}
                    </For>
                  </ul>
                  <p class="mt-4 flex flex-wrap items-center justify-between gap-2 text-label">
                    <span class="text-[#9aa8a3]">{momentumLabel(data()) ?? ""}</span>
                  </p>
                </div>
              )}
            </>
          )}
        </Match>
      </Switch>
    </section>
  );
}