import { Meta, Title } from "@solidjs/meta";
import { useNavigate } from "@solidjs/router";
import { createSignal, For, Show } from "solid-js";
import { AppPageContainer } from "../../../components/app/AppPageContainer";
import { LearningFeatureGate } from "../../../components/learning/LearningFeatureGate";
import { Button } from "../../../components/ui/Button";
import { FormAlert } from "../../../components/ui/FormAlert";
import { Panel } from "../../../components/ui/Panel";
import { useAuth } from "../../../lib/auth/context";
import { createLearningPortabilityApi } from "../../../lib/api/modules/learning-portability.api";
import { learningGuidePath, learningLibraryPath } from "../../../lib/learning/paths";

export default function LearningImportPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const api = createLearningPortabilityApi(auth.productClient);

  const [format, setFormat] = createSignal<"markdown" | "json">("markdown");
  const [content, setContent] = createSignal("");
  const [preview, setPreview] = createSignal<
    Awaited<ReturnType<typeof api.preview>> | undefined
  >();
  const [error, setError] = createSignal<string | undefined>();
  const [pending, setPending] = createSignal(false);

  async function runPreview() {
    setPending(true);
    setError(undefined);
    setPreview(undefined);
    try {
      setPreview(await api.preview({ format: format(), content: content() }));
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "Could not preview import.");
    } finally {
      setPending(false);
    }
  }

  async function commit() {
    const row = preview();
    if (!row || pending()) return;
    setPending(true);
    setError(undefined);
    try {
      const receipt = await api.commit(row.importId, { operationId: crypto.randomUUID() });
      navigate(learningGuidePath(receipt.resourceId));
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "Could not import guide.");
    } finally {
      setPending(false);
    }
  }

  return (
    <LearningFeatureGate>
      <Title>Import guide</Title>
      <Meta name="robots" content="noindex" />
      <AppPageContainer>
        <a href={learningLibraryPath()} class="text-sm text-brand hover:underline">
          ← All guides
        </a>
        <div class="mt-4">
        <Panel title="Import guide">
          <div class="space-y-4">
            <div class="flex gap-2">
              <Button
                type="button"
                variant={format() === "markdown" ? "primary" : "secondary"}
                onClick={() => setFormat("markdown")}
              >
                Markdown outline
              </Button>
              <Button
                type="button"
                variant={format() === "json" ? "primary" : "secondary"}
                onClick={() => setFormat("json")}
              >
                JSON
              </Button>
            </div>
            <textarea
              class="min-h-[12rem] w-full rounded-control border border-line px-3 py-2 font-mono text-sm"
              value={content()}
              onInput={(event) => setContent(event.currentTarget.value)}
              placeholder={
                format() === "markdown" ? "# My guide\n## Section" : '{ "schemaVersion": 1, "title": "..." }'
              }
            />
            <Show when={error()}>
              {(message) => <FormAlert variant="error">{message()}</FormAlert>}
            </Show>
            <div class="flex flex-wrap gap-2">
              <Button
                type="button"
                disabled={pending() || content().trim().length === 0}
                onClick={() => void runPreview()}
              >
                Preview
              </Button>
              <Show when={preview()}>
                <Button type="button" disabled={pending()} onClick={() => void commit()}>
                  Confirm import
                </Button>
              </Show>
            </div>
            <Show when={preview()}>
              {(row) => (
                <div class="rounded-panel border border-line p-3 text-sm">
                  <p class="font-medium">{row().guidePreview.title}</p>
                  <p class="text-muted">{row().guidePreview.nodeCount} steps</p>
                  <Show when={row().warnings.length > 0}>
                    <ul class="mt-2 list-disc pl-5 text-muted">
                      <For each={row().warnings}>{(warning) => <li>{warning}</li>}</For>
                    </ul>
                  </Show>
                </div>
              )}
            </Show>
          </div>
        </Panel>
        </div>
      </AppPageContainer>
    </LearningFeatureGate>
  );
}