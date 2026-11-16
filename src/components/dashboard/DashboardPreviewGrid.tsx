import { Match, Show, Switch } from "solid-js";
import type { ProblemResponse } from "../../lib/api/modules/problems.api";
import { Button } from "../ui/Button";
import { LoadingPlaceholder } from "../ui/LoadingPlaceholder";
import { DashboardFocusList } from "./DashboardFocusList";
import { DashboardRecentLists } from "./DashboardRecentLists";

type DashboardPreviewGridProps = {
  status: "idle" | "loading" | "ready" | "error";
  focus: ProblemResponse[];
  recentAdded: ProblemResponse[];
  recentSolved: ProblemResponse[];
  errorMessage?: string;
  onRetry?: () => void;
};

export function DashboardPreviewGrid(props: DashboardPreviewGridProps) {
  return (
    <Switch>
      <Match when={props.status === "idle" || props.status === "loading"}>
        <div class="grid gap-8 md:grid-cols-2 md:items-start">
          <div class="rounded-panel border border-line bg-surface px-5 py-5">
            <LoadingPlaceholder variant="row" lines={3} />
          </div>
          <div class="rounded-panel border border-line bg-surface px-5 py-5">
            <LoadingPlaceholder variant="row" lines={3} />
          </div>
        </div>
      </Match>
      <Match when={props.status === "error"}>
        <div class="space-y-4" role="alert">
          <p class="text-muted">{props.errorMessage ?? "Could not load previews."}</p>
          <Show when={props.onRetry}>
            <Button variant="secondary" onClick={() => props.onRetry!()}>
              Try again
            </Button>
          </Show>
        </div>
      </Match>
      <Match when={props.status === "ready"}>
        <div class="grid gap-8 md:grid-cols-2 md:items-start">
          <DashboardFocusList problems={props.focus} />
          <DashboardRecentLists
            recentAdded={props.recentAdded}
            recentSolved={props.recentSolved}
          />
        </div>
      </Match>
    </Switch>
  );
}