import { For, Show } from "solid-js";
import type { ContentBlock, NodeResponse } from "../../../lib/api/modules/learning-guides.api";
import {
  learningEditPath,
  learningGuidePath,
  learningStudyPath,
} from "../../../lib/learning/paths";
import { completionMode } from "../../../lib/learning/completion-modes";
import { ancestors, studyNeighbors } from "../../../lib/learning/tree-nav";
import { BlockList } from "../blocks/BlockViews";
import { GuideOutline } from "../outline/GuideOutline";
import { Button } from "../../ui/Button";

export type StudyShellProps = {
  guideId: string;
  guideTitle: string;
  node: NodeResponse;
  nodes: readonly NodeResponse[];
  blocks: readonly ContentBlock[];
  contentLoading: boolean;
  completePending: boolean;
  onToggleComplete: () => void;
  addChildPending: boolean;
  addChildTitle: string;
  onAddChildTitle: (value: string) => void;
  onAddChild: () => void;
};

export function StudyShell(props: StudyShellProps) {
  const neighbors = () => studyNeighbors(props.nodes, props.node.id);
  const trail = () => ancestors(props.nodes, props.node.id);

  return (
    <div class="grid gap-8 lg:grid-cols-[minmax(12rem,18rem)_1fr]">
      <aside class="space-y-4">
        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-muted">Guide</p>
          <a
            href={learningGuidePath(props.guideId)}
            class="text-label font-medium text-brand hover:underline"
          >
            {props.guideTitle}
          </a>
        </div>
        <GuideOutline
          guideId={props.guideId}
          nodes={props.nodes}
          currentNodeId={props.node.id}
        />
      </aside>
      <article class="min-w-0 space-y-6">
        <nav aria-label="Breadcrumb" class="text-sm text-muted">
          <ol class="flex flex-wrap items-center gap-1">
            <li>
              <a href={learningGuidePath(props.guideId)} class="hover:text-brand">
                Overview
              </a>
            </li>
            <For each={trail()}>
              {(item) => (
                <>
                  <li aria-hidden="true">/</li>
                  <li>
                    <a
                      href={learningStudyPath(props.guideId, item.id)}
                      class="hover:text-brand"
                    >
                      {item.title}
                    </a>
                  </li>
                </>
              )}
            </For>
            <li aria-hidden="true">/</li>
            <li class="text-ink">{props.node.title}</li>
          </ol>
        </nav>
        <header class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 class="text-page font-semibold tracking-tight text-ink">{props.node.title}</h1>
            <Show when={props.node.completed}>
              <p class="mt-1 text-sm font-medium text-brand">Completed</p>
            </Show>
          </div>
          <a
            class="ui-button inline-flex shrink-0 items-center"
            data-variant="secondary"
            href={learningEditPath(props.guideId, props.node.id)}
          >
            Edit content
          </a>
        </header>
        <Show when={props.node.completionMode === completionMode.Manual}>
          <div>
            <Button
              type="button"
              variant={props.node.completed ? "secondary" : "primary"}
              disabled={props.completePending}
              onClick={() => props.onToggleComplete()}
            >
              {props.completePending
                ? "Saving…"
                : props.node.completed
                  ? "Mark incomplete"
                  : "Mark complete"}
            </Button>
          </div>
        </Show>
        <Show when={props.contentLoading} fallback={<BlockList blocks={props.blocks} />}>
          <p class="text-body text-muted">Loading content…</p>
        </Show>
        <div class="flex flex-wrap gap-2">
          <Show when={neighbors().previous}>
            {(prev) => (
              <a
                class="ui-button inline-flex items-center"
                data-variant="secondary"
                href={learningStudyPath(props.guideId, prev().id)}
              >
                Previous: {prev().title}
              </a>
            )}
          </Show>
          <Show when={neighbors().next}>
            {(next) => (
              <a
                class="ui-button inline-flex items-center"
                data-variant="secondary"
                href={learningStudyPath(props.guideId, next().id)}
              >
                Next: {next().title}
              </a>
            )}
          </Show>
        </div>
        <section class="rounded-panel border border-line bg-surface p-4">
          <h2 class="text-label font-semibold text-ink">Add child step</h2>
          <div class="mt-3 flex flex-wrap gap-2">
            <input
              class="min-h-11 min-w-[12rem] flex-1 rounded-control border border-line bg-surface px-3 text-base text-ink"
              value={props.addChildTitle}
              maxlength={200}
              placeholder="Step title"
              disabled={props.addChildPending}
              onInput={(event) => props.onAddChildTitle(event.currentTarget.value)}
            />
            <Button
              type="button"
              disabled={props.addChildPending || props.addChildTitle.trim().length === 0}
              onClick={() => props.onAddChild()}
            >
              {props.addChildPending ? "Adding…" : "Add under this step"}
            </Button>
          </div>
        </section>
      </article>
    </div>
  );
}