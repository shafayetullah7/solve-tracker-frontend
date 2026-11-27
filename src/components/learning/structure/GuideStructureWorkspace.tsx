import { For, Show, createMemo, createSignal } from "solid-js";
import type {
  MoveNodeInput,
  NodeResponse,
  TreeResponse,
} from "../../../lib/api/modules/learning-guides.api";
import {
  completionMode,
  type WritableCompletionMode,
} from "../../../lib/learning/completion-modes";
import {
  indentNode,
  moveSibling,
  outdentNode,
} from "../../../lib/learning/placement";
import {
  learningEditPath,
  learningGuidePath,
  learningStudyPath,
} from "../../../lib/learning/paths";
import { GuideOutline } from "../outline/GuideOutline";
import { Button } from "../../ui/Button";
import { FormAlert } from "../../ui/FormAlert";
import { ConfirmDialog } from "../../ui/ConfirmDialog";

export type StructureApi = {
  moveNode: (nodeId: string, input: MoveNodeInput) => Promise<unknown>;
  patchNode: (
    nodeId: string,
    input: {
      title?: string;
      required?: boolean;
      completionMode?: WritableCompletionMode;
      expectedStructureRevision: string;
      operationId: string;
    },
  ) => Promise<unknown>;
  createNode: (input: {
    title: string;
    parentId: string | null;
    beforeNodeId: string | null;
    required: boolean;
    completionMode: WritableCompletionMode;
    expectedStructureRevision: string;
    operationId: string;
  }) => Promise<unknown>;
  deleteNode: (nodeId: string, expectedStructureRevision: string) => Promise<unknown>;
  restoreNode: (nodeId: string, input: MoveNodeInput) => Promise<unknown>;
};

export type GuideStructureWorkspaceProps = {
  guideId: string;
  guideTitle: string;
  tree: TreeResponse;
  selectedId: string | undefined;
  onSelect: (nodeId: string) => void;
  recoverable: readonly { id: string; title: string }[];
  pending: boolean;
  error?: string;
  onClearError: () => void;
  onError: (message: string) => void;
  onReload: () => Promise<void>;
  api: StructureApi;
};

export function GuideStructureWorkspace(props: GuideStructureWorkspaceProps) {
  const [deleteOpen, setDeleteOpen] = createSignal(false);
  const [titleDraft, setTitleDraft] = createSignal("");
  const selected = createMemo(() =>
    props.tree.nodes.find((n) => n.id === props.selectedId),
  );

  const syncTitle = () => {
    const node = selected();
    if (node) setTitleDraft(node.title);
  };
  syncTitle();

  async function runMutation(task: () => Promise<unknown>) {
    props.onClearError();
    try {
      await task();
      await props.onReload();
      syncTitle();
    } catch (cause: unknown) {
      props.onError(cause instanceof Error ? cause.message : "Structure update failed.");
    }
  }

  async function placementMove(
    nodeId: string,
    parentId: string | null,
    beforeNodeId: string | null,
  ) {
    await runMutation(() =>
      props.api.moveNode(nodeId, {
        parentId,
        beforeNodeId,
        expectedStructureRevision: props.tree.structureRevision,
        operationId: crypto.randomUUID(),
      }),
    );
  }

  async function handleSibling(direction: "up" | "down") {
    const id = props.selectedId;
    if (!id) return;
    const target = moveSibling(props.tree.nodes, id, direction);
    if (!target) return;
    await placementMove(id, target.parentId, target.beforeNodeId);
  }

  async function handleIndent() {
    const id = props.selectedId;
    if (!id) return;
    const target = indentNode(props.tree.nodes, id);
    if (!target) return;
    await placementMove(id, target.parentId, target.beforeNodeId);
  }

  async function handleOutdent() {
    const id = props.selectedId;
    if (!id) return;
    const target = outdentNode(props.tree.nodes, id);
    if (!target) return;
    await placementMove(id, target.parentId, target.beforeNodeId);
  }

  async function saveMetadata() {
    const node = selected();
    if (!node) return;
    const title = titleDraft().trim();
    if (!title) return;
    await runMutation(() =>
      props.api.patchNode(node.id, {
        title,
        expectedStructureRevision: props.tree.structureRevision,
        operationId: crypto.randomUUID(),
      }),
    );
  }

  async function addChild() {
    const parent = selected();
    if (!parent) return;
    const title = "New step";
    await runMutation(() =>
      props.api.createNode({
        title,
        parentId: parent.id,
        beforeNodeId: null,
        required: true,
        completionMode: completionMode.Structural,
        expectedStructureRevision: props.tree.structureRevision,
        operationId: crypto.randomUUID(),
      }),
    );
  }

  async function confirmDelete() {
    const node = selected();
    if (!node) return;
    await runMutation(() =>
      props.api.deleteNode(node.id, props.tree.structureRevision),
    );
    setDeleteOpen(false);
  }

  function onTreeKeyDown(event: KeyboardEvent) {
    if (!props.selectedId) return;
    if (event.altKey && event.key === "ArrowUp") {
      event.preventDefault();
      void handleSibling("up");
    }
    if (event.altKey && event.key === "ArrowDown") {
      event.preventDefault();
      void handleSibling("down");
    }
  }

  return (
    <div class="grid gap-8 lg:grid-cols-[minmax(14rem,22rem)_1fr]">
      <div onKeyDown={onTreeKeyDown} tabindex={0} class="outline-none">
        <p class="mb-2 text-xs text-muted">Alt+↑/↓ reorder. Select a step to edit.</p>
        <GuideOutline
          guideId={props.guideId}
          nodes={props.tree.nodes}
          currentNodeId={props.selectedId}
          onSelect={props.onSelect}
          showActions
        />
      </div>
      <div class="space-y-4">
        <header>
          <a href={learningGuidePath(props.guideId)} class="text-sm text-brand hover:underline">
            ← Guide overview
          </a>
          <h1 class="mt-2 text-page font-semibold text-ink">
            Structure: {props.guideTitle}
          </h1>
        </header>
        <Show when={props.error}>
          {(message) => <FormAlert variant="error">{message()}</FormAlert>}
        </Show>
        <Show when={selected()} fallback={<p class="text-muted">Select a step in the tree.</p>}>
          {(node) => (
            <section class="space-y-4 rounded-panel border border-line bg-surface p-4">
              <input
                class="w-full rounded-control border border-line px-3 py-2 text-lg font-medium"
                value={titleDraft()}
                disabled={props.pending}
                onInput={(e) => setTitleDraft(e.currentTarget.value)}
              />
              <div class="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={props.pending}
                  onClick={() => void handleSibling("up")}
                >
                  Move up
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={props.pending}
                  onClick={() => void handleSibling("down")}
                >
                  Move down
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={props.pending}
                  onClick={() => void handleIndent()}
                >
                  Indent
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={props.pending}
                  onClick={() => void handleOutdent()}
                >
                  Outdent
                </Button>
                <Button type="button" disabled={props.pending} onClick={() => void addChild()}>
                  Add child
                </Button>
                <Button type="button" disabled={props.pending} onClick={() => void saveMetadata()}>
                  Save title
                </Button>
                <a
                  class="ui-button inline-flex"
                  data-variant="secondary"
                  href={learningStudyPath(props.guideId, node().id)}
                >
                  Study
                </a>
                <a
                  class="ui-button inline-flex"
                  data-variant="secondary"
                  href={learningEditPath(props.guideId, node().id)}
                >
                  Edit content
                </a>
                <Button
                  type="button"
                  variant="danger"
                  disabled={props.pending}
                  onClick={() => setDeleteOpen(true)}
                >
                  Delete subtree
                </Button>
              </div>
            </section>
          )}
        </Show>
        <Show when={props.recoverable.length > 0}>
          <section class="rounded-panel border border-line p-4">
            <h2 class="text-label font-semibold">Recoverable steps</h2>
            <ul class="mt-2 space-y-2">
              <For each={props.recoverable}>
                {(item) => (
                  <li class="flex flex-wrap items-center justify-between gap-2">
                    <span>{item.title}</span>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={props.pending}
                      onClick={() =>
                        void runMutation(() =>
                          props.api.restoreNode(item.id, {
                            parentId: null,
                            beforeNodeId: null,
                            expectedStructureRevision: props.tree.structureRevision,
                            operationId: crypto.randomUUID(),
                          }),
                        )
                      }
                    >
                      Restore
                    </Button>
                  </li>
                )}
              </For>
            </ul>
          </section>
        </Show>
      </div>
      <ConfirmDialog
        open={deleteOpen()}
        title="Delete step and children?"
        description="This soft-deletes the subtree. You can restore from recovery within the retention window."
        confirmLabel="Delete"
        confirmTone="danger"
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}