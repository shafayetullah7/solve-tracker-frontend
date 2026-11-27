import { For, Show } from "solid-js";
import type { NodeResponse } from "../../../lib/api/modules/learning-guides.api";
import {
  learningEditPath,
  learningStudyPath,
} from "../../../lib/learning/paths";
import { hasOpenProblems } from "../../../lib/learning/problem-resolution";

export type GuideOutlineProps = {
  guideId: string;
  nodes: readonly NodeResponse[];
  currentNodeId?: string;
  onSelect?: (nodeId: string) => void;
  showActions?: boolean;
};

function childNodes(nodes: readonly NodeResponse[], parentId: string | null) {
  return nodes
    .filter((node) => node.parentId === parentId)
    .slice()
    .sort((a, b) => a.position - b.position);
}

function nodeTitle(node: NodeResponse) {
  const openPractice = hasOpenProblems(node);
  return (
    <span>
      <Show when={node.completed} fallback={node.title}>
        <span>
          {node.title}
          <span class="ml-1 text-brand" aria-label="completed">
            ✓
          </span>
        </span>
      </Show>
      <Show when={!node.completed && openPractice}>
        <span class="ml-1 text-xs text-muted" title="Practice problems on this step">
          · Practice
        </span>
      </Show>
    </span>
  );
}

function OutlineLevel(props: {
  guideId: string;
  nodes: readonly NodeResponse[];
  parentId: string | null;
  depth: number;
  currentNodeId?: string;
  onSelect?: (nodeId: string) => void;
  showActions?: boolean;
}) {
  const items = () => childNodes(props.nodes, props.parentId);
  return (
    <Show when={items().length > 0}>
      <ul
        class="space-y-1"
        role={props.depth === 0 ? "list" : undefined}
        style={props.depth > 0 ? { "padding-left": "1rem" } : undefined}
      >
        <For each={items()}>
          {(node) => (
            <li>
              <Show
                when={props.onSelect}
                fallback={
                  <a
                    href={learningStudyPath(props.guideId, node.id)}
                    class={[
                      "block rounded-control px-2 py-1.5 text-label text-ink hover:bg-surface-muted",
                      props.currentNodeId === node.id && "bg-brand-soft text-brand",
                    ]}
                    aria-current={props.currentNodeId === node.id ? "page" : undefined}
                  >
                    {nodeTitle(node)}
                  </a>
                }
              >
                <div
                  class={[
                    "flex flex-wrap items-center gap-2 rounded-control px-2 py-1.5",
                    props.currentNodeId === node.id && "bg-brand-soft",
                  ]}
                >
                  <button
                    type="button"
                    class={[
                      "min-h-11 flex-1 text-left text-label text-ink hover:text-brand",
                      props.currentNodeId === node.id && "font-medium text-brand",
                    ]}
                    onClick={() => props.onSelect!(node.id)}
                  >
                    {nodeTitle(node)}
                  </button>
                  <Show when={props.showActions}>
                    <a
                      class="text-xs font-medium text-brand hover:underline"
                      href={learningStudyPath(props.guideId, node.id)}
                    >
                      Study
                    </a>
                    <a
                      class="text-xs font-medium text-brand hover:underline"
                      href={learningEditPath(props.guideId, node.id)}
                    >
                      Content
                    </a>
                  </Show>
                </div>
              </Show>
              <OutlineLevel
                guideId={props.guideId}
                nodes={props.nodes}
                parentId={node.id}
                depth={props.depth + 1}
                currentNodeId={props.currentNodeId}
                onSelect={props.onSelect}
                showActions={props.showActions}
              />
            </li>
          )}
        </For>
      </ul>
    </Show>
  );
}

export function GuideOutline(props: GuideOutlineProps) {
  return (
    <Show
      when={props.nodes.length > 0}
      fallback={
        <p class="text-sm text-muted">No steps yet. Add a root step to start.</p>
      }
    >
      <OutlineLevel
        guideId={props.guideId}
        nodes={props.nodes}
        parentId={null}
        depth={0}
        currentNodeId={props.currentNodeId}
        onSelect={props.onSelect}
        showActions={props.showActions}
      />
    </Show>
  );
}