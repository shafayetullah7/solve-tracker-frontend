import { Show } from "solid-js";
import type { PlatformProgress } from "../../lib/api/modules/progress.api";
import { dashboardPlatformBrowseHref } from "../../lib/dashboard/dashboard-platform-href";
import { overallPercentComplete } from "../../lib/problems/progress-display";
import { PlatformMark } from "../platforms/PlatformMark";
import { ProgressBar } from "../ui/ProgressBar";

const linkClass =
  "text-brand underline-offset-4 hover:underline focus-visible:outline-offset-2";

type DashboardPlatformCellProps = {
  row: PlatformProgress;
  readOnly?: boolean;
};

export function DashboardPlatformCell(props: DashboardPlatformCellProps) {
  const href = () => dashboardPlatformBrowseHref(props.row);
  const inner = (
    <>
      <PlatformMark
        slug={props.row.slug === "other" ? undefined : props.row.slug}
        label={props.row.name}
        class="text-body font-medium text-foreground"
      />
      <p class="mt-2 text-sm text-muted tabular-nums">
        {props.row.solved} / {props.row.total} solved
      </p>
      <div class="mt-2">
        <ProgressBar
          value={overallPercentComplete(props.row)}
          label={`${props.row.name}: ${overallPercentComplete(props.row)}% solved`}
        />
      </div>
      <Show
        when={!props.readOnly}
        fallback={<p class="mt-2 text-label text-muted">{props.row.name}</p>}
      >
        <p class={`mt-2 text-label ${linkClass}`}>View on {props.row.name}</p>
      </Show>
    </>
  );

  return (
    <Show
      when={!props.readOnly}
      fallback={
        <div class="block rounded-panel border border-line bg-surface px-4 py-4">
          {inner}
        </div>
      }
    >
      <a
        class="block rounded-panel border border-line bg-surface px-4 py-4 transition-colors hover:bg-surface-muted focus-visible:outline-offset-2"
        href={href()}
      >
        {inner}
      </a>
    </Show>
  );
}