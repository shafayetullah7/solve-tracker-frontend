import { For } from "solid-js";
import { PlatformMark } from "../platforms/PlatformMark";
import { Badge } from "../ui/Badge";
import { LoadingPlaceholder } from "../ui/LoadingPlaceholder";
import { LANDING_PREVIEW_ARIA } from "./landing-copy";
import {
  LANDING_PREVIEW_PROBLEM,
  LANDING_PREVIEW_PROBLEM_SECOND,
  type LandingPreviewProblem,
} from "./landing-preview-data";

function PreviewRow(props: { problem: LandingPreviewProblem }) {
  return (
    <li class="border-b border-line pb-4 last:border-0 last:pb-0">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0 flex-1 space-y-2.5">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-body font-medium text-ink">{props.problem.title}</span>
            <Badge tone={props.problem.status === "solved" ? "success" : "neutral"}>
              {props.problem.status === "solved" ? "Solved" : "Unsolved"}
            </Badge>
          </div>
          <PlatformMark slug={props.problem.slug} />
          <div class="flex flex-wrap gap-2">
            <For each={props.problem.topics}>
              {(topic) => <Badge tone="brand">{topic}</Badge>}
            </For>
          </div>
        </div>
      </div>
    </li>
  );
}

export function LandingLibraryPreview() {
  return (
    <div
      class="rounded-panel border border-line bg-surface p-5 shadow-panel ring-1 ring-line/60 sm:p-6"
      role="img"
      aria-label={LANDING_PREVIEW_ARIA}
    >
      <p class="mb-4 border-b border-line pb-3 text-label font-medium text-muted">
        Example — your library
      </p>
      <ul class="space-y-4">
        <PreviewRow problem={LANDING_PREVIEW_PROBLEM} />
        <PreviewRow problem={LANDING_PREVIEW_PROBLEM_SECOND} />
      </ul>
      <div class="mt-4 rounded-lg bg-surface-muted/80 p-3 opacity-80" aria-hidden="true">
        <LoadingPlaceholder variant="row" lines={1} />
      </div>
    </div>
  );
}