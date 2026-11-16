import { Match, Switch } from "solid-js";
import type { ProblemResponse } from "../../lib/api/modules/problems.api";
import { dashboardBrowseHref } from "../../lib/dashboard/dashboard-queries";
import { paths } from "../../router";
import { Button } from "../ui/Button";
import { LoadingPlaceholder } from "../ui/LoadingPlaceholder";
import { DashboardQueueColumn } from "./DashboardQueueColumn";

type DashboardQueueGridProps = {
  status: "idle" | "loading" | "ready" | "error";
  focus: ProblemResponse[];
  recentAdded: ProblemResponse[];
  recentSolved: ProblemResponse[];
  errorMessage?: string;
  onRetry?: () => void;
};

export function DashboardQueueGrid(props: DashboardQueueGridProps) {
  return (
    <Switch>
      <Match when={props.status === "idle" || props.status === "loading"}>
        <div class="grid gap-4 lg:grid-cols-3">
          <LoadingPlaceholder variant="block" />
          <LoadingPlaceholder variant="block" />
          <LoadingPlaceholder variant="block" />
        </div>
      </Match>
      <Match when={props.status === "error"}>
        <div class="space-y-4" role="alert">
          <p class="text-muted">{props.errorMessage ?? "Could not load previews."}</p>
          {props.onRetry ? (
            <Button variant="secondary" onClick={() => props.onRetry!()}>
              Try again
            </Button>
          ) : null}
        </div>
      </Match>
      <Match when={props.status === "ready"}>
        <div class="grid gap-4 lg:grid-cols-3">
          <DashboardQueueColumn
            id="dashboard-pick-up-next"
            title="Pick up next"
            problems={props.focus}
            whenField="createdAt"
            empty="No unsolved problems in your queue."
            footerHref={dashboardBrowseHref("focusQueue")}
            footerLabel="View all unsolved"
          />
          <DashboardQueueColumn
            id="dashboard-recently-added"
            title="Recently added"
            problems={props.recentAdded}
            whenField="createdAt"
            empty="Nothing saved yet."
            footerHref={paths.app.problems()}
            footerLabel="Browse library"
          />
          <DashboardQueueColumn
            id="dashboard-recently-solved"
            title="Recently solved"
            problems={props.recentSolved}
            whenField="solvedAt"
            empty="No solves yet."
            footerHref={dashboardBrowseHref("recentSolved")}
            footerLabel="View solved problems"
          />
        </div>
      </Match>
    </Switch>
  );
}