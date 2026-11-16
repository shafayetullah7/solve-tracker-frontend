import { Title } from "@solidjs/meta";
import {
  createEffect,
  createSignal,
  For,
  Match,
  onSettled,
  Show,
  Switch,
} from "solid-js";
import { Button } from "../../../components/ui/Button";
import { FormAlert } from "../../../components/ui/FormAlert";
import { FormField, formFieldControlAttrs } from "../../../components/ui/FormField";
import { Panel } from "../../../components/ui/Panel";
import { useAuth } from "../../../lib/auth/context";
import { createProgressApi, type TopicProgress } from "../../../lib/api/modules/progress.api";
import { createTopicsApi, type TopicResponse } from "../../../lib/api/modules/topics.api";
import { progressMessage } from "../../../lib/problems/messages";
import {
  formatTopicProgress,
  topicProgressById,
} from "../../../lib/problems/progress-display";
import { createFormState } from "../../../lib/forms/create-form-state";
import { focusFirstInvalid } from "../../../lib/forms/focus-first-invalid";
import { validateTopicName } from "../../../lib/forms/validate-topic";
import { topicFormMessage } from "../../../lib/topics/messages";
import { paths } from "../../../router";

type ListStatus = "idle" | "loading" | "ready" | "unavailable";

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

  const [createName, setCreateName] = createSignal("");

  const [editingId, setEditingId] = createSignal<string | undefined>();
  const [renameValue, setRenameValue] = createSignal("");

  const [deleteTarget, setDeleteTarget] = createSignal<TopicResponse | undefined>();
  const [deletePending, setDeletePending] = createSignal(false);
  let deleteDialogRef: HTMLDialogElement | undefined;

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

  onSettled(() => {
    if (auth.status() === "authenticated") {
      void loadList();
      void loadProgress();
    }
  });

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
      <header class="mb-8 max-w-2xl">
        <h1 class="text-page font-semibold tracking-tight">Your topics</h1>
        <p class="mt-2 text-muted">
          Organize problems by topic. Names are unique per account (trimmed, case-insensitive).
        </p>
      </header>

      <div class="grid gap-6 lg:grid-cols-2">
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

        <Panel title="Topic list" description="Rename or remove topics you no longer need.">
          <Show when={progressLoadMessage()}>
            <p class="mb-4 text-sm text-muted" role="status">
              {progressLoadMessage()}
            </p>
          </Show>
          <Switch>
            <Match when={listStatus() === "loading" || listStatus() === "idle"}>
              <p class="text-muted" role="status">
                Loading topics…
              </p>
            </Match>
            <Match when={listStatus() === "unavailable"}>
              <p class="text-muted">{listMessage()}</p>
              <Button class="mt-4" variant="secondary" onClick={() => void loadList()}>
                Try again
              </Button>
            </Match>
            <Match when={listStatus() === "ready" && items().length === 0}>
              <p class="text-muted">
                No topics yet. Add one on the left to start organizing your practice.
              </p>
            </Match>
            <Match when={listStatus() === "ready" && items().length > 0}>
              <Show when={truncatedTotal()}>
                <p class="mb-4 text-sm text-muted" role="status">
                  Showing the first 100 topics. More exist in your library.
                </p>
              </Show>
              <ul class="space-y-4">
                <For each={items()}>
                  {(topic) => (
                    <li class="border-b border-line pb-4 last:border-0">
                      <Show
                        when={editingId() === topic.id}
                        fallback={
                          <div class="flex flex-wrap items-center justify-between gap-3">
                            <div class="min-w-0 space-y-1">
                              <a
                                class="text-body font-medium text-brand underline-offset-4 hover:underline"
                                href={`${paths.app.problems()}?topicId=${topic.id}`}
                              >
                                {topic.name}
                              </a>
                              <Show when={topicProgress().get(topic.id)}>
                                {(row) => (
                                  <p class="text-sm text-muted tabular-nums">
                                    {formatTopicProgress(row())}
                                  </p>
                                )}
                              </Show>
                            </div>
                            <div class="flex flex-wrap gap-2">
                              <Button variant="secondary" onClick={() => startRename(topic)}>
                                Rename
                              </Button>
                              <Button
                                variant="secondary"
                                onClick={() => openDelete(topic)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        }
                      >
                        <form
                          class="space-y-2"
                          novalidate
                          onSubmit={(event) => {
                            event.preventDefault();
                            void onRenameSave(
                              topic.id,
                              event.currentTarget as HTMLFormElement,
                            );
                          }}
                        >
                          <FormField
                            id={`topic-rename-${topic.id}`}
                            label="Rename topic"
                            hint="1–100 characters."
                            error={renameForm.fieldErrors().name}
                          >
                            <input
                              class="ui-field"
                              value={renameValue()}
                              onInput={(event) => {
                                setRenameValue(event.currentTarget.value);
                                renameForm.clearField("name");
                              }}
                              {...formFieldControlAttrs({
                                id: `topic-rename-${topic.id}`,
                                hint: "1–100 characters.",
                                error: renameForm.fieldErrors().name,
                              })}
                            />
                          </FormField>
                          <Show when={renameForm.formBanner()}>
                            <FormAlert variant="error" retryAfter={renameForm.retryAfter()}>
                              {renameForm.formBanner()}
                            </FormAlert>
                          </Show>
                          <div class="flex flex-wrap gap-2">
                            <Button
                              type="submit"
                              disabled={renameForm.pending()}
                            >
                              {renameForm.pending() ? "Saving…" : "Save"}
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={cancelRename}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </Show>
                    </li>
                  )}
                </For>
              </ul>
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