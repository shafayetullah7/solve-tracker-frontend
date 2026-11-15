import { Title } from "@solidjs/meta";
import { useNavigate, useParams } from "@solidjs/router";
import {
  createEffect,
  createSignal,
  Match,
  Show,
  Switch,
} from "solid-js";
import { Button } from "../../components/ui/Button";
import { Panel } from "../../components/ui/Panel";
import { createProblemsApi, type ProblemResponse } from "../../lib/api/modules/problems.api";
import { useAuth } from "../../lib/auth/context";
import {
  applyCompletionUpdate,
  completionButtonLabel,
  completionButtonVariant,
  nextCompletionStatus,
} from "../../lib/problems/completion-actions";
import { problemFormMessage } from "../../lib/problems/messages";
import { problemEditPath } from "../../lib/problems/paths";
import { paths } from "../../router";

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

  let deleteDialogRef: HTMLDialogElement | undefined;

  async function loadProblem() {
    const id = params.id;
    if (!id) return;
    setLoadStatus("loading");
    setLoadMessage(undefined);
    try {
      const data = await api.getOne(id);
      setProblem(data);
      setLoadStatus("ready");
    } catch (error) {
      setProblem(undefined);
      setLoadStatus("unavailable");
      setLoadMessage(problemFormMessage(error));
    }
  }

  createEffect(
    () => [auth.status(), params.id] as const,
    ([status]) => {
      if (status !== "authenticated") return;
      void loadProblem();
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
      navigate(paths.problems());
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
          href={paths.problems()}
        >
          Back to library
        </a>
      </header>

      <Switch>
        <Match when={loadStatus() === "loading" || loadStatus() === "idle"}>
          <p class="text-muted" role="status">
            Loading problem…
          </p>
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
              <Panel title={p.title}>
                <dl class="grid max-w-2xl gap-4 text-sm">
                  <div>
                    <dt class="text-muted">Status</dt>
                    <dd class="text-body font-medium">
                      {p.status === "solved" ? "Solved" : "Unsolved"}
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
                  <Show when={p.platformProblemId}>
                    <div>
                      <dt class="text-muted">Platform ID</dt>
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

                <div class="mt-8 flex flex-wrap gap-2">
                  <Button
                    variant={completionButtonVariant(p.status)}
                    disabled={statusPending() || deletePending()}
                    aria-busy={statusPending()}
                    onClick={() => void toggleCompletion()}
                  >
                    {completionButtonLabel(p.status, statusPending())}
                  </Button>
                  <a
                    class="ui-button"
                    data-variant="primary"
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open link
                  </a>
                  <a
                    class="ui-button"
                    data-variant="secondary"
                    href={problemEditPath(p.id)}
                  >
                    Edit
                  </a>
                  <Button variant="secondary" onClick={() => setDeleteOpen(true)}>
                    Delete
                  </Button>
                </div>
              </Panel>
            );
          }}
        </Match>
      </Switch>

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