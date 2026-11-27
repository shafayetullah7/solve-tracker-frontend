import { For, Show } from "solid-js";
import type { NodeResponse } from "../../../lib/api/modules/learning-guides.api";
import { learningStudyPath } from "../../../lib/learning/paths";

export type GuideOutlineProps = {
  guideId: string;
  nodes: readonly NodeResponse[];
  currentNodeId?: string;
};

function childNodes(nodes: readonly NodeResponse[], parentId: string | null) {
  return nodes
  .filter((node) => node.parentId === parentId)
  .slice()
  .sort((a, b) => a.position - b.position);
}

function OutlineLevel(props: {
  guideId: string;
  nodes: readonly NodeResponse[];
  parentId: string | null;
  depth: number;
  currentNodeId?: string;
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
              <a
                href={learningStudyPath(props.guideId, node.id)}
                class={[
                  "block rounded-control px-2 py-1.5 text-label text-ink hover:bg-surface-muted",
                  props.currentNodeId === node.id && "bg-brand-soft text-brand",
                ]}
                aria-current={props.currentNodeId === node.id ? "page" : undefined}
              >
                {node.title}
              </a>
              <OutlineLevel
                guideId={props.guideId}
                nodes={props.nodes}
                parentId={node.id}
                depth={props.depth + 1}
                currentNodeId={props.currentNodeId}
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
      />
    </Show>
  );
}