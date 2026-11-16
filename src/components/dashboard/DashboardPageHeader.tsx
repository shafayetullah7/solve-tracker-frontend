import type { PlatformProgress } from "../../lib/api/modules/progress.api";
import { dashboardSyncLabel } from "../../lib/dashboard/dashboard-sync-label";

type DashboardPageHeaderProps = {
  platforms?: PlatformProgress[];
};

export function DashboardPageHeader(props: DashboardPageHeaderProps) {
  const sync = () => dashboardSyncLabel(props.platforms ?? []);

  return (
    <header class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div class="space-y-2">
        <h1 class="text-page font-semibold tracking-tight">Your practice</h1>
        <p class="max-w-xl text-label text-muted">
          Algorithmic telemetry, deliberate recall intervals, and active problem sets.
        </p>
      </div>
      <p
        class="inline-flex shrink-0 items-center gap-2 text-label text-muted"
        role="status"
      >
        <span class="size-2 rounded-full bg-brand" aria-hidden="true" />
        {sync()}
      </p>
    </header>
  );
}