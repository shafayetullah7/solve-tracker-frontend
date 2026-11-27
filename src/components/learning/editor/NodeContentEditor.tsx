import { createSignal, For, Show } from "solid-js";
import type { ContentBlock, ReplaceNodeContentInput } from "../../../lib/api/modules/learning-guides.api";
import { learningStudyPath } from "../../../lib/learning/paths";
import { Button } from "../../ui/Button";
import { FormAlert } from "../../ui/FormAlert";

type DraftBlock = ReplaceNodeContentInput["blocks"][number];

function fromContent(blocks: readonly ContentBlock[]): DraftBlock[] {
  return blocks.map((block) => {
    if (block.type === "text") {
      return {
        type: "text" as const,
        payload: { body: typeof block.payload.body === "string" ? block.payload.body : "" },
      };
    }
    if (block.type === "code") {
      return {
        type: "code" as const,
        payload: {
          language:
            typeof block.payload.language === "string" ? block.payload.language : undefined,
          body: typeof block.payload.body === "string" ? block.payload.body : "",
        },
      };
    }
    const items = Array.isArray(block.payload.items)
      ? block.payload.items.filter(
          (item): item is { id: string; label: string } =>
            typeof item === "object" &&
            item !== null &&
            typeof (item as { id?: string }).id === "string" &&
            typeof (item as { label?: string }).label === "string",
        )
      : [{ id: crypto.randomUUID().slice(0, 8), label: "Item" }];
    return { type: "checklist" as const, payload: { items } };
  });
}

export type NodeContentEditorProps = {
  guideId: string;
  nodeId: string;
  nodeTitle: string;
  contentRevision: string;
  initialBlocks: readonly ContentBlock[];
  savePending: boolean;
  error?: string;
  onSave: (blocks: DraftBlock[], expectedContentRevision: string) => void;
};

export function NodeContentEditor(props: NodeContentEditorProps) {
  const [blocks, setBlocks] = createSignal<DraftBlock[]>(fromContent(props.initialBlocks));

  function addBlock(type: DraftBlock["type"]) {
    if (type === "text") {
      setBlocks((current) => [...current, { type: "text", payload: { body: "" } }]);
      return;
    }
    if (type === "code") {
      setBlocks((current) => [...current, { type: "code", payload: { body: "" } }]);
      return;
    }
    setBlocks((current) => [
      ...current,
      {
        type: "checklist",
        payload: { items: [{ id: crypto.randomUUID().slice(0, 8), label: "Item" }] },
      },
    ]);
  }

  function removeAt(index: number) {
    setBlocks((current) => current.filter((_, i) => i !== index));
  }

  function move(index: number, delta: number) {
    setBlocks((current) => {
      const next = current.slice();
      const target = index + delta;
      if (target < 0 || target >= next.length) return current;
      const [row] = next.splice(index, 1);
      if (!row) return current;
      next.splice(target, 0, row);
      return next;
    });
  }

  function updateText(index: number, body: string) {
    setBlocks((current) =>
      current.map((block, i) =>
        i === index && block.type === "text" ? { ...block, payload: { body } } : block,
      ),
    );
  }

  function updateCode(index: number, field: "language" | "body", value: string) {
    setBlocks((current) =>
      current.map((block, i) => {
        if (i !== index || block.type !== "code") return block;
        if (field === "language") {
          return { ...block, payload: { ...block.payload, language: value || undefined, body: block.payload.body } };
        }
        return { ...block, payload: { ...block.payload, body: value } };
      }),
    );
  }

  function updateChecklistLabel(blockIndex: number, itemIndex: number, label: string) {
    setBlocks((current) =>
      current.map((block, i) => {
        if (i !== blockIndex || block.type !== "checklist") return block;
        return {
          ...block,
          payload: {
            items: block.payload.items.map((item, j) =>
              j === itemIndex ? { ...item, label } : item,
            ),
          },
        };
      }),
    );
  }

  function addChecklistItem(blockIndex: number) {
    setBlocks((current) =>
      current.map((block, i) => {
        if (i !== blockIndex || block.type !== "checklist") return block;
        return {
          ...block,
          payload: {
            items: [
              ...block.payload.items,
              { id: crypto.randomUUID().slice(0, 8), label: "Item" },
            ],
          },
        };
      }),
    );
  }

  return (
    <div class="space-y-6">
      <header class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-page font-semibold text-ink">Edit: {props.nodeTitle}</h1>
          <p class="mt-1 text-sm text-muted">
            Plain text areas for blocks; rich editor library deferred (see LEARNING_3B_RESULTS).
          </p>
        </div>
        <a
          class="ui-button inline-flex"
          data-variant="secondary"
          href={learningStudyPath(props.guideId, props.nodeId)}
        >
          Back to study
        </a>
      </header>
      <Show when={props.error}>
        {(message) => <FormAlert variant="error">{message()}</FormAlert>}
      </Show>
      <div class="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={() => addBlock("text")}>
          Add text
        </Button>
        <Button type="button" variant="secondary" onClick={() => addBlock("code")}>
          Add code
        </Button>
        <Button type="button" variant="secondary" onClick={() => addBlock("checklist")}>
          Add checklist
        </Button>
      </div>
      <For each={blocks()}>
        {(block, index) => (
          <section class="space-y-3 rounded-panel border border-line bg-surface p-4">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <p class="text-label font-semibold capitalize text-ink">{block.type} block</p>
              <div class="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={index() === 0}
                  onClick={() => move(index(), -1)}
                >
                  Up
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={index() === blocks().length - 1}
                  onClick={() => move(index(), 1)}
                >
                  Down
                </Button>
                <Button type="button" variant="secondary" onClick={() => removeAt(index())}>
                  Remove
                </Button>
              </div>
            </div>
            <Show when={block.type === "text" ? block : false}>
              {(textBlock) => (
                <textarea
                  class="min-h-[8rem] w-full rounded-control border border-line bg-surface px-3 py-2 font-mono text-sm"
                  value={textBlock().payload.body}
                  onInput={(event) => updateText(index(), event.currentTarget.value)}
                />
              )}
            </Show>
            <Show when={block.type === "code" ? block : false}>
              {(codeBlock) => (
                <>
                  <input
                    class="w-full rounded-control border border-line bg-surface px-3 py-2 text-sm"
                    placeholder="Language (optional)"
                    value={codeBlock().payload.language ?? ""}
                    onInput={(event) => updateCode(index(), "language", event.currentTarget.value)}
                  />
                  <textarea
                    class="min-h-[8rem] w-full rounded-control border border-line bg-surface px-3 py-2 font-mono text-sm"
                    value={codeBlock().payload.body}
                    onInput={(event) => updateCode(index(), "body", event.currentTarget.value)}
                  />
                </>
              )}
            </Show>
            <Show when={block.type === "checklist" ? block : false}>
              {(listBlock) => (
                <>
              <For each={listBlock().payload.items}>
                {(item, itemIndex) => (
                  <input
                    class="w-full rounded-control border border-line bg-surface px-3 py-2 text-sm"
                    value={item.label}
                    onInput={(event) =>
                      updateChecklistLabel(index(), itemIndex(), event.currentTarget.value)
                    }
                  />
                )}
              </For>
              <Button type="button" variant="secondary" onClick={() => addChecklistItem(index())}>
                Add item
              </Button>
                </>
              )}
            </Show>
          </section>
        )}
      </For>
      <Button
        type="button"
        disabled={props.savePending}
        onClick={() => props.onSave(blocks(), props.contentRevision)}
      >
        {props.savePending ? "Saving…" : "Save content"}
      </Button>
    </div>
  );
}