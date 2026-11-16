import { Match, Show, Switch } from "solid-js";
import type { ProgressActivityResponse } from "../../lib/api/modules/progress.api";
import { problemNewPath } from "../../lib/problems/paths";
import { paths } from "../../router";
import { Button } from "../ui/Button";
import { LoadingPlaceholder } from "../ui/LoadingPlaceholder";
import { DashboardActivityChart } from "./DashboardActivityChart";
import { DashboardActivityTable } from "./DashboardActivityTable";
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

export function DashboardActivitySection(props: DashboardActivitySectionProps) {
  return (
    <section aria-labelledby="dashboard-activity">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id="dashboard-activity" class="text-section font-semibold">
            Activity
          </h2>
          <p class="mt-1 text-label text-muted">Last 12 weeks (UTC)</p>
        </div>
        <Show when={props.status === "ready" && props.data}>
          {(data) => <DashboardStreakBadge streak={data().streak} />}
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
            <p class="text-muted">
              {props.errorMessage ?? "Could not load activity."}
            </p>
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
                <p class="mt-4 text-muted">
                  No activity in this window yet.{" "}
                  <a class={linkClass} href={paths.app.problems()}>
                    Browse your library
                  </a>{" "}
                  or{" "}
                  <a class={linkClass} href={problemNewPath()}>
                    add a problem
                  </a>
                  .
                </p>
              ) : null}
              <div class="mt-4 grid gap-8 md:grid-cols-2 md:items-start">
                <DashboardActivityChart data={data()} />
                <DashboardActivityTable weeks={data().weeks} />
              </div>
            </>
          )}
        </Match>
      </Switch>
    </section>
  );
}