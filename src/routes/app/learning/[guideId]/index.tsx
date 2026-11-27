import { Meta, Title } from "@solidjs/meta";
import { useNavigate, useParams } from "@solidjs/router";
import { createEffect, createSignal, Match, onCleanup, Show, Switch } from "solid-js";
import { AppPageContainer } from "../../../../components/app/AppPageContainer";
import { GuideOutline } from "../../../../components/learning/outline/GuideOutline";
import { LearningFeatureGate } from "../../../../components/learning/LearningFeatureGate";
import { Button } from "../../../../components/ui/Button";
import { FormAlert } from "../../../../components/ui/FormAlert";
import { LoadingPlaceholder } from "../../../../components/ui/LoadingPlaceholder";
import { Panel } from "../../../../components/ui/Panel";
import { useAuth } from "../../../../lib/auth/context";
import {
  createLearningGuidesApi,
  type GuideResponse,
  type TreeResponse,
} from "../../../../lib/api/modules/learning-guides.api";
import { learningLibraryPath, learningStudyPath } from "../../../../lib/learning/paths";

type LoadStatus = "idle" | "loading" | "ready" | "error";

export default function LearningGuideOverviewPage() {
  const params = useParams<{ guideId: string }>();
  const auth = useAuth();
  const navigate = useNavigate();
  const api = createLearningGuidesApi(auth.productClient);

  const [status, setStatus] = createSignal<LoadStatus>("idle");
  const [guide, setGuide] = createSignal<GuideResponse | undefined>();
  const [tree, setTree] = createSignal<TreeResponse | undefined>();
  const [error, setError] = createSignal<string | undefined>();
  const [addTitle, setAddTitle] = createSignal("");
  const [addPending, setAddPending] = createSignal(false);

  async function loadGuide(signal: AbortSignal) {
    const id = params.guideId;
    const [guideRow, treeRow] = await Promise.all([
      api.get(id, signal),
      api.tree(id, signal),
    ]);
    setGuide(guideRow);
    setTree(treeRow);
    setStatus("ready");
  }

  createEffect(
    () => [auth.status(), params.guideId] as const,
    ([status, guideId]) => {
      if (status !== "authenticated" || !guideId) return;
      const controller = new AbortController();
      setStatus("loading");
      setError(undefined);
      void loadGuide(controller.signal).catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setError(cause instanceof Error ? cause.message : "Could not load guide.");
        setStatus("error");
      });
      onCleanup(() => controller.abort());
    },
  );

  async function addRootStep() {
    const currentTree = tree();
    const currentGuide = guide();
    if (!currentTree || !currentGuide || addPending()) return;
    const title = addTitle().trim();
    if (!title) return;
    setAddPending(true);
    setError(undefined);
    try {
      await api.createNode(currentGuide.id, {
        title,
        parentId: null,
        beforeNodeId: null,
        required: true,
        completionMode: "structural",
        expectedStructureRevision: currentTree.structureRevision,
        operationId: crypto.randomUUID(),
      });
      setAddTitle("");
      await loadGuide(new AbortController().signal);
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "Could not add step.");
    } finally {
      setAddPending(false);
    }
  }

  const firstStep = () => tree()?.nodes[0];

  return (
    <LearningFeatureGate>
      <Show when={guide()?.title}>
        {(title) => <Title>{title()}</Title>}
      </Show>
      <Meta name="robots" content="noindex" />
      <AppPageContainer>
        <div class="mb-4">
          <button
            type="button"
            class="text-sm font-medium text-brand hover:underline"
            onClick={() => navigate(learningLibraryPath())}
          >
            ← All guides
          </button>
        </div>
        <Switch>
          <Match when={status() === "loading" || status() === "idle"}>
            <LoadingPlaceholder variant="block" />
          </Match>
          <Match when={status() === "error"}>
            <FormAlert variant="error">{error()}</FormAlert>
          </Match>
          <Match when={status() === "ready" && guide() && tree()}>
            <Show when={guide()} keyed>
              {(row) => (
                <Show when={tree()} keyed>
                  {(nodes) => (
                    <div class="grid gap-8 lg:grid-cols-[1fr_minmax(14rem,20rem)]">
                      <div class="space-y-6">
                        <header>
                          <h1 class="text-page font-semibold tracking-tight text-ink">{row.title}</h1>
                          <Show when={row.description}>
                            <p class="mt-2 text-body text-muted">{row.description}</p>
                          </Show>
                        </header>
                        <Show when={firstStep()}>
                          {(step) => (
                            <a
                              class="ui-button inline-flex"
                              data-variant="primary"
                              href={learningStudyPath(row.id, step().id)}
                            >
                              Start studying
                            </a>
                          )}
                        </Show>
                        <Panel title="Add root step">
                          <div class="flex flex-wrap gap-2">
                            <input
                              class="min-h-11 min-w-[12rem] flex-1 rounded-control border border-line bg-surface px-3 text-base"
                              value={addTitle()}
                              maxlength={200}
                              disabled={addPending()}
                              onInput={(event) => setAddTitle(event.currentTarget.value)}
                            />
                            <Button
                              type="button"
                              disabled={addPending() || addTitle().trim().length === 0}
                              onClick={() => void addRootStep()}
                            >
                              {addPending() ? "Adding…" : "Add step"}
                            </Button>
                          </div>
                        </Panel>
                        <Show when={error()}>
                          {(message) => <FormAlert variant="error">{message()}</FormAlert>}
                        </Show>
                      </div>
                      <aside class="rounded-panel border border-line bg-surface p-4">
                        <h2 class="mb-3 text-label font-semibold text-ink">Outline</h2>
                        <GuideOutline guideId={row.id} nodes={nodes.nodes} />
                      </aside>
                    </div>
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