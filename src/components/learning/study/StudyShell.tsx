import { For, Show } from "solid-js";
import type { NodeResponse } from "../../../lib/api/modules/learning-guides.api";
import { learningGuidePath, learningStudyPath } from "../../../lib/learning/paths";
import { ancestors, studyNeighbors } from "../../../lib/learning/tree-nav";
import { GuideOutline } from "../outline/GuideOutline";
import { Button } from "../../ui/Button";

export type StudyShellProps = {
  guideId: string;
  guideTitle: string;
  node: NodeResponse;
  nodes: readonly NodeResponse[];
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
        <header>
          <h1 class="text-page font-semibold tracking-tight text-ink">{props.node.title}</h1>
          <p class="mt-2 text-body text-muted">
            Step metadata only in this slice. Content blocks arrive in a later phase.
          </p>
        </header>
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