import type { ProblemResponse } from "../../lib/api/modules/problems.api";
import { problemDetailPath } from "../../lib/problems/paths";
import { PlatformMark } from "../platforms/PlatformMark";

type DashboardProblemPreviewRowProps = {
  problem: ProblemResponse;
};

export function DashboardProblemPreviewRow(props: DashboardProblemPreviewRowProps) {
  return (
    <li class="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
      <a
        class="min-w-0 flex-1 text-body font-medium text-brand underline-offset-4 hover:underline"
        href={problemDetailPath(props.problem.id)}
      >
        {props.problem.title}
      </a>
      <PlatformMark url={props.problem.url} class="shrink-0 text-sm text-muted" />
    </li>
  );
}