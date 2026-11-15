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
import { Button } from "../../components/ui/Button";
import { Panel } from "../../components/ui/Panel";
import { ApiError } from "../../lib/api/errors";
import { useAuth } from "../../lib/auth/context";
import { createTopicsApi, type TopicResponse } from "../../lib/api/modules/topics.api";
import { topicFieldErrors, topicFormMessage } from "../../lib/topics/messages";

type ListStatus = "idle" | "loading" | "ready" | "unavailable";

export default function TopicsIndex() {
  const auth = useAuth();
  const api = createTopicsApi(auth.productClient);

  const [items, setItems] = createSignal<TopicResponse[]>([]);
  const [listStatus, setListStatus] = createSignal<ListStatus>("idle");
  const [listMessage, setListMessage] = createSignal<string | undefined>();
  const [truncatedTotal, setTruncatedTotal] = createSignal(false);

  const [createName, setCreateName] = createSignal("");
  const [createPending, setCreatePending] = createSignal(false);
  const [createError, setCreateError] = createSignal<string | undefined>();
  const [createFieldErrors, setCreateFieldErrors] = createSignal<
    Record<string, string>
  >({});

  const [editingId, setEditingId] = createSignal<string | undefined>();
  const [renameValue, setRenameValue] = createSignal("");
  const [renamePending, setRenamePending] = createSignal(false);
  const [renameError, setRenameError] = createSignal<string | undefined>();
  const [renameFieldErrors, setRenameFieldErrors] = createSignal<
    Record<string, string>
  >({});

  const [deleteTarget, setDeleteTarget] = createSignal<TopicResponse | undefined>();
  const [deletePending, setDeletePending] = createSignal(false);
  let deleteDialogRef: HTMLDialogElement | undefined;

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
    if (auth.status() === "authenticated") void loadList();
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
    if (createPending()) return;
    setCreatePending(true);
    setCreateError(undefined);
    setCreateFieldErrors({});
    const name = createName().trim();
    try {
      await api.create({ name });
      setCreateName("");
      await loadList();
    } catch (error) {
      if (error instanceof ApiError && error.details)
        setCreateFieldErrors(topicFieldErrors(error.details));
      setCreateError(topicFormMessage(error));
    } finally {
      setCreatePending(false);
    }
  }

  function startRename(topic: TopicResponse) {
    setEditingId(topic.id);
    setRenameValue(topic.name);
    setRenameError(undefined);
    setRenameFieldErrors({});
  }

  function cancelRename() {
    setEditingId(undefined);
    setRenameValue("");
    setRenameError(undefined);
    setRenameFieldErrors({});
  }

  async function onRenameSave(topicId: string) {
    if (renamePending()) return;
    setRenamePending(true);
    setRenameError(undefined);
    setRenameFieldErrors({});
    const name = renameValue().trim();
    try {
      await api.rename(topicId, { name });
      cancelRename();
      await loadList();
    } catch (error) {
      if (error instanceof ApiError && error.details)
        setRenameFieldErrors(topicFieldErrors(error.details));
      setRenameError(topicFormMessage(error));
    } finally {
      setRenamePending(false);
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
          <form class="space-y-4" onSubmit={onCreate}>
            <div>
              <label class="mb-2 block text-sm font-medium" for="topic-create-name">
                Topic name
              </label>
              <input
                id="topic-create-name"
                class="ui-field"
                value={createName()}
                onInput={(event) => setCreateName(event.currentTarget.value)}
                aria-invalid={createFieldErrors().name ? "true" : undefined}
                aria-describedby="topic-create-hint topic-create-error"
              />
              <p id="topic-create-hint" class="mt-2 text-sm text-muted">
                1–100 characters.
              </p>
              <Show when={createFieldErrors().name}>
                <p id="topic-create-error" class="mt-2 text-sm text-danger">
                  {createFieldErrors().name}
                </p>
              </Show>
            </div>
            <Show when={createError()}>
              <p class="text-sm text-danger" role="alert">
                {createError()}
              </p>
            </Show>
            <Button type="submit" disabled={createPending()}>
              {createPending() ? "Creating…" : "Create topic"}
            </Button>
          </form>
        </Panel>

        <Panel title="Topic list" description="Rename or remove topics you no longer need.">
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
                            <span class="text-body font-medium">{topic.name}</span>
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
                        <div class="space-y-2">
                          <label
                            class="mb-2 block text-sm font-medium"
                            for={`topic-rename-${topic.id}`}
                          >
                            Rename topic
                          </label>
                          <input
                            id={`topic-rename-${topic.id}`}
                            class="ui-field"
                            value={renameValue()}
                            onInput={(event) => setRenameValue(event.currentTarget.value)}
                            aria-invalid={renameFieldErrors().name ? "true" : undefined}
                            aria-describedby={`topic-rename-hint-${topic.id} topic-rename-error-${topic.id}`}
                          />
                          <p id={`topic-rename-hint-${topic.id}`} class="text-sm text-muted">
                            1–100 characters.
                          </p>
                          <Show when={renameFieldErrors().name}>
                            <p
                              id={`topic-rename-error-${topic.id}`}
                              class="text-sm text-danger"
                            >
                              {renameFieldErrors().name}
                            </p>
                          </Show>
                          <Show when={renameError()}>
                            <p class="text-sm text-danger" role="alert">
                              {renameError()}
                            </p>
                          </Show>
                          <div class="flex flex-wrap gap-2">
                            <Button
                              disabled={renamePending()}
                              onClick={() => void onRenameSave(topic.id)}
                            >
                              {renamePending() ? "Saving…" : "Save"}
                            </Button>
                            <Button variant="secondary" onClick={cancelRename}>
                              Cancel
                            </Button>
                          </div>
                        </div>
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
          Problem records are unchanged (no problems are stored yet in this release).
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