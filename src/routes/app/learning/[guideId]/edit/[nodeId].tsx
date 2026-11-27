import { Meta, Title } from "@solidjs/meta";
import { useNavigate, useParams } from "@solidjs/router";
import { createEffect, createSignal, Match, onCleanup, Show, Switch } from "solid-js";
import { AppPageContainer } from "../../../../../components/app/AppPageContainer";
import { LearningFeatureGate } from "../../../../../components/learning/LearningFeatureGate";
import { NodeContentEditor } from "../../../../../components/learning/editor/NodeContentEditor";
import { FormAlert } from "../../../../../components/ui/FormAlert";
import { LoadingPlaceholder } from "../../../../../components/ui/LoadingPlaceholder";
import { useAuth } from "../../../../../lib/auth/context";
import { ApiError } from "../../../../../lib/api/errors";
import {
  createLearningGuidesApi,
  type GuideResponse,
  type NodeContentResponse,
  type NodeResponse,
  type TreeResponse,
} from "../../../../../lib/api/modules/learning-guides.api";
import { learningStudyPath } from "../../../../../lib/learning/paths";

type LoadStatus = "idle" | "loading" | "ready" | "error";

export default function LearningNodeEditPage() {
  const params = useParams<{ guideId: string; nodeId: string }>();
  const auth = useAuth();
  const navigate = useNavigate();
  const api = createLearningGuidesApi(auth.productClient);

  const [status, setStatus] = createSignal<LoadStatus>("idle");
  const [guide, setGuide] = createSignal<GuideResponse | undefined>();
  const [tree, setTree] = createSignal<TreeResponse | undefined>();
  const [node, setNode] = createSignal<NodeResponse | undefined>();
  const [content, setContent] = createSignal<NodeContentResponse | undefined>();
  const [error, setError] = createSignal<string | undefined>();
  const [savePending, setSavePending] = createSignal(false);
  const [saveState, setSaveState] = createSignal<"idle" | "saving" | "saved" | "error">("idle");
  let saveQueue: Promise<void> = Promise.resolve();

  async function loadWorkspace(signal: AbortSignal) {
    const guideId = params.guideId;
    const nodeId = params.nodeId;
    const [guideRow, treeRow, contentRow] = await Promise.all([
      api.get(guideId, signal),
      api.tree(guideId, signal),
      api.nodeContent(guideId, nodeId, signal),
    ]);
    const current = treeRow.nodes.find((item) => item.id === nodeId);
    if (!current) throw new Error("Step was not found in this guide.");
    setGuide(guideRow);
    setTree(treeRow);
    setNode(current);
    setContent(contentRow);
    setStatus("ready");
  }

  createEffect(
    () => [auth.status(), params.guideId, params.nodeId] as const,
    ([authStatus, guideId, nodeId]) => {
      if (authStatus !== "authenticated" || !guideId || !nodeId) return;
      const controller = new AbortController();
      setStatus("loading");
      setError(undefined);
      void loadWorkspace(controller.signal).catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setError(cause instanceof Error ? cause.message : "Could not open editor.");
        setStatus("error");
      });
      onCleanup(() => controller.abort());
    },
  );

  async function persistContent(
    blocks: Parameters<typeof api.replaceNodeContent>[2]["blocks"],
    expectedContentRevision: string,
    navigateAfter: boolean,
  ) {
    const guideId = params.guideId;
    const nodeId = params.nodeId;
    const revision = content()?.contentRevision ?? expectedContentRevision;
    setSaveState("saving");
  setSavePending(true);
    setError(undefined);
    try {
      await api.replaceNodeContent(guideId, nodeId, {
        blocks,
        expectedContentRevision: revision,
        operationId: crypto.randomUUID(),
      });
      await loadWorkspace(new AbortController().signal);
      setSaveState("saved");
      if (navigateAfter) navigate(learningStudyPath(guideId, nodeId));
    } catch (cause: unknown) {
      setSaveState("error");
      if (cause instanceof ApiError && cause.kind === "http" && cause.status === 409) {
        setError("Content was updated elsewhere. Reloaded latest revision.");
        await loadWorkspace(new AbortController().signal);
      } else {
        setError(cause instanceof Error ? cause.message : "Could not save content.");
      }
    } finally {
      setSavePending(false);
    }
  }

  function enqueueSave(
    blocks: Parameters<typeof api.replaceNodeContent>[2]["blocks"],
    expectedContentRevision: string,
    navigateAfter: boolean,
  ) {
    saveQueue = saveQueue
      .then(() => persistContent(blocks, expectedContentRevision, navigateAfter))
      .catch(() => undefined);
    return saveQueue;
  }

  return (
    <LearningFeatureGate>
      <Show when={node()?.title}>
        {(title) => <Title>Edit {title()}</Title>}
      </Show>
      <Meta name="robots" content="noindex" />
      <AppPageContainer>
        <Switch>
          <Match when={status() === "loading" || status() === "idle"}>
            <LoadingPlaceholder variant="block" />
          </Match>
          <Match when={status() === "error"}>
            <FormAlert variant="error">{error()}</FormAlert>
          </Match>
          <Match when={status() === "ready" && guide() && tree() && node() && content()}>
            <Show when={node()} keyed>
              {(current) => (
                <Show when={content()}>
                  {(row) => (
                    <NodeContentEditor
                      guideId={params.guideId}
                      nodeId={current.id}
                      nodeTitle={current.title}
                      contentRevision={row().contentRevision}
                      initialBlocks={row().blocks}
                      savePending={savePending()}
                      saveState={saveState()}
                      error={error()}
                      onAutosave={(blocks, revision) => {
                        void enqueueSave(blocks, revision, false);
                      }}
                      onSave={(blocks, revision) => {
                        void enqueueSave(blocks, revision, true);
                      }}
                    />
                  )}
                </Show>
              )}
            </Show>
          </Match>
        </Switch>
      </AppPageContainer>
    </LearningFeatureGate>
  );
}