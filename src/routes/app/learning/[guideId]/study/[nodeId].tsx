import { Meta, Title } from "@solidjs/meta";
import { useParams } from "@solidjs/router";
import { createEffect, createSignal, Match, onCleanup, Show, Switch } from "solid-js";
import { AppPageContainer } from "../../../../../components/app/AppPageContainer";
import { LearningFeatureGate } from "../../../../../components/learning/LearningFeatureGate";
import { StudyShell } from "../../../../../components/learning/study/StudyShell";
import { FormAlert } from "../../../../../components/ui/FormAlert";
import { LoadingPlaceholder } from "../../../../../components/ui/LoadingPlaceholder";
import { useAuth } from "../../../../../lib/auth/context";
import {
  createLearningGuidesApi,
  type GuideResponse,
  type NodeResponse,
  type TreeResponse,
} from "../../../../../lib/api/modules/learning-guides.api";

type LoadStatus = "idle" | "loading" | "ready" | "error";

export default function LearningStudyPage() {
  const params = useParams<{ guideId: string; nodeId: string }>();
  const auth = useAuth();
  const api = createLearningGuidesApi(auth.productClient);

  const [status, setStatus] = createSignal<LoadStatus>("idle");
  const [guide, setGuide] = createSignal<GuideResponse | undefined>();
  const [tree, setTree] = createSignal<TreeResponse | undefined>();
  const [node, setNode] = createSignal<NodeResponse | undefined>();
  const [error, setError] = createSignal<string | undefined>();
  const [addChildTitle, setAddChildTitle] = createSignal("");
  const [addChildPending, setAddChildPending] = createSignal(false);

  async function loadWorkspace(signal: AbortSignal) {
    const guideId = params.guideId;
    const nodeId = params.nodeId;
    const [guideRow, treeRow] = await Promise.all([
      api.get(guideId, signal),
      api.tree(guideId, signal),
    ]);
    const current = treeRow.nodes.find((item) => item.id === nodeId);
    if (!current) throw new Error("Step was not found in this guide.");
    setGuide(guideRow);
    setTree(treeRow);
    setNode(current);
    await api.resume(guideId, {
      nodeId,
      expectedStructureRevision: treeRow.structureRevision,
      operationId: crypto.randomUUID(),
    }, signal);
    setStatus("ready");
  }

  createEffect(
    () => [auth.status(), params.guideId, params.nodeId] as const,
    ([status, guideId, nodeId]) => {
      if (status !== "authenticated" || !guideId || !nodeId) return;
      const controller = new AbortController();
      setStatus("loading");
      setError(undefined);
      void loadWorkspace(controller.signal).catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setError(cause instanceof Error ? cause.message : "Could not open this step.");
        setStatus("error");
      });
      onCleanup(() => controller.abort());
    },
  );

  async function addChild() {
    const currentTree = tree();
    const currentGuide = guide();
    const currentNode = node();
    if (!currentTree || !currentGuide || !currentNode || addChildPending()) return;
    const title = addChildTitle().trim();
    if (!title) return;
    setAddChildPending(true);
    setError(undefined);
    try {
      await api.createNode(currentGuide.id, {
        title,
        parentId: currentNode.id,
        beforeNodeId: null,
        required: true,
        completionMode: "structural",
        expectedStructureRevision: currentTree.structureRevision,
        operationId: crypto.randomUUID(),
      });
      setAddChildTitle("");
      await loadWorkspace(new AbortController().signal);
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "Could not add step.");
    } finally {
      setAddChildPending(false);
    }
  }

  return (
    <LearningFeatureGate>
      <Show when={node()?.title}>
        {(title) => <Title>{title()}</Title>}
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
          <Match when={status() === "ready" && guide() && tree() && node()}>
            <Show when={guide()} keyed>
              {(row) => (
                <Show when={tree()} keyed>
                  {(nodes) => (
                    <Show when={node()} keyed>
                      {(current) => (
                        <>
                          <StudyShell
                            guideId={row.id}
                            guideTitle={row.title}
                            node={current}
                            nodes={nodes.nodes}
                            addChildPending={addChildPending()}
                            addChildTitle={addChildTitle()}
                            onAddChildTitle={setAddChildTitle}
                            onAddChild={() => void addChild()}
                          />
                          <Show when={error()}>
                            {(message) => (
                              <div class="mt-4">
                                <FormAlert variant="error">{message()}</FormAlert>
                              </div>
                            )}
                          </Show>
                        </>
                      )}
                    </Show>
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