import { For, Show } from "solid-js";
import type { ProblemResponse } from "../../lib/api/modules/problems.api";
import {
  completionButtonLabel,
  completionButtonVariant,
} from "../../lib/problems/completion-actions";
import { problemDetailPath, problemEditPath } from "../../lib/problems/paths";
import { PlatformMark } from "../platforms/PlatformMark";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

const TOPIC_CHIP_MAX = 4;

type ProblemLibraryRowProps = {
  problem: ProblemResponse;
  statusPending: boolean;
  statusErrorMessage?: string;
  onToggleCompletion: () => void;
  onDelete: () => void;
};

export function ProblemLibraryRow(props: ProblemLibraryRowProps) {
  const visibleTopics = () => props.problem.topics.slice(0, TOPIC_CHIP_MAX);
  const overflowTopicCount = () =>
    Math.max(0, props.problem.topics.length - TOPIC_CHIP_MAX);

  return (
    <li class="border-b border-line pb-4 last:border-0">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0 flex-1 space-y-2">
          <div class="flex flex-wrap items-center gap-2">
            <a
              class="text-body font-medium text-brand underline-offset-4 hover:underline"
              href={problemDetailPath(props.problem.id)}
            >
              {props.problem.title}
            </a>
            <Badge
              tone={props.problem.status === "solved" ? "success" : "neutral"}
            >
              {props.problem.status === "solved" ? "Solved" : "Unsolved"}
            </Badge>
          </div>
          <PlatformMark
            slug={props.problem.platformSlug}
            url={props.problem.url}
          />
          <Show
            when={props.problem.topics.length > 0}
            fallback={<p class="text-sm text-muted">No topics</p>}
          >
            <div class="flex flex-wrap gap-2">
              <For each={visibleTopics()}>
                {(topic) => <Badge tone="brand">{topic.name}</Badge>}
              </For>
              <Show when={overflowTopicCount() > 0}>
                <Badge tone="neutral">+{overflowTopicCount()} more</Badge>
              </Show>
            </div>
          </Show>
          <Show when={props.statusErrorMessage}>
            <p class="text-sm text-danger" role="alert">
              {props.statusErrorMessage}
            </p>
          </Show>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <a
            class="ui-button"
            data-variant="secondary"
            href={props.problem.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open
          </a>
          <Button
            variant={completionButtonVariant(props.problem.status)}
            disabled={props.statusPending}
            aria-busy={props.statusPending}
            onClick={() => props.onToggleCompletion()}
          >
            {completionButtonLabel(props.problem.status, props.statusPending)}
          </Button>
          <details class="relative">
            <summary
              class="ui-button cursor-pointer list-none [&::-webkit-details-marker]:hidden"
              aria-label="More actions"
            >
              More
            </summary>
            <div class="absolute right-0 z-20 mt-2 min-w-36 rounded-control border border-line bg-surface p-2 shadow-panel">
              <a
                class="block rounded-control px-3 py-2 text-sm hover:bg-surface-muted"
                href={problemEditPath(props.problem.id)}
              >
                Edit
              </a>
              <button
                type="button"
                class="block w-full rounded-control px-3 py-2 text-left text-sm hover:bg-surface-muted"
                onClick={() => props.onDelete()}
              >
                Delete
              </button>
            </div>
          </details>
        </div>
      </div>
    </li>
  );
}