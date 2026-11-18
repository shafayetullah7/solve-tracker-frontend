import { Title } from "@solidjs/meta";
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  Match,
  Show,
  Switch,
} from "solid-js";
import { TopicsManageList } from "../../../components/topics/TopicsManageList";
import { TopicSortNav } from "../../../components/topics/TopicSortNav";
import { Button } from "../../../components/ui/Button";
import { FormAlert } from "../../../components/ui/FormAlert";
import { FormField, formFieldControlAttrs } from "../../../components/ui/FormField";
import { Panel } from "../../../components/ui/Panel";
import { useAuth } from "../../../lib/auth/context";
import { createProgressApi, type TopicProgress } from "../../../lib/api/modules/progress.api";
import { createTopicsApi, type TopicResponse } from "../../../lib/api/modules/topics.api";
import type { DashboardTopicSortMode } from "../../../lib/dashboard/sort-dashboard-topics";
import { progressMessage } from "../../../lib/problems/messages";
import {
  summarizeTopicsLibrary,
  topicProgressById,
  topicProgressForItem,
} from "../../../lib/problems/progress-display";
import { createFormState } from "../../../lib/forms/create-form-state";
import { focusFirstInvalid } from "../../../lib/forms/focus-first-invalid";
import { validateTopicName } from "../../../lib/forms/validate-topic";
import { topicFormMessage } from "../../../lib/topics/messages";

type ListStatus = "idle" | "loading" | "ready" | "unavailable";

const pulse = "motion-safe:animate-pulse rounded bg-surface-muted";

function TopicsListSkeleton() {
  return (
    <ul
      class="divide-y divide-line rounded-panel border border-line bg-surface shadow-panel"
      role="status"
      aria-label="Loading"
    >
      <For each={[0, 1, 2]}>
        {() => (
          <li class="px-5 py-4">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="min-w-0 flex-1 space-y-2">
                <div class={`h-5 w-40 ${pulse}`} />
                <div class={`h-2 w-full ${pulse}`} />
                <div class={`h-4 w-32 ${pulse}`} />
              </div>
              <div class="flex gap-2">
                <div class={`h-11 w-24 ${pulse}`} />
                <div class={`h-11 w-20 ${pulse}`} />
              </div>
            </div>
          </li>
        )}
      </For>
    </ul>
  );
}

export default function TopicsIndex() {
  const auth = useAuth();
  const api = createTopicsApi(auth.productClient);
  const progressApi = createProgressApi(auth.productClient);
  const createForm = createFormState("topic");
  const renameForm = createFormState("topic");

  const [items, setItems] = createSignal<TopicResponse[]>([]);
  const [topicProgress, setTopicProgress] = createSignal<Map<string, TopicProgress>>(
    new Map(),
  );
  const [progressLoadMessage, setProgressLoadMessage] = createSignal<
    string | undefined
  >();
  const [listStatus, setListStatus] = createSignal<ListStatus>("idle");
  const [listMessage, setListMessage] = createSignal<string | undefined>();
  const [truncatedTotal, setTruncatedTotal] = createSignal(false);
  const [sortMode, setSortMode] = createSignal<DashboardTopicSortMode>("default");

  const [createName, setCreateName] = createSignal("");

  const [editingId, setEditingId] = createSignal<string | undefined>();
  const [renameValue, setRenameValue] = createSignal("");

  const [deleteTarget, setDeleteTarget] = createSignal<TopicResponse | undefined>();
  const [deletePending, setDeletePending] = createSignal(false);
  let deleteDialogRef: HTMLDialogElement | undefined;

  const progressRows = createMemo(() =>
    items().map((topic) => topicProgressForItem(topic, topicProgress())),
  );

  const listPanelDescription = createMemo(() => {
    if (listStatus() === "ready" && items().length > 0) {
      return `${summarizeTopicsLibrary(progressRows())}. Rename or remove topics you no longer need.`;
    }
    return "Rename or remove topics you no longer need.";
  });

  async function loadProgress() {
    setProgressLoadMessage(undefined);
    try {
      const data = await progressApi.getSummaries();
      setTopicProgress(topicProgressById(data.topics));
    } catch (error) {
      setTopicProgress(new Map());
      setProgressLoadMessage(progressMessage(error));
    }
  }

  async function loadList() {
    setListStatus("loading");
    setListMessage(undefined);
    try {
      const result = await api.list({ page: 1, pageSize: 100 });
      setItems(result.items);
      setTruncatedTotal(result.meta.total > result.items.length);
      setListStatus("ready");
    } catch (error) {
      setItems([]);
      setListStatus("unavailable");
      setListMessage(topicFormMessage(error));
    }
  }

  createEffect(
    () => auth.status(),
    (status) => {
      if (status !== "authenticated") return;
      void loadList();
      void loadProgress();
    },
  );

  createEffect(
    () => [deleteTarget()] as const,
    ([target]) => {
      const dialog = deleteDialogRef;
      if (!dialog) return;
      if (target) {
        if (!dialog.open) dialog.showModal();
      } else if (dialog.open) dialog.close();
    },
  );

  async function onCreate(event: Event) {
    event.preventDefault();
    if (createForm.pending()) return;
    const formEl = event.currentTarget as HTMLFormElement;
    const clientErrors = validateTopicName({ name: createName() });
    if (Object.keys(clientErrors).length > 0) {
      createForm.applyClientErrors(clientErrors);
      focusFirstInvalid(formEl);
      return;
    }
    createForm.beginSubmit();
    createForm.setPending(true);
    const name = createName().trim();
    try {
      await api.create({ name });
      setCreateName("");
      createForm.resetErrors();
      await loadList();
      await loadProgress();
    } catch (error) {
      createForm.applyApiError(error);
      focusFirstInvalid(formEl);
    } finally {
      createForm.setPending(false);
    }
  }

  function startRename(topic: TopicResponse) {
    setEditingId(topic.id);
    setRenameValue(topic.name);
    renameForm.resetErrors();
  }

  function cancelRename() {
    setEditingId(undefined);
    setRenameValue("");
    renameForm.resetErrors();
  }

  async function onRenameSave(topicId: string, formEl: HTMLFormElement | undefined) {
    if (renameForm.pending()) return;
    const clientErrors = validateTopicName({ name: renameValue() });
    if (Object.keys(clientErrors).length > 0) {
      renameForm.applyClientErrors(clientErrors);
      focusFirstInvalid(formEl);
      return;
    }
    renameForm.beginSubmit();
    renameForm.setPending(true);
    const name = renameValue().trim();
    try {
      await api.rename(topicId, { name });
      cancelRename();
      await loadList();
      await loadProgress();
    } catch (error) {
      renameForm.applyApiError(error);
      focusFirstInvalid(formEl);
    } finally {
      renameForm.setPending(false);
    }
  }

  function openDelete(topic: TopicResponse) {
    setDeleteTarget(topic);
  }

  function closeDelete() {
    if (deletePending()) return;
    setDeleteTarget(undefined);
  }

  async function confirmDelete() {
    const topic = deleteTarget();
    if (!topic || deletePending()) return;
    setDeletePending(true);
    try {
      await api.delete(topic.id);
      setDeleteTarget(undefined);
      await loadList();
      await loadProgress();
    } catch (error) {
      setListMessage(topicFormMessage(error));
      setDeleteTarget(undefined);
      await loadList();
    } finally {
      setDeletePending(false);
    }
  }

  return (
    <>
      <Title>Topics — Practice</Title>
      <header class="mb-8">
        <h1 class="text-page font-semibold tracking-tight">Your topics</h1>
        <p class="mt-2 text-muted">
          Organize problems by topic. Names are unique per account (trimmed, case-insensitive).
        </p>
      </header>

      <div class="flex flex-col gap-6">
        <div class="max-w-2xl">
          <Panel title="Add a topic" description="Create a label for future problems.">
            <form class="space-y-4" novalidate onSubmit={onCreate}>
              <FormField
                id="topic-create-name"
                label="Topic name"
                hint="1–100 characters."
                error={createForm.fieldErrors().name}
              >
                <input
                  class="ui-field"
                  value={createName()}
                  onInput={(event) => {
                    setCreateName(event.currentTarget.value);
                    createForm.clearField("name");
                  }}
                  {...formFieldControlAttrs({
                    id: "topic-create-name",
                    hint: "1–100 characters.",
                    error: createForm.fieldErrors().name,
                  })}
                />
              </FormField>
              <Show when={createForm.formBanner()}>
                <FormAlert variant="error" retryAfter={createForm.retryAfter()}>
                  {createForm.formBanner()}
                </FormAlert>
              </Show>
              <Button type="submit" disabled={createForm.pending()}>
                {createForm.pending() ? "Creating…" : "Create topic"}
              </Button>
            </form>
          </Panel>
        </div>

        <Panel
          title="Topics"
          description={listPanelDescription()}
          actions={
            <Show when={listStatus() === "ready" && items().length > 0}>
              <TopicSortNav value={sortMode()} onChange={setSortMode} />
            </Show>
          }
        >
          <Show when={progressLoadMessage()}>
            <p class="mb-4 text-sm text-muted" role="status">
              {progressLoadMessage()}
            </p>
          </Show>
          <Switch>
            <Match when={listStatus() === "loading" || listStatus() === "idle"}>
              <TopicsListSkeleton />
            </Match>
            <Match when={listStatus() === "unavailable"}>
              <p class="text-muted">{listMessage()}</p>
              <Button class="mt-4" variant="secondary" onClick={() => void loadList()}>
                Try again
              </Button>
            </Match>
            <Match when={listStatus() === "ready" && items().length === 0}>
              <p class="text-muted">
                No topics yet. Add one above to start organizing your practice.
              </p>
            </Match>
            <Match when={listStatus() === "ready" && items().length > 0}>
              <Show when={truncatedTotal()}>
                <p class="mb-4 text-sm text-muted" role="status">
                  Showing the first 100 topics. More exist in your library.
                </p>
              </Show>
              <TopicsManageList
                items={items()}
                progressById={topicProgress()}
                progressUnavailable={Boolean(progressLoadMessage())}
                sortMode={sortMode()}
                editingId={editingId()}
                renameValue={renameValue()}
                renameFieldError={renameForm.fieldErrors().name}
                renameFormBanner={renameForm.formBanner()}
                renameRetryAfter={renameForm.retryAfter()}
                renamePending={renameForm.pending()}
                onRenameValueInput={setRenameValue}
                onRenameClearField={() => renameForm.clearField("name")}
                onStartRename={startRename}
                onCancelRename={cancelRename}
                onRenameSave={(topicId, formEl) => void onRenameSave(topicId, formEl)}
                onOpenDelete={openDelete}
              />
            </Match>
          </Switch>
        </Panel>
      </div>

      <dialog
        ref={deleteDialogRef}
        aria-labelledby="delete-topic-title"
        class="w-full max-w-md rounded-panel border border-line bg-surface p-6 shadow-panel backdrop:bg-ink/40"
        onCancel={(event) => {
          event.preventDefault();
          closeDelete();
        }}
        onClose={closeDelete}
      >
        <h2 id="delete-topic-title" class="text-section font-semibold">
          Delete topic?
        </h2>
        <p class="mt-3 text-sm text-muted">
          This removes the topic{" "}
          <span class="font-medium text-body">{deleteTarget()?.name}</span> from your library.
          Saved problems stay in your library; only their links to this topic are removed.
        </p>
        <div class="mt-6 flex flex-wrap gap-3">
          <Button disabled={deletePending()} onClick={() => void confirmDelete()}>
            {deletePending() ? "Deleting…" : "Delete topic"}
          </Button>
          <Button variant="secondary" disabled={deletePending()} onClick={closeDelete}>
            Cancel
          </Button>
        </div>
      </dialog>
    </>
  );
}