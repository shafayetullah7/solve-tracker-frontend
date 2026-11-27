import { createEffect, createSignal, For, onCleanup, Show } from "solid-js";
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
    if (block.type === "link") {
      return {
        type: "link" as const,
        payload: {
          url: typeof block.payload.url === "string" ? block.payload.url : "https://",
          label: typeof block.payload.label === "string" ? block.payload.label : "Resource",
        },
      };
    }
    if (block.type === "problem") {
      return {
        type: "problem" as const,
        payload: {
          url: typeof block.payload.url === "string" ? block.payload.url : "https://",
          label:
            typeof block.payload.label === "string" && block.payload.label.trim().length > 0
              ? block.payload.label
              : "Practice problem",
        },
      };
    }
    if (block.type === "assessment") {
      return {
        type: "assessment" as const,
        payload: {
          assessmentId:
            typeof block.payload.assessmentId === "string" ? block.payload.assessmentId : "",
          label:
            typeof block.payload.label === "string" && block.payload.label.trim().length > 0
              ? block.payload.label
              : undefined,
        },
      };
    }
    if (block.type === "checklist") {
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
    }
    return { type: "text" as const, payload: { body: "" } };
  });
}

export type NodeContentEditorProps = {
  guideId: string;
  nodeId: string;
  nodeTitle: string;
  contentRevision: string;
  initialBlocks: readonly ContentBlock[];
  savePending: boolean;
  saveState: "idle" | "saving" | "saved" | "error";
  error?: string;
  onSave: (blocks: DraftBlock[], expectedContentRevision: string) => void;
  onAutosave: (blocks: DraftBlock[], expectedContentRevision: string) => void;
};

export function NodeContentEditor(props: NodeContentEditorProps) {
  const [blocks, setBlocks] = createSignal<DraftBlock[]>(fromContent(props.initialBlocks));
  const [dirty, setDirty] = createSignal(false);

  createEffect(
    () => [blocks(), props.contentRevision, dirty()] as const,
    () => {
      if (!dirty()) return;
      const timer = setTimeout(() => {
        props.onAutosave(blocks(), props.contentRevision);
        setDirty(false);
      }, 1500);
      onCleanup(() => clearTimeout(timer));
    },
  );

  function addBlock(type: DraftBlock["type"]) {
    if (type === "text") {
      setBlocks((current) => [...current, { type: "text", payload: { body: "" } }]);
      setDirty(true);
      return;
    }
    if (type === "code") {
      setBlocks((current) => [...current, { type: "code", payload: { body: "" } }]);
      setDirty(true);
      return;
    }
    if (type === "link") {
      setBlocks((current) => [
        ...current,
        { type: "link", payload: { url: "https://", label: "Resource" } },
      ]);
      setDirty(true);
      return;
    }
    if (type === "problem") {
      setBlocks((current) => [
        ...current,
        { type: "problem", payload: { url: "https://", label: "Practice problem" } },
      ]);
      setDirty(true);
      return;
    }
    setBlocks((current) => [
      ...current,
      {
        type: "checklist",
        payload: { items: [{ id: crypto.randomUUID().slice(0, 8), label: "Item" }] },
      },
    ]);
    setDirty(true);
  }

  function removeAt(index: number) {
    setBlocks((current) => current.filter((_, i) => i !== index));
    setDirty(true);
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
    setDirty(true);
  }

  function updateText(index: number, body: string) {
    setBlocks((current) =>
      current.map((block, i) =>
        i === index && block.type === "text" ? { ...block, payload: { body } } : block,
      ),
    );
    setDirty(true);
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
    setDirty(true);
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
    setDirty(true);
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
    setDirty(true);
  }

  const saveLabel = () => {
    if (props.savePending || props.saveState === "saving") return "Saving…";
    if (props.saveState === "saved") return "Saved";
    if (props.saveState === "error") return "Save failed";
    return "Save now";
  };

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
          Preview study
        </a>
      </header>
      <p class="text-sm text-muted" aria-live="polite">
        Autosave: {props.saveState === "saving" ? "Saving…" : props.saveState === "saved" ? "All changes saved" : props.saveState === "error" ? "Save error" : "Edits save automatically"}
      </p>
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
        <Button type="button" variant="secondary" onClick={() => addBlock("link")}>
          Add link
        </Button>
        <Button type="button" variant="secondary" onClick={() => addBlock("problem")}>
          Add problem
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
            <Show when={block.type === "link" ? block : false}>
              {(linkBlock) => (
                <div class="space-y-2">
                  <input
                    class="w-full rounded-control border border-line px-3 py-2 text-sm"
                    placeholder="Label"
                    value={linkBlock().payload.label}
                    onInput={(event) =>
                      setBlocks((current) =>
                        current.map((row, i) =>
                          i === index() && row.type === "link"
                            ? { ...row, payload: { ...row.payload, label: event.currentTarget.value } }
                            : row,
                        ),
                      )
                    }
                  />
                  <input
                    class="w-full rounded-control border border-line px-3 py-2 text-sm"
                    placeholder="https://example.com"
                    value={linkBlock().payload.url}
                    onInput={(event) =>
                      setBlocks((current) =>
                        current.map((row, i) =>
                          i === index() && row.type === "link"
                            ? { ...row, payload: { ...row.payload, url: event.currentTarget.value } }
                            : row,
                        ),
                      )
                    }
                  />
                </div>
              )}
            </Show>
            <Show when={block.type === "problem" ? block : false}>
              {(problemBlock) => (
                <div class="space-y-2">
                  <input
                    class="w-full rounded-control border border-line px-3 py-2 text-sm"
                    placeholder="Label"
                    value={problemBlock().payload.label ?? ""}
                    onInput={(event) =>
                      setBlocks((current) =>
                        current.map((row, i) =>
                          i === index() && row.type === "problem"
                            ? { ...row, payload: { ...row.payload, label: event.currentTarget.value } }
                            : row,
                        ),
                      )
                    }
                  />
                  <input
                    class="w-full rounded-control border border-line px-3 py-2 text-sm"
                    placeholder="https://leetcode.com/problems/..."
                    value={problemBlock().payload.url}
                    onInput={(event) =>
                      setBlocks((current) =>
                        current.map((row, i) =>
                          i === index() && row.type === "problem"
                            ? { ...row, payload: { ...row.payload, url: event.currentTarget.value } }
                            : row,
                        ),
                      )
                    }
                  />
                </div>
              )}
            </Show>
            <Show when={block.type === "assessment" ? block : false}>
              {(assessmentBlock) => (
                <p class="text-sm text-muted">
                  Assessment block linked to{" "}
                  <span class="font-mono text-ink">{assessmentBlock().payload.assessmentId}</span>. Edit
                  assessments from the guide workspace; this editor preserves the link on save.
                </p>
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
        {saveLabel()}
      </Button>
    </div>
  );
}