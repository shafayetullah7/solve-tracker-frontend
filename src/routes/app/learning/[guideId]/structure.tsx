import { Meta, Title } from "@solidjs/meta";
import { useNavigate, useParams, useSearchParams } from "@solidjs/router";
import { createEffect, createSignal, Match, onCleanup, Show, Switch } from "solid-js";
import { AppPageContainer } from "../../../../components/app/AppPageContainer";
import { LearningFeatureGate } from "../../../../components/learning/LearningFeatureGate";
import { GuideStructureWorkspace } from "../../../../components/learning/structure/GuideStructureWorkspace";
import { FormAlert } from "../../../../components/ui/FormAlert";
import { LoadingPlaceholder } from "../../../../components/ui/LoadingPlaceholder";
import { useAuth } from "../../../../lib/auth/context";
import { ApiError } from "../../../../lib/api/errors";
import {
  createLearningGuidesApi,
  type GuideResponse,
  type TreeResponse,
} from "../../../../lib/api/modules/learning-guides.api";

type LoadStatus = "idle" | "loading" | "ready" | "error";

export default function LearningStructurePage() {
  const params = useParams<{ guideId: string }>();
  const [search] = useSearchParams<{ step?: string }>();
  const auth = useAuth();
  const navigate = useNavigate();
  const api = createLearningGuidesApi(auth.productClient);

  const [status, setStatus] = createSignal<LoadStatus>("idle");
  const [guide, setGuide] = createSignal<GuideResponse | undefined>();
  const [tree, setTree] = createSignal<TreeResponse | undefined>();
  const [recoverable, setRecoverable] = createSignal<{ id: string; title: string }[]>([]);
  const [error, setError] = createSignal<string | undefined>();
  const [pending, setPending] = createSignal(false);
  const [selectedId, setSelectedId] = createSignal<string | undefined>();

  async function load(signal: AbortSignal) {
    const id = params.guideId;
    const [guideRow, treeRow, recoveryRow] = await Promise.all([
      api.get(id, signal),
      api.tree(id, signal),
      api.recoverable(id, {}, signal),
    ]);
    setGuide(guideRow);
    setTree(treeRow);
    setRecoverable(recoveryRow.items.map((item) => ({ id: item.id, title: item.title })));
    const step = search.step ?? treeRow.nodes[0]?.id;
    if (step) setSelectedId(step);
    setStatus("ready");
  }

  createEffect(
    () => [auth.status(), params.guideId, search.step] as const,
    ([authStatus, guideId]) => {
      if (authStatus !== "authenticated" || !guideId) return;
      const controller = new AbortController();
      setStatus("loading");
      setError(undefined);
      void load(controller.signal).catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setError(cause instanceof Error ? cause.message : "Could not load structure.");
        setStatus("error");
      });
      onCleanup(() => controller.abort());
    },
  );

  function selectNode(nodeId: string) {
    setSelectedId(nodeId);
    navigate(`?step=${nodeId}`, { replace: true });
  }

  async function reload() {
    setPending(true);
    try {
      await load(new AbortController().signal);
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "Could not refresh.");
      if (cause instanceof ApiError && cause.status === 409) {
        setError("Structure changed elsewhere. Reloaded the latest tree.");
      }
    } finally {
      setPending(false);
    }
  }

  const structureApi = () => {
    const g = params.guideId;
    return {
      moveNode: (nodeId: string, input: Parameters<typeof api.moveNode>[2]) =>
        api.moveNode(g, nodeId, input),
      patchNode: (nodeId: string, input: Parameters<typeof api.patchNode>[2]) =>
        api.patchNode(g, nodeId, input),
      createNode: (input: Parameters<typeof api.createNode>[1]) => api.createNode(g, input),
      deleteNode: (nodeId: string, expectedStructureRevision: string) =>
        api.deleteNode(g, nodeId, {
          expectedStructureRevision,
          operationId: crypto.randomUUID(),
        }),
      restoreNode: (nodeId: string, input: Parameters<typeof api.restoreNode>[2]) =>
        api.restoreNode(g, nodeId, input),
    };
  };

  return (
    <LearningFeatureGate>
      <Title>Guide structure</Title>
      <Meta name="robots" content="noindex" />
      <AppPageContainer>
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
                    <GuideStructureWorkspace
                      guideId={row.id}
                      guideTitle={row.title}
                      tree={nodes}
                      selectedId={selectedId()}
                      onSelect={selectNode}
                      recoverable={recoverable()}
                      pending={pending()}
                      error={error()}
                      onClearError={() => setError(undefined)}
                      onError={(message) => setError(message)}
                      onReload={reload}
                      api={structureApi()}
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