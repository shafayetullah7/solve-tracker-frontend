import { Show } from "solid-js";
import type { PlatformProgress } from "../../lib/api/modules/progress.api";
import { dashboardSyncLabel } from "../../lib/dashboard/dashboard-sync-label";

type DashboardPageHeaderProps = {
  /** Omit while progress is loading or failed — no sync label is shown. */
  platforms?: PlatformProgress[];
};

export function DashboardPageHeader(props: DashboardPageHeaderProps) {

  return (
    <header class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div class="space-y-2">
        <h1 class="text-page font-semibold tracking-tight">Your practice</h1>
        <p class="max-w-xl text-label text-muted">
          Algorithmic telemetry, deliberate recall intervals, and active problem sets.
        </p>
      </div>
      <Show when={props.platforms}>
        {(platforms) => (
          <p
            class="inline-flex shrink-0 items-center gap-2 text-label text-muted"
            role="status"
          >
            <span class="size-2 rounded-full bg-brand" aria-hidden="true" />
            {dashboardSyncLabel(platforms())}
          </p>
        )}
      </Show>
    </header>
  );
}