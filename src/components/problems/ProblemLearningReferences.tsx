import { For } from "solid-js";
import { learningStudyPath } from "../../lib/learning/paths";
import type { ProblemLearningReference } from "../../lib/api/modules/problems.api";
import { Panel } from "../ui/Panel";

export type ProblemLearningReferencesProps = {
  items: readonly ProblemLearningReference[];
};

export function ProblemLearningReferences(props: ProblemLearningReferencesProps) {
  if (props.items.length === 0) return null;
  return (
    <Panel title="Learning steps">
      <p class="mb-4 text-sm text-muted">
        This problem is linked from steps in your guides.
      </p>
      <ul class="space-y-3">
        <For each={props.items}>
          {(item) => (
            <li class="rounded-panel border border-line bg-surface-muted px-4 py-3 text-sm">
              <a
                class="font-medium text-brand hover:underline"
                href={learningStudyPath(item.guideId, item.nodeId)}
              >
                {item.nodeTitle}
              </a>
              <p class="mt-1 text-muted">
                Guide:{" "}
                <span class="text-ink">{item.guideTitle}</span>
              </p>
            </li>
          )}
        </For>
      </ul>
    </Panel>
  );
}