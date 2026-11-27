import { Title } from "@solidjs/meta";
import { useNavigate, useParams } from "@solidjs/router";
import {
  createEffect,
  createSignal,
  Match,
  Show,
  Switch,
  untrack,
} from "solid-js";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { LoadingPlaceholder } from "../../../components/ui/LoadingPlaceholder";
import { Panel } from "../../../components/ui/Panel";
import { createProblemsApi, type ProblemResponse } from "../../../lib/api/modules/problems.api";
import { useAuth } from "../../../lib/auth/context";
import {
  applyCompletionUpdate,
  completionButtonLabel,
  completionButtonVariant,
  nextCompletionStatus,
} from "../../../lib/problems/completion-actions";
import { problemFormMessage } from "../../../lib/problems/messages";
import { problemEditPath } from "../../../lib/problems/paths";
import { PlatformMark } from "../../../components/platforms/PlatformMark";
import { paths } from "../../../router";
import { DiscoverCommunityPanel } from "../../../components/discover/DiscoverCommunityPanel";
import { isDiscoverFullEnabled } from "../../../lib/discover/flag";
import {
  ProblemLearningReferences,
} from "../../../components/problems/ProblemLearningReferences";
import type { ProblemLearningReference } from "../../../lib/api/modules/problems.api";

type LoadStatus = "idle" | "loading" | "ready" | "unavailable";

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function ProblemDetail() {
  const auth = useAuth();
  const params = useParams();
  const navigate = useNavigate();
  const api = createProblemsApi(auth.productClient);

  const [problem, setProblem] = createSignal<ProblemResponse | undefined>();
  const [loadStatus, setLoadStatus] = createSignal<LoadStatus>("idle");
  const [loadMessage, setLoadMessage] = createSignal<string | undefined>();

  const [deleteOpen, setDeleteOpen] = createSignal(false);
  const [deletePending, setDeletePending] = createSignal(false);
  const [deleteError, setDeleteError] = createSignal<string | undefined>();

  const [statusPending, setStatusPending] = createSignal(false);
  const [statusError, setStatusError] = createSignal<string | undefined>();

  const [learningRefs, setLearningRefs] = createSignal<
    readonly ProblemLearningReference[]
  >([]);

  let deleteDialogRef: HTMLDialogElement | undefined;

  async function loadProblem(id = untrack(() => params.id)) {
    if (!id) return;
    setLoadStatus("loading");
    setLoadMessage(undefined);
    try {
      const [data, references] = await Promise.all([
        api.getOne(id),
        api.getLearningReferences(id),
      ]);
      setProblem(data);
      setLearningRefs(references.items);
      setLoadStatus("ready");
    } catch (error) {
      setProblem(undefined);
      setLearningRefs([]);
      setLoadStatus("unavailable");
      setLoadMessage(problemFormMessage(error));
    }
  }

  createEffect(
    () => [auth.status(), params.id] as const,
    ([status, id]) => {
      if (status !== "authenticated") return;
      void loadProblem(id);
    },
  );

  createEffect(
    () => deleteOpen(),
    (open) => {
      const dialog = deleteDialogRef;
      if (!dialog) return;
      if (open) {
        if (!dialog.open) dialog.showModal();
      } else if (dialog.open) dialog.close();
    },
  );

  function closeDelete() {
    if (deletePending()) return;
    setDeleteOpen(false);
    setDeleteError(undefined);
  }

  async function toggleCompletion() {
    const current = problem();
    if (!current || statusPending() || deletePending()) return;
    const problemId = params.id;
    if (!problemId) return;
    setStatusError(undefined);
    setStatusPending(true);
    try {
      const updated = await applyCompletionUpdate(
        api,
        current.id,
        nextCompletionStatus(current.status),
      );
      if (params.id !== problemId) return;
      setProblem(updated);
    } catch (error) {
      if (params.id !== problemId) return;
      setStatusError(problemFormMessage(error));
    } finally {
      if (params.id === problemId) setStatusPending(false);
    }
  }

  async function confirmDelete() {
    const current = problem();
    if (!current || deletePending()) return;
    setDeletePending(true);
    setDeleteError(undefined);
    try {
      await api.delete(current.id);
      setDeleteOpen(false);
      navigate(paths.app.problems());
    } catch (error) {
      setDeleteError(problemFormMessage(error));
    } finally {
      setDeletePending(false);
    }
  }

  return (
    <>
      <Title>Problem — Practice</Title>
      <header class="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div class="max-w-2xl">
          <h1 class="text-page font-semibold tracking-tight">Problem details</h1>
          <p class="mt-2 text-muted">Review saved fields and open the original link when you practice.</p>
        </div>
        <a
          class="text-sm text-brand underline-offset-4 hover:underline"
          href={paths.app.problems()}
        >
          Back to library
        </a>
      </header>

      <Switch>
        <Match when={loadStatus() === "loading" || loadStatus() === "idle"}>
          <LoadingPlaceholder variant="block" />
        </Match>
        <Match when={loadStatus() === "unavailable"}>
          <p class="text-muted">{loadMessage()}</p>
          <Button class="mt-4" variant="secondary" onClick={() => void loadProblem()}>
            Try again
          </Button>
        </Match>
        <Match when={loadStatus() === "ready" && problem()}>
          {(getProblem) => {
            const p = getProblem();
            return (
              <Panel
                title={p.title}
                actions={
                  <div class="flex flex-wrap items-center gap-2">
                    <a
                      class="ui-button"
                      data-variant="primary"
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open link
                    </a>
                    <Button
                      variant={completionButtonVariant(p.status)}
                      disabled={statusPending() || deletePending()}
                      aria-busy={statusPending()}
                      onClick={() => void toggleCompletion()}
                    >
                      {completionButtonLabel(p.status, statusPending())}
                    </Button>
                    <details class="relative">
                      <summary
                        class="ui-button cursor-pointer list-none [&::-webkit-details-marker]:hidden"
                        aria-label="More actions"
                      >
                        More
                      </summary>
                      <div class="absolute right-0 z-20 mt-2 min-w-36 rounded-control border border-line bg-surface p-2 shadow-panel">
                        <a
                          class="block rounded-control px-3 py-2 text-sm hover:bg-surface-muted"
                          href={problemEditPath(p.id)}
                        >
                          Edit
                        </a>
                        <button
                          type="button"
                          class="block w-full rounded-control px-3 py-2 text-left text-sm hover:bg-surface-muted"
                          onClick={() => setDeleteOpen(true)}
                        >
                          Delete
                        </button>
                      </div>
                    </details>
                  </div>
                }
              >
                <dl class="grid max-w-2xl gap-4 text-sm">
                  <div>
                    <dt class="text-muted">Status</dt>
                    <dd class="text-body">
                      <Badge tone={p.status === "solved" ? "success" : "neutral"}>
                        {p.status === "solved" ? "Solved" : "Unsolved"}
                      </Badge>
                      <Show when={p.solvedAt}>
                        <span class="ml-2 text-muted">({formatWhen(p.solvedAt!)})</span>
                      </Show>
                      <Show when={statusError()}>
                        <p class="mt-2 text-sm text-danger" role="alert">
                          {statusError()}
                        </p>
                      </Show>
                    </dd>
                  </div>
                  <div>
                    <dt class="text-muted">URL</dt>
                    <dd class="break-all text-body">
                      <a
                        class="text-brand underline-offset-4 hover:underline"
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {p.url}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt class="text-muted">Platform</dt>
                    <dd class="text-body">
                      <PlatformMark slug={p.platformSlug} url={p.url} />
                    </dd>
                  </div>
                  <Show when={p.platformProblemId}>
                    <div>
                      <dt class="text-muted">Judge problem ID</dt>
                      <dd class="text-body">{p.platformProblemId}</dd>
                    </div>
                  </Show>
                  <Show when={p.difficulty}>
                    <div>
                      <dt class="text-muted">Difficulty</dt>
                      <dd class="text-body">{p.difficulty}</dd>
                    </div>
                  </Show>
                  <Show when={p.rating != null}>
                    <div>
                      <dt class="text-muted">Rating</dt>
                      <dd class="tabular-nums text-body">{p.rating}</dd>
                    </div>
                  </Show>
                  <Show when={p.notes}>
                    <div>
                      <dt class="text-muted">Notes</dt>
                      <dd class="whitespace-pre-wrap text-body">{p.notes}</dd>
                    </div>
                  </Show>
                  <div>
                    <dt class="text-muted">Topics</dt>
                    <dd class="text-body">
                      {p.topics.length > 0
                        ? p.topics.map((topic) => topic.name).join(", ")
                        : "None"}
                    </dd>
                  </div>
                  <div>
                    <dt class="text-muted">Saved</dt>
                    <dd class="text-body">{formatWhen(p.createdAt)}</dd>
                  </div>
                  <div>
                    <dt class="text-muted">Updated</dt>
                    <dd class="text-body">{formatWhen(p.updatedAt)}</dd>
                  </div>
                </dl>
                <Show when={isDiscoverFullEnabled()}>
                  <div class="mt-6">
                    <DiscoverCommunityPanel problemId={p.id} />
                  </div>
                </Show>
              </Panel>
            );
          }}
        </Match>
      </Switch>
      <Show when={loadStatus() === "ready" && learningRefs().length > 0}>
        <div class="mt-8">
          <ProblemLearningReferences items={learningRefs()} />
        </div>
      </Show>

      <dialog
        ref={deleteDialogRef}
        aria-labelledby="delete-problem-title"
        class="w-full max-w-md rounded-panel border border-line bg-surface p-6 shadow-panel backdrop:bg-ink/40"
        onCancel={(event) => {
          event.preventDefault();
          closeDelete();
        }}
        onClose={closeDelete}
      >
        <h2 id="delete-problem-title" class="text-section font-semibold">
          Delete problem?
        </h2>
        <p class="mt-3 text-sm text-muted">
          This permanently removes{" "}
          <span class="font-medium text-body">{problem()?.title ?? "this problem"}</span> from
          your library. Your topics stay; only links from this problem to those topics are
          removed.
        </p>
        <Show when={deleteError()}>
          <p class="mt-3 text-sm text-danger" role="alert">
            {deleteError()}
          </p>
        </Show>
        <div class="mt-6 flex flex-wrap gap-3">
          <Button disabled={deletePending()} onClick={() => void confirmDelete()}>
            {deletePending() ? "Deleting…" : "Delete problem"}
          </Button>
          <Button variant="secondary" disabled={deletePending()} onClick={closeDelete}>
            Cancel
          </Button>
        </div>
      </dialog>
    </>
  );
}