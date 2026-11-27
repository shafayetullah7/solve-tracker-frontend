import { For, Show } from "solid-js";
import type { ContentBlock } from "../../../lib/api/modules/learning-guides.api";

function textBody(payload: Record<string, unknown>): string {
  return typeof payload.body === "string" ? payload.body : "";
}

function codeBody(payload: Record<string, unknown>): { language?: string; body: string } {
  return {
    language: typeof payload.language === "string" ? payload.language : undefined,
    body: typeof payload.body === "string" ? payload.body : "",
  };
}

function checklistItems(payload: Record<string, unknown>) {
  if (!Array.isArray(payload.items)) return [];
  return payload.items.filter(
    (item): item is { id: string; label: string } =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as { id?: string }).id === "string" &&
      typeof (item as { label?: string }).label === "string",
  );
}

export function BlockList(props: { blocks: readonly ContentBlock[] }) {
  return (
    <div class="space-y-6">
      <Show when={props.blocks.length === 0}>
        <p class="text-body text-muted">No content for this step yet.</p>
      </Show>
      <For each={props.blocks}>
        {(block) => (
          <section class="rounded-panel border border-line bg-surface p-4">
            <Show when={block.type === "text"}>
              <p class="whitespace-pre-wrap text-body text-ink">{textBody(block.payload)}</p>
            </Show>
            <Show when={block.type === "code"}>
              {(() => {
                const snippet = codeBody(block.payload);
                return (
                  <div>
                    <Show when={snippet.language}>
                      <p class="mb-2 text-xs font-medium uppercase text-muted">{snippet.language}</p>
                    </Show>
                    <pre class="overflow-x-auto rounded-control bg-surface-muted p-3 text-sm text-ink">
                      <code>{snippet.body}</code>
                    </pre>
                  </div>
                );
              })()}
            </Show>
            <Show when={block.type === "link"}>
              {(() => {
                const url = typeof block.payload.url === "string" ? block.payload.url : "";
                const label = typeof block.payload.label === "string" ? block.payload.label : url;
                return (
                  <a class="text-brand hover:underline" href={url} rel="noopener noreferrer" target="_blank">
                    {label}
                  </a>
                );
              })()}
            </Show>
            <Show when={block.type === "checklist"}>
              <ul class="list-disc space-y-2 pl-5 text-body text-ink">
                <For each={checklistItems(block.payload)}>
                  {(item) => <li>{item.label}</li>}
                </For>
              </ul>
            </Show>
          </section>
        )}
      </For>
    </div>
  );
}