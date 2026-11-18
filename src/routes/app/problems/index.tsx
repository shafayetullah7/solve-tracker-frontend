import { Title } from "@solidjs/meta";
import { useLocation, useNavigate } from "@solidjs/router";
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  Match,
  Show,
  Switch,
  untrack,
} from "solid-js";
import {
  LibraryProgressStrip,
  type ProgressLoadStatus,
} from "../../../components/problems/LibraryProgressStrip";
import { ProblemBrowseFiltersSection } from "../../../components/problems/ProblemBrowseFiltersSection";
import { ProblemLibraryRow } from "../../../components/problems/ProblemLibraryRow";
import { Button } from "../../../components/ui/Button";
import { LoadingPlaceholder } from "../../../components/ui/LoadingPlaceholder";
import { Panel } from "../../../components/ui/Panel";
import { useAuth } from "../../../lib/auth/context";
import {
  createProblemsApi,
  type ListProblemsQuery,
  type ProblemResponse,
} from "../../../lib/api/modules/problems.api";
import {
  createProgressApi,
  type ProgressCounts,
} from "../../../lib/api/modules/progress.api";
import { createTopicsApi, type TopicResponse } from "../../../lib/api/modules/topics.api";
import {
  applyCompletionUpdate,
  nextCompletionStatus,
} from "../../../lib/problems/completion-actions";
import {
  browseClearHref,
  hasActiveBrowseFilters,
  parseBrowseSearch,
} from "../../../lib/problems/browse-query";
import { topicIdFromSearch } from "../../../lib/problems/form-state";
import {
  problemFormMessage,
  problemListMessage,
  progressMessage,
} from "../../../lib/problems/messages";
import { problemNewPath, problemsBrowseHref } from "../../../lib/problems/paths";

type ListStatus = "idle" | "loading" | "ready" | "unavailable";

type ListMeta = {
  page: number;
  pageSize: number;
  total: number;
};

export default function ProblemsIndex() {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const api = createProblemsApi(auth.productClient);
  const topicsApi = createTopicsApi(auth.productClient);
  const progressApi = createProgressApi(auth.productClient);

  const listQuery = createMemo(() => parseBrowseSearch(location.search));
  const filterTopicId = createMemo(() => topicIdFromSearch(location.search));

  const [items, setItems] = createSignal<ProblemResponse[]>([]);
  const [listMeta, setListMeta] = createSignal<ListMeta>({
    page: 1,
    pageSize: 25,
    total: 0,
  });
  const [listStatus, setListStatus] = createSignal<ListStatus>("idle");
  const [listMessage, setListMessage] = createSignal<string | undefined>();

  const [topics, setTopics] = createSignal<TopicResponse[]>([]);
  const [topicsLoading, setTopicsLoading] = createSignal(true);
  const [topicsTruncated, setTopicsTruncated] = createSignal(false);

  const [deleteTarget, setDeleteTarget] = createSignal<ProblemResponse | undefined>();
  const [deletePending, setDeletePending] = createSignal(false);
  const [deleteError, setDeleteError] = createSignal<string | undefined>();

  const [statusPendingId, setStatusPendingId] = createSignal<string | undefined>();
  const [statusError, setStatusError] = createSignal<
    { id: string; message: string } | undefined
  >();

  const [progressStatus, setProgressStatus] = createSignal<ProgressLoadStatus>("idle");
  const [overallProgress, setOverallProgress] = createSignal<ProgressCounts | undefined>();
  const [progressError, setProgressError] = createSignal<string | undefined>();

  let deleteDialogRef: HTMLDialogElement | undefined;

  async function loadProgress() {
    setProgressStatus("loading");
    setProgressError(undefined);
    try {
      const data = await progressApi.getSummaries();
      setOverallProgress(data.overall);
      setProgressStatus("ready");
    } catch (error) {
      setOverallProgress(undefined);
      setProgressStatus("error");
      setProgressError(progressMessage(error));
    }
  }

  const totalPages = createMemo(() => {
    const meta = listMeta();
    if (meta.total === 0) return 1;
    return Math.max(1, Math.ceil(meta.total / meta.pageSize));
  });

  async function loadTopics() {
    setTopicsLoading(true);
    try {
      const result = await topicsApi.list({ page: 1, pageSize: 100 });
      setTopics(result.items);
      setTopicsTruncated(result.meta.total > result.items.length);
    } catch {
      setTopics([]);
    } finally {
      setTopicsLoading(false);
    }
  }

  async function loadList(query = untrack(listQuery)) {
    setListStatus("loading");
    setListMessage(undefined);
    try {
      const result = await api.list(query);
      setItems(result.items);
      setListMeta({
        page: result.meta.page,
        pageSize: result.meta.pageSize,
        total: result.meta.total,
      });
      setListStatus("ready");
    } catch (error) {
      setItems([]);
      setListMeta((prev) => ({ ...prev, total: 0 }));
      setListStatus("unavailable");
      setListMessage(problemListMessage(error));
    }
  }

  createEffect(
    () => [auth.status(), listQuery()] as const,
    ([status, query]) => {
      if (status !== "authenticated") return;
      void loadList(query);
    },
  );

  createEffect(
    () => auth.status(),
    (status) => {
      if (status !== "authenticated") return;
      void loadTopics();
      void loadProgress();
    },
  );

  createEffect(
    () => deleteTarget(),
    (target) => {
      const dialog = deleteDialogRef;
      if (!dialog) return;
      if (target) {
        if (!dialog.open) dialog.showModal();
      } else if (dialog.open) dialog.close();
    },
  );

  function applyBrowse(query: ListProblemsQuery) {
    navigate(problemsBrowseHref(query), { scroll: false, replace: false });
  }

  function setPage(page: number) {
    applyBrowse({ ...listQuery(), page });
  }

  function openDelete(problem: ProblemResponse) {
    setDeleteError(undefined);
    setDeleteTarget(problem);
  }

  function closeDelete() {
    if (deletePending()) return;
    setDeleteTarget(undefined);
    setDeleteError(undefined);
  }

  async function toggleCompletion(problem: ProblemResponse) {
    if (statusPendingId() === problem.id) return;
    setStatusPendingId(problem.id);
    setStatusError((current) =>
      current?.id === problem.id ? undefined : current,
    );
    try {
      const updated = await applyCompletionUpdate(
        api,
        problem.id,
        nextCompletionStatus(problem.status),
      );
      setItems((prev) =>
        prev.map((row) => (row.id === updated.id ? updated : row)),
      );
      await loadProgress();
    } catch (error) {
      setStatusError({
        id: problem.id,
        message: problemFormMessage(error),
      });
    } finally {
      setStatusPendingId((current) =>
        current === problem.id ? undefined : current,
      );
    }
  }

  async function confirmDelete() {
    const problem = deleteTarget();
    if (!problem || deletePending()) return;
    setDeletePending(true);
    setDeleteError(undefined);
    try {
      await api.delete(problem.id);
      setDeleteTarget(undefined);
      await loadList();
      await loadProgress();
    } catch (error) {
      setDeleteError(problemFormMessage(error));
    } finally {
      setDeletePending(false);
    }
  }

  const addHref = () =>
    filterTopicId() ? problemNewPath(filterTopicId()) : problemNewPath();

  const showTopicBanner = () => {
    const topicId = filterTopicId();
    if (!topicId) return false;
    const query = listQuery();
    if (query.topicIds?.length) return false;
    return (
      !query.q &&
      !query.status &&
      !query.platform &&
      query.untagged !== "true" &&
      query.page === 1 &&
      query.pageSize === 25 &&
      query.sort === "createdAt" &&
      query.order === "desc"
    );
  };

  return (
    <>
      <Title>Library — Practice</Title>
      <header class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div class="min-w-0 space-y-1">
          <h1 class="text-page font-semibold tracking-tight">Your problem library</h1>
          <LibraryProgressStrip
            loadStatus={progressStatus}
            overall={overallProgress}
            errorMessage={progressError}
            matchingTotal={() =>
              listStatus() === "ready" ? listMeta().total : undefined
            }
            listReady={() => listStatus() === "ready"}
          />
        </div>
        <a class="ui-button shrink-0" data-variant="primary" href={addHref()}>
          Add problem
        </a>
      </header>

      <Show when={showTopicBanner()}>
        <p class="mb-4 text-sm text-muted">
          Filtered by topic.{" "}
          <a
            class="text-brand underline-offset-4 hover:underline"
            href={browseClearHref()}
          >
            Show all
          </a>
        </p>
      </Show>

      <Panel>
        <div class="sticky top-0 z-10 -mx-5 mb-3 border-b border-line bg-surface px-5 py-2 sm:-mx-6 sm:px-6">
          <ProblemBrowseFiltersSection
            searchKey={location.search}
            topics={topics}
            topicsLoading={topicsLoading}
            topicsTruncated={topicsTruncated}
            clearHref={browseClearHref()}
            onApply={applyBrowse}
          />
        </div>

        <Switch>
          <Match when={listStatus() === "loading" || listStatus() === "idle"}>
            <LoadingPlaceholder variant="row" lines={3} />
          </Match>
          <Match when={listStatus() === "unavailable"}>
            <p class="text-muted">{listMessage()}</p>
            <Show when={hasActiveBrowseFilters(location.search)}>
              <a
                class="mt-2 inline-block text-sm text-brand underline-offset-4 hover:underline"
                href={browseClearHref()}
              >
                Clear filters
              </a>
            </Show>
            <Button class="mt-4" variant="secondary" onClick={() => void loadList()}>
              Try again
            </Button>
          </Match>
          <Match
            when={
              listStatus() === "ready" &&
              listMeta().total === 0 &&
              !hasActiveBrowseFilters(location.search)
            }
          >
            <p class="text-muted">
              No problems yet.{" "}
              <a class="text-brand underline-offset-4 hover:underline" href={addHref()}>
                Add your first problem
              </a>{" "}
              or create topics to organize them.
            </p>
          </Match>
          <Match
            when={
              listStatus() === "ready" &&
              listMeta().total === 0 &&
              hasActiveBrowseFilters(location.search)
            }
          >
            <p class="text-muted">No problems match these filters.</p>
            <a
              class="mt-2 inline-block text-sm text-brand underline-offset-4 hover:underline"
              href={browseClearHref()}
            >
              Clear filters
            </a>
          </Match>
          <Match when={listStatus() === "ready" && listMeta().total > 0}>
            <ul class="space-y-4">
              <For each={items()}>
                {(problem) => (
                  <ProblemLibraryRow
                    problem={problem}
                    statusPending={statusPendingId() === problem.id}
                    statusErrorMessage={
                      statusError()?.id === problem.id
                        ? statusError()!.message
                        : undefined
                    }
                    onToggleCompletion={() => void toggleCompletion(problem)}
                    onDelete={() => openDelete(problem)}
                  />
                )}
              </For>
            </ul>

            <div class="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
              <p class="text-sm text-muted tabular-nums" role="status">
                Page {listMeta().page} of {totalPages()} · {listMeta().total} results
              </p>
              <div class="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  disabled={listMeta().page <= 1}
                  onClick={() => setPage(listMeta().page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  disabled={listMeta().page >= totalPages()}
                  onClick={() => setPage(listMeta().page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </Match>
        </Switch>
      </Panel>

      <dialog
        ref={deleteDialogRef}
        aria-labelledby="delete-problem-list-title"
        class="w-full max-w-md rounded-panel border border-line bg-surface p-6 shadow-panel backdrop:bg-ink/40"
        onCancel={(event) => {
          event.preventDefault();
          closeDelete();
        }}
        onClose={closeDelete}
      >
        <h2 id="delete-problem-list-title" class="text-section font-semibold">
          Delete problem?
        </h2>
        <p class="mt-3 text-sm text-muted">
          This permanently removes{" "}
          <span class="font-medium text-body">{deleteTarget()?.title}</span> from your library.
          Your topics stay; only links from this problem to those topics are removed.
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