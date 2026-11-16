import type { ProblemResponse } from "../../lib/api/modules/problems.api";
import { formatDashboardWhen } from "../../lib/dashboard/format-dashboard-dates";
import { problemDetailPath } from "../../lib/problems/paths";
import { PlatformMark } from "../platforms/PlatformMark";

type DashboardProblemPreviewRowProps = {
  problem: ProblemResponse;
  /** Which timestamp to show on the right */
  whenField?: "createdAt" | "solvedAt";
};

export function DashboardProblemPreviewRow(props: DashboardProblemPreviewRowProps) {
  const whenField = () => props.whenField ?? "createdAt";
  const whenIso = () => {
    if (whenField() === "solvedAt" && props.problem.solvedAt) {
      return props.problem.solvedAt;
    }
    return props.problem.createdAt;
  };

  const topicLabel = () => props.problem.topics[0]?.name;

  return (
    <li class="rounded-control border border-line bg-surface-muted/30 px-3 py-3 transition-colors hover:bg-surface-muted/60">
      <div class="flex items-start justify-between gap-2">
        <a
          class="min-w-0 flex-1 text-body font-medium text-brand underline-offset-4 hover:underline"
          href={problemDetailPath(props.problem.id)}
        >
          {props.problem.title}
        </a>
        <span class="shrink-0 text-xs text-muted tabular-nums">
          {formatDashboardWhen(whenIso())}
        </span>
      </div>
      <div class="mt-2 flex flex-wrap items-center gap-2">
        <PlatformMark url={props.problem.url} class="text-xs" />
        {topicLabel() && (
          <span class="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand">
            {topicLabel()}
          </span>
        )}
        {props.problem.difficulty && (
          <span class="text-xs text-muted capitalize">{props.problem.difficulty}</span>
        )}
        {props.problem.status === "solved" && (
          <span class="text-xs font-medium text-brand" aria-label="Solved">
            ✓
          </span>
        )}
      </div>
    </li>
  );
}