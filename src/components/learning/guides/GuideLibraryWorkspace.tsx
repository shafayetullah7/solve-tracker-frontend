import { useLocation, useNavigate } from "@solidjs/router";
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  Match,
  onCleanup,
  Show,
  Switch,
} from "solid-js";
import type {
  createLearningGuidesApi,
  GuideListResponse,
  GuideResponse,
} from "../../../lib/api/modules/learning-guides.api";
import {
  libraryPageHref,
  librarySearchHref,
  libraryTabHref,
  parseLibrarySearch,
} from "../../../lib/learning/library-query";
import { learningGuidePath } from "../../../lib/learning/paths";
import { resumeHrefForGuide } from "../../../lib/learning/resume-guide";
import { Button } from "../../ui/Button";
import { FormAlert } from "../../ui/FormAlert";
import { LoadingPlaceholder } from "../../ui/LoadingPlaceholder";

type LearningGuidesApi = ReturnType<typeof createLearningGuidesApi>;

type GuideLibraryRow = {
  guide: GuideResponse;
  resumeHref: string;
  resumeLabel: "Continue" | "Open guide";
};

type LoadStatus = "idle" | "loading" | "ready" | "error";

const SEARCH_DEBOUNCE_MS = 300;

type GuideLibraryWorkspaceProps = {
  api: LearningGuidesApi;
  authStatus: () => string;
};

function totalPages(meta: GuideListResponse["meta"]): number {
  return Math.max(1, Math.ceil(meta.total / meta.pageSize));
}

export function GuideLibraryWorkspace(props: GuideLibraryWorkspaceProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const listQuery = createMemo(() => parseLibrarySearch(location.search));

  const [loadStatus, setLoadStatus] = createSignal<LoadStatus>("idle");
  const [items, setItems] = createSignal<GuideLibraryRow[]>([]);
  const [meta, setMeta] = createSignal<GuideListResponse["meta"] | undefined>();
  const [loadError, setLoadError] = createSignal<string | undefined>();
  const [actionError, setActionError] = createSignal<string | undefined>();
  const [searchDraft, setSearchDraft] = createSignal("");
  const [lifecyclePendingId, setLifecyclePendingId] = createSignal<string | undefined>();

  let listAbort: AbortController | undefined;
  let searchDebounce: ReturnType<typeof setTimeout> | undefined;

  createEffect(
    () => listQuery().search,
    (search) => {
      setSearchDraft(search ?? "");
    },
  );

  async function loadList(signal: AbortSignal) {
    const query = listQuery();
    const body = await props.api.list(query, signal);
    if (signal.aborted) return;

    const enrollments = await Promise.allSettled(
      body.items.map((guide) => props.api.enrollment(guide.id, signal)),
    );

    const rows: GuideLibraryRow[] = body.items.map((guide, index) => {
      const enrollment =
        enrollments[index]?.status === "fulfilled" ? enrollments[index].value : undefined;
      const resumeNodeId = enrollment?.resumeNodeId ?? null;
      const { href, label } = resumeHrefForGuide(guide.id, resumeNodeId, null);
      return { guide, resumeHref: href, resumeLabel: label };
    });

    setItems(rows);
    setMeta(body.meta);
    setLoadStatus("ready");
  }

  createEffect(
    () => [props.authStatus(), location.search] as const,
    ([authStatus]) => {
      if (authStatus !== "authenticated") return;

      listAbort?.abort();
      const controller = new AbortController();
      listAbort = controller;

      setLoadStatus("loading");
      setLoadError(undefined);

      void loadList(controller.signal).catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setLoadStatus("error");
        setLoadError(cause instanceof Error ? cause.message : "Could not load guides.");
        setItems([]);
        setMeta(undefined);
      });

      onCleanup(() => controller.abort());
    },
  );

  onCleanup(() => {
    listAbort?.abort();
    if (searchDebounce) clearTimeout(searchDebounce);
  });

  function scheduleSearchNavigate(value: string) {
    if (searchDebounce) clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      const href = librarySearchHref(listQuery(), value);
      navigate(href);
    }, SEARCH_DEBOUNCE_MS);
  }

  async function runLifecycle(guide: GuideResponse, action: "archive" | "unarchive") {
    if (lifecyclePendingId()) return;
    setActionError(undefined);
    setLifecyclePendingId(guide.id);
    try {
      await props.api.lifecycle(guide.id, {
        action,
        expectedMetadataRevision: guide.metadataRevision,
        operationId: crypto.randomUUID(),
      });
      listAbort?.abort();
      const controller = new AbortController();
      listAbort = controller;
      setLoadStatus("loading");
      await loadList(controller.signal);
    } catch (cause: unknown) {
      setActionError(cause instanceof Error ? cause.message : "Could not update guide.");
    } finally {
      setLifecyclePendingId(undefined);
    }
  }

  const pages = () => (meta() ? totalPages(meta()!) : 1);
  const currentPage = () => listQuery().page ?? 1;
  const statusTab = () => listQuery().status ?? "active";

  return (
    <div class="space-y-4">
      <Show when={actionError()}>
        {(message) => <FormAlert variant="error">{message()}</FormAlert>}
      </Show>

      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div class="flex-1 space-y-2">
          <label class="block text-label font-medium text-ink" for="guide-library-search">
            Search guides
          </label>
          <input
            id="guide-library-search"
            type="search"
            class="ui-input w-full max-w-md"
            placeholder="Title or description"
            value={searchDraft()}
            onInput={(event) => {
              const value = event.currentTarget.value;
              setSearchDraft(value);
              scheduleSearchNavigate(value);
            }}
          />
        </div>
        <div
          role="tablist"
          aria-label="Guide library filter"
          class="inline-flex rounded-panel border border-line bg-surface p-1"
        >
          <a
            role="tab"
            class="ui-button inline-flex min-h-11 px-4"
            data-variant={statusTab() === "active" ? "primary" : "ghost"}
            aria-selected={statusTab() === "active" ? "true" : "false"}
            href={libraryTabHref("active", listQuery())}
          >
            Active
          </a>
          <a
            role="tab"
            class="ui-button inline-flex min-h-11 px-4"
            data-variant={statusTab() === "archived" ? "primary" : "ghost"}
            aria-selected={statusTab() === "archived" ? "true" : "false"}
            href={libraryTabHref("archived", listQuery())}
          >
            Archived
          </a>
        </div>
      </div>

      <Switch>
        <Match when={loadStatus() === "loading" || loadStatus() === "idle"}>
          <LoadingPlaceholder variant="block" />
        </Match>
        <Match when={loadStatus() === "error"}>
          <FormAlert variant="error">{loadError()}</FormAlert>
        </Match>
        <Match when={loadStatus() === "ready"}>
          <Show
            when={items().length > 0}
            fallback={
              <div class="rounded-panel border border-line bg-surface p-6">
                <p class="text-body text-muted">
                  {listQuery().search?.trim()
                    ? "No guides match your search."
                    : statusTab() === "archived"
                      ? "No archived guides."
                      : "You have no guides yet."}
                </p>
              </div>
            }
          >
            <ul class="divide-y divide-line rounded-panel border border-line bg-surface">
              <For each={items()}>
                {(row) => (
                  <li class="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div class="min-w-0 flex-1">
                      <p class="text-label font-medium text-ink">{row.guide.title}</p>
                      <Show when={row.guide.description}>
                        <p class="mt-1 text-sm text-muted">{row.guide.description}</p>
                      </Show>
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                      <a
                        class="ui-button inline-flex min-h-11"
                        data-variant="primary"
                        href={row.resumeHref}
                      >
                        {row.resumeLabel}
                      </a>
                      <a
                        class="ui-button inline-flex min-h-11"
                        data-variant="secondary"
                        href={learningGuidePath(row.guide.id)}
                      >
                        Overview
                      </a>
                      <Button
                        type="button"
                        variant="secondary"
                        class="min-h-11"
                        disabled={lifecyclePendingId() === row.guide.id}
                        onClick={() =>
                          void runLifecycle(
                            row.guide,
                            statusTab() === "archived" ? "unarchive" : "archive",
                          )
                        }
                      >
                        {statusTab() === "archived" ? "Unarchive" : "Archive"}
                      </Button>
                    </div>
                  </li>
                )}
              </For>
            </ul>
          </Show>

          <Show when={meta()} keyed>
            {(m) => (
              <Show when={m.total > 0}>
              <nav
                class="flex flex-wrap items-center justify-between gap-3"
                aria-label="Guide library pagination"
              >
                <p class="text-sm text-muted">
                  Page {currentPage()} of {pages()} · {m.total} guide
                  {m.total === 1 ? "" : "s"}
                </p>
                <div class="flex gap-2">
                  <Show when={currentPage() > 1}>
                    <a
                      class="ui-button inline-flex min-h-11"
                      data-variant="secondary"
                      href={libraryPageHref(listQuery(), currentPage() - 1)}
                    >
                      Previous
                    </a>
                  </Show>
                  <Show when={currentPage() < pages()}>
                    <a
                      class="ui-button inline-flex min-h-11"
                      data-variant="secondary"
                      href={libraryPageHref(listQuery(), currentPage() + 1)}
                    >
                      Next
                    </a>
                  </Show>
                </div>
              </nav>
              </Show>
            )}
          </Show>
        </Match>
      </Switch>
    </div>
  );
}