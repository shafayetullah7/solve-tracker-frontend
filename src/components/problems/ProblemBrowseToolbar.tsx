/**
 * Library browse controls. Changes apply immediately (debounced search).
 * URL is source of truth; `searchKey` resyncs local fields on navigation.
 */
import { createEffect, createMemo, createSignal, For, onCleanup, Show } from "solid-js";
import type { ListProblemsQuery } from "../../lib/api/modules/problems.api";
import type { TopicResponse } from "../../lib/api/modules/topics.api";
import { browseOrderOptions } from "../../lib/problems/browse-order-labels";
import {
  buildListQueryFromToolbar,
  fieldsFromBrowseSearch,
  toolbarDiffersFromSearch,
  type BrowseStatusFilter,
} from "../../lib/problems/browse-toolbar-state";
import { toggleTopicId } from "../../lib/problems/form-state";
import { hasAdvancedBrowseFilters } from "../../lib/problems/browse-query";
import {
  usePlatformCatalog,
  usePlatformFilterOptions,
} from "../../lib/platforms/platform-catalog-context";

const ADVANCED_EXPANDED_STORAGE_KEY =
  "practice.problems.browseAdvancedFiltersExpanded";

function readAdvancedExpandedPreference(): boolean | undefined {
  try {
    const stored = sessionStorage.getItem(ADVANCED_EXPANDED_STORAGE_KEY);
    if (stored === "1") return true;
    if (stored === "0") return false;
  } catch {
    /* private mode */
  }
  return undefined;
}

function writeAdvancedExpandedPreference(expanded: boolean) {
  try {
    sessionStorage.setItem(ADVANCED_EXPANDED_STORAGE_KEY, expanded ? "1" : "0");
  } catch {
    /* private mode */
  }
}

type ProblemBrowseToolbarProps = {
  searchKey: string;
  topics: () => TopicResponse[];
  topicsLoading: () => boolean;
  topicsTruncated: () => boolean;
  clearHref: string;
  onApply: (query: ListProblemsQuery) => void;
};

const FIELD = "ui-field min-h-10 w-full py-2 text-label";
const ADVANCED_TOGGLE =
  "ui-field flex size-[2.75rem] shrink-0 items-center justify-center !p-0 text-muted transition-transform hover:bg-surface-muted";
const SEARCH_DEBOUNCE_MS = 400;

type LegendProps = { children: string };

function FieldLegend(props: LegendProps) {
  return (
    <legend class="mb-1.5 block text-caption font-medium text-muted">
      {props.children}
    </legend>
  );
}

export function ProblemBrowseToolbar(props: ProblemBrowseToolbarProps) {
  const catalog = usePlatformCatalog();
  const platformFilterOptions = usePlatformFilterOptions();
  const [q, setQ] = createSignal("");
  const [status, setStatus] = createSignal<BrowseStatusFilter>("");
  const [platform, setPlatform] = createSignal<
    "" | NonNullable<ListProblemsQuery["platform"]>
  >("");
  const [selectedTopicIds, setSelectedTopicIds] = createSignal<Set<string>>(
    new Set(),
  );
  const [untagged, setUntagged] = createSignal(false);
  const [sort, setSort] = createSignal<
    NonNullable<ListProblemsQuery["sort"]>
  >("createdAt");
  const [order, setOrder] = createSignal<
    NonNullable<ListProblemsQuery["order"]>
  >("desc");
  const [pageSize, setPageSize] = createSignal(25);
  const [searchPending, setSearchPending] = createSignal(false);
  const [advancedOpen, setAdvancedOpen] = createSignal(
    readAdvancedExpandedPreference() ??
      hasAdvancedBrowseFilters(props.searchKey),
  );

  const orderLabels = createMemo(() => browseOrderOptions(sort()));

  function toggleAdvanced() {
    setAdvancedOpen((open) => {
      const next = !open;
      writeAdvancedExpandedPreference(next);
      return next;
    });
  }

  const toolbarFields = () => ({
    q: q(),
    status: status(),
    platform: platform(),
    selectedTopicIds: selectedTopicIds(),
    untagged: untagged(),
    sort: sort(),
    order: order(),
    pageSize: pageSize(),
  });

  createEffect(
    () => props.searchKey,
    (searchKey) => {
      const fields = fieldsFromBrowseSearch(searchKey);
      setQ(fields.q);
      setStatus(fields.status);
      setPlatform(fields.platform);
      setSelectedTopicIds(new Set(fields.selectedTopicIds));
      setUntagged(fields.untagged);
      setSort(fields.sort);
      setOrder(fields.order);
      setPageSize(fields.pageSize);
      setSearchPending(false);
    },
  );

  function pushToolbarToUrl() {
    const query = buildListQueryFromToolbar(toolbarFields());
    props.onApply(query);
  }

  function applyIfChanged() {
    if (!toolbarDiffersFromSearch(toolbarFields(), props.searchKey)) return;
    pushToolbarToUrl();
  }

  createEffect(
    () => [props.searchKey, q()] as const,
    ([searchKey, queryValue]) => {
      const value = queryValue.trim();
      const appliedQ = (fieldsFromBrowseSearch(searchKey).q ?? "").trim();
      if (value === appliedQ) {
        setSearchPending(false);
        return;
      }
      setSearchPending(true);
      const timer = setTimeout(() => {
        setSearchPending(false);
        applyIfChanged();
      }, SEARCH_DEBOUNCE_MS);
      onCleanup(() => clearTimeout(timer));
    },
  );

  function onTopicToggle(topicId: string, checked: boolean) {
    if (checked) setUntagged(false);
    setSelectedTopicIds((current) => toggleTopicId(current, topicId, checked));
    queueMicrotask(() => applyIfChanged());
  }

  function onUntaggedChange(checked: boolean) {
    setUntagged(checked);
    if (checked) setSelectedTopicIds(new Set<string>());
    queueMicrotask(() => applyIfChanged());
  }

  function onSearchSubmit(event: Event) {
    event.preventDefault();
    setSearchPending(false);
    applyIfChanged();
  }

  const formId = "problem-browse-filters";
  const advancedPanelId = `${formId}-advanced`;

  return (
    <form
      id={formId}
      class="space-y-2"
      onSubmit={onSearchSubmit}
      aria-describedby={
        advancedOpen() ? `${formId}-hint` : undefined
      }
    >
      <fieldset class="min-w-0 border-0 p-0">
        <FieldLegend>Filter problems</FieldLegend>
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-12 md:items-end">
          <input
            id={`${formId}-q`}
            class={`${FIELD} sm:col-span-2 md:col-span-5`}
            type="search"
            value={q()}
            aria-label="Search title or platform problem id"
            placeholder="Search title or platform id…"
            onInput={(event) => setQ(event.currentTarget.value)}
          />

          <select
            id={`${formId}-status`}
            class={`${FIELD} md:col-span-3`}
            value={status()}
            aria-label="Status"
            onChange={(event) => {
              setStatus(event.currentTarget.value as BrowseStatusFilter);
              queueMicrotask(() => applyIfChanged());
            }}
          >
            <option value="">Any status</option>
            <option value="unsolved">Unsolved</option>
            <option value="solved">Solved</option>
          </select>

          <select
            id={`${formId}-platform`}
            class={`${FIELD} md:col-span-3`}
            value={platform()}
            aria-label="Platform"
            title="Filters by stored platform on each problem"
            disabled={catalog.status() === "loading"}
            onChange={(event) => {
              setPlatform(
                event.currentTarget.value as
                  | ""
                  | NonNullable<ListProblemsQuery["platform"]>,
              );
              queueMicrotask(() => applyIfChanged());
            }}
          >
            <option value="">Any platform</option>
            <Show when={catalog.status() !== "ready"}>
              <option value="" disabled>
                Loading platforms…
              </option>
            </Show>
            <For each={platformFilterOptions()}>
              {(entry) => <option value={entry.slug}>{entry.label}</option>}
            </For>
          </select>

          <button
            type="button"
            class={`${ADVANCED_TOGGLE} sm:col-span-2 sm:justify-self-end md:col-span-1 md:justify-self-end`}
            aria-expanded={advancedOpen() ? "true" : "false"}
            aria-controls={advancedPanelId}
            aria-label={
              advancedOpen()
                ? "Hide sort and topic filters"
                : "Show sort and topic filters"
            }
            onClick={toggleAdvanced}
          >
            <span
              aria-hidden="true"
              class={[
                "inline-block text-lg leading-none",
                advancedOpen() && "rotate-180",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              ▾
            </span>
          </button>
        </div>
        <Show when={catalog.status() === "error"}>
          <p class="mt-2 text-caption text-muted">
            Could not load platform list.{" "}
            <button
              type="button"
              class="text-brand underline-offset-4 hover:underline"
              onClick={() => void catalog.reloadCatalog()}
            >
              Try again
            </button>
          </p>
        </Show>
      </fieldset>

      <Show when={searchPending()}>
        <p class="text-caption text-muted" role="status">
          Updating search…
        </p>
      </Show>

      <Show when={advancedOpen()}>
        <div
          id={advancedPanelId}
          class="space-y-3 border-t border-line pt-3"
        >
          <p id={`${formId}-hint`} class="text-caption text-muted">
            Filters and display update as you change them. Search waits briefly
            after you stop typing.
          </p>

      <fieldset class="min-w-0 border-0 p-0">
        <FieldLegend>Sort &amp; display</FieldLegend>
        <div class="grid grid-cols-2 gap-2 md:grid-cols-12 md:items-center">
          <select
            id={`${formId}-sort`}
            class={`${FIELD} col-span-1 md:col-span-4`}
            value={sort()}
            aria-label="Sort by"
            onChange={(event) => {
              setSort(
                event.currentTarget.value as NonNullable<
                  ListProblemsQuery["sort"]
                >,
              );
              queueMicrotask(() => applyIfChanged());
            }}
          >
            <option value="createdAt">Date added</option>
            <option value="title">Title</option>
            <option value="solvedAt">Date solved</option>
          </select>

          <select
            id={`${formId}-order`}
            class={`${FIELD} col-span-1 md:col-span-4`}
            value={order()}
            aria-label="Sort order"
            onChange={(event) => {
              setOrder(
                event.currentTarget.value as NonNullable<
                  ListProblemsQuery["order"]
                >,
              );
              queueMicrotask(() => applyIfChanged());
            }}
          >
            <option value="desc">{orderLabels().desc}</option>
            <option value="asc">{orderLabels().asc}</option>
          </select>

          <select
            id={`${formId}-pageSize`}
            class={`${FIELD} col-span-2 md:col-span-2`}
            value={String(pageSize())}
            aria-label="Per page"
            onChange={(event) => {
              setPageSize(Number.parseInt(event.currentTarget.value, 10));
              queueMicrotask(() => applyIfChanged());
            }}
          >
            <option value="25">25 / page</option>
            <option value="50">50 / page</option>
            <option value="100">100 / page</option>
          </select>

          <div class="col-span-2 flex flex-wrap items-center justify-start md:col-span-2 md:justify-end">
            <a
              class="ui-button min-h-10 shrink-0 px-3 text-label"
              data-variant="ghost"
              href={props.clearHref}
            >
              Clear all
            </a>
          </div>
        </div>
      </fieldset>

      <Show when={props.topicsLoading()}>
        <p class="text-caption text-muted">Loading topics…</p>
      </Show>

      <Show when={!props.topicsLoading() && props.topics().length > 0}>
        <fieldset class="min-w-0 border-0 p-0">
          <FieldLegend>Topics</FieldLegend>
          <p class="mb-1.5 text-caption text-muted">
            Select any topics to match (OR). Turn off when using untagged only.
          </p>
          <label class="mb-2 flex min-h-10 items-center gap-2 text-label text-muted">
            <input
              type="checkbox"
              checked={untagged()}
              onChange={(event) =>
                onUntaggedChange(event.currentTarget.checked)
              }
            />
            Untagged only (excludes topic filters)
          </label>
          <div
            class="flex min-h-10 flex-wrap gap-1.5 overflow-y-auto rounded-control border border-line bg-surface-muted/30 p-1.5 md:max-h-24"
            role="group"
            aria-label="Filter by topic"
          >
            <For each={props.topics()}>
              {(topic) => (
                <label
                  class={[
                    "inline-flex cursor-pointer items-center rounded-full border border-line bg-surface px-2 py-0.5 text-caption",
                    selectedTopicIds().has(topic.id) &&
                      "border-brand bg-brand-soft text-brand",
                    untagged() && "pointer-events-none opacity-50",
                  ]}
                >
                  <input
                    type="checkbox"
                    class="sr-only"
                    checked={selectedTopicIds().has(topic.id)}
                    disabled={untagged()}
                    onChange={(event) =>
                      onTopicToggle(topic.id, event.currentTarget.checked)
                    }
                  />
                  <span class="max-w-28 truncate">{topic.name}</span>
                </label>
              )}
            </For>
          </div>
          <Show when={props.topicsTruncated()}>
            <span class="text-caption text-muted">First 100 topics.</span>
          </Show>
        </fieldset>
      </Show>

      <Show when={!props.topicsLoading() && props.topics().length === 0}>
        <label class="flex min-h-10 items-center gap-2 text-label text-muted">
          <input
            type="checkbox"
            checked={untagged()}
            onChange={(event) => onUntaggedChange(event.currentTarget.checked)}
          />
          Untagged only
        </label>
      </Show>
        </div>
      </Show>
    </form>
  );
}