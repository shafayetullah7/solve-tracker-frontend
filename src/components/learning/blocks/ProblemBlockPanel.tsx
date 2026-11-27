import { Show } from "solid-js";
import type { ContentBlock } from "../../../lib/api/modules/learning-guides.api";
import { learningStudyPath } from "../../../lib/learning/paths";
import {
  effectiveProblemResolution,
  problemResolutionBadgeText,
} from "../../../lib/learning/problem-resolution";
import { STUDY_LINKED_PROBLEMS_HINT } from "../../../lib/learning/learning-product-copy";
import { problemDetailPath, problemNewFromStudy } from "../../../lib/problems/paths";
import { PlatformMark } from "../../platforms/PlatformMark";

function problemLabel(payload: Record<string, unknown>): string {
  if (typeof payload.label === "string" && payload.label.trim().length > 0) {
    return payload.label.trim();
  }
  return "Practice problem";
}

export function ProblemBlockPanel(props: {
  block: ContentBlock;
  guideId?: string;
  returnNodeId?: string;
}) {
  const url = () =>
    typeof props.block.payload.url === "string" ? props.block.payload.url : "";
  const resolution = () => effectiveProblemResolution(props.block.problemResolution);
  const label = () => problemLabel(props.block.payload as Record<string, unknown>);
  const canAddToLibrary = () =>
    Boolean(
      props.guideId &&
        props.returnNodeId &&
        url() &&
        resolution() === "unresolved",
    );

  return (
    <div class="space-y-3">
      <div class="flex flex-wrap items-center gap-2">
        <PlatformMark url={url()} class="text-ink" />
        <span class="rounded-control bg-surface-muted px-2 py-0.5 text-xs text-ink">
          Status: {problemResolutionBadgeText(resolution())}
        </span>
      </div>
      <p class="text-label font-medium text-ink">{label()}</p>
      <div class="flex flex-wrap gap-2">
        <Show when={resolution() === "unresolved" && canAddToLibrary()}>
          <a
            class="ui-button inline-flex items-center"
            data-variant="primary"
            href={problemNewFromStudy({
              url: url(),
              title: label(),
              next: learningStudyPath(props.guideId!, props.returnNodeId!),
            })}
          >
            Add to library
          </a>
        </Show>
        <Show
          when={
            resolution() === "linked_unsolved" || resolution() === "solved"
              ? props.block.problemId
              : undefined
          }
        >
          {(problemId) => (
            <a
              class="ui-button inline-flex items-center"
              data-variant={resolution() === "solved" ? "secondary" : "primary"}
              href={problemDetailPath(problemId())}
            >
              {resolution() === "solved" ? "View in library" : "Open in library"}
            </a>
          )}
        </Show>
        <Show when={url()}>
          {(href) => (
            <a
              class="ui-button inline-flex items-center"
              data-variant="secondary"
              href={href()}
              rel="noopener noreferrer"
              target="_blank"
            >
              Open on judge
            </a>
          )}
        </Show>
      </div>
      <p class="text-sm text-muted">{STUDY_LINKED_PROBLEMS_HINT}</p>
    </div>
  );
}