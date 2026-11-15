import { createEffect, createSignal, For, Show } from "solid-js";
import type { ListProblemsQuery } from "../../lib/api/modules/problems.api";
import type { TopicResponse } from "../../lib/api/modules/topics.api";
import {
  DEFAULT_BROWSE_QUERY,
  parseBrowseSearch,
} from "../../lib/problems/browse-query";
import { toggleTopicId } from "../../lib/problems/form-state";
import { PLATFORM_FILTER_OPTIONS } from "../../lib/problems/platform-display";
import { Button } from "../ui/Button";

type ProblemBrowseToolbarProps = {
  searchKey: string;
  topics: () => TopicResponse[];
  topicsLoading: () => boolean;
  topicsTruncated: () => boolean;
  clearHref: string;
  onApply: (query: ListProblemsQuery) => void;
};

export function ProblemBrowseToolbar(props: ProblemBrowseToolbarProps) {
  const [q, setQ] = createSignal("");
  const [status, setStatus] = createSignal<"" | "unsolved" | "solved">("");
  const [platform, setPlatform] = createSignal<
    "" | "codeforces" | "leetcode" | "codechef"
  >("");
  const [selectedTopicIds, setSelectedTopicIds] = createSignal<Set<string>>(
    new Set(),
  );
  const [untagged, setUntagged] = createSignal(false);
  const [sort, setSort] = createSignal<ListProblemsQuery["sort"]>(
    DEFAULT_BROWSE_QUERY.sort,
  );
  const [order, setOrder] = createSignal<ListProblemsQuery["order"]>(
    DEFAULT_BROWSE_QUERY.order,
  );
  const [pageSize, setPageSize] = createSignal(DEFAULT_BROWSE_QUERY.pageSize);

  createEffect(
    () => props.searchKey,
    (searchKey) => {
      const parsed = parseBrowseSearch(searchKey);
      setQ(parsed.q ?? "");
      setStatus(parsed.status ?? "");
      setPlatform(parsed.platform ?? "");
      if (parsed.untagged === "true") {
        setUntagged(true);
        setSelectedTopicIds(new Set<string>());
      } else {
        setUntagged(false);
        const ids = new Set<string>();
        if (parsed.topicIds?.length) {
          for (const id of parsed.topicIds) ids.add(id);
        } else if (parsed.topicId) ids.add(parsed.topicId);
        setSelectedTopicIds(ids);
      }
      setSort(parsed.sort ?? DEFAULT_BROWSE_QUERY.sort);
      setOrder(parsed.order ?? DEFAULT_BROWSE_QUERY.order);
      setPageSize(parsed.pageSize ?? DEFAULT_BROWSE_QUERY.pageSize);
    },
  );

  function onTopicToggle(topicId: string, checked: boolean) {
    if (checked) setUntagged(false);
    setSelectedTopicIds((current) => toggleTopicId(current, topicId, checked));
  }

  function onUntaggedChange(checked: boolean) {
    setUntagged(checked);
    if (checked) setSelectedTopicIds(new Set<string>());
  }

  function applyFilters(event: Event) {
    event.preventDefault();
    const query: ListProblemsQuery = {
      page: 1,
      pageSize: pageSize(),
      sort: sort(),
      order: order(),
    };
    const trimmed = q().trim();
    if (trimmed) query.q = trimmed;
    const statusVal = status();
    if (statusVal) query.status = statusVal;
    const platformVal = platform();
    if (platformVal) query.platform = platformVal;
    if (untagged()) {
      query.untagged = "true";
    } else {
      const ids = [...selectedTopicIds()];
      if (ids.length > 0) query.topicIds = ids;
    }
    props.onApply(query);
  }

  const formId = "problem-browse-filters";

  return (
    <form class="mb-6 space-y-4" id={formId} onSubmit={applyFilters}>
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="sm:col-span-2">
          <label class="mb-2 block text-sm font-medium" for={`${formId}-q`}>
            Search
          </label>
          <input
            id={`${formId}-q`}
            class="ui-field"
            type="search"
            value={q()}
            onInput={(event) => setQ(event.currentTarget.value)}
            placeholder="Title or platform problem id"
          />
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium" for={`${formId}-status`}>
            Status
          </label>
          <select
            id={`${formId}-status`}
            class="ui-field"
            value={status()}
            onChange={(event) =>
              setStatus(event.currentTarget.value as "" | "unsolved" | "solved")
            }
          >
            <option value="">All</option>
            <option value="unsolved">Unsolved</option>
            <option value="solved">Solved</option>
          </select>
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium" for={`${formId}-platform`}>
            Platform
          </label>
          <select
            id={`${formId}-platform`}
            class="ui-field"
            value={platform()}
            onChange={(event) =>
              setPlatform(
                event.currentTarget.value as
                  | ""
                  | "codeforces"
                  | "leetcode"
                  | "codechef",
              )
            }
          >
            <option value="">All platforms</option>
            <For each={PLATFORM_FILTER_OPTIONS}>
              {(entry) => <option value={entry.slug}>{entry.label}</option>}
            </For>
          </select>
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium" for={`${formId}-sort`}>
            Sort by
          </label>
          <select
            id={`${formId}-sort`}
            class="ui-field"
            value={sort()}
            onChange={(event) =>
              setSort(event.currentTarget.value as ListProblemsQuery["sort"])
            }
          >
            <option value="createdAt">Date added</option>
            <option value="title">Title</option>
            <option value="solvedAt">Date solved</option>
          </select>
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium" for={`${formId}-order`}>
            Order
          </label>
          <select
            id={`${formId}-order`}
            class="ui-field"
            value={order()}
            onChange={(event) =>
              setOrder(event.currentTarget.value as ListProblemsQuery["order"])
            }
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium" for={`${formId}-pageSize`}>
            Per page
          </label>
          <select
            id={`${formId}-pageSize`}
            class="ui-field"
            value={String(pageSize())}
            onChange={(event) =>
              setPageSize(Number.parseInt(event.currentTarget.value, 10))
            }
          >
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      <div>
        <p class="mb-2 text-sm font-medium">Topics</p>
        <Show
          when={!props.topicsLoading()}
          fallback={<p class="text-sm text-muted">Loading topics…</p>}
        >
          <Show
            when={props.topics().length > 0}
            fallback={<p class="text-sm text-muted">No topics yet.</p>}
          >
            <ul class="space-y-2">
              <For each={props.topics()}>
                {(topic) => (
                  <li>
                    <label class="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedTopicIds().has(topic.id)}
                        disabled={untagged()}
                        onChange={(event) =>
                          onTopicToggle(topic.id, event.currentTarget.checked)
                        }
                      />
                      {topic.name}
                    </label>
                  </li>
                )}
              </For>
            </ul>
          </Show>
          <Show when={props.topicsTruncated()}>
            <p class="mt-2 text-sm text-muted">
              Showing the first 100 topics; not all may appear here.
            </p>
          </Show>
        </Show>
      </div>

      <div>
        <label class="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={untagged()}
            onChange={(event) => onUntaggedChange(event.currentTarget.checked)}
          />
          Untagged only
        </label>
      </div>

      <div class="flex flex-wrap gap-3">
        <Button type="submit">Apply filters</Button>
        <a
          class="ui-button"
          data-variant="secondary"
          href={props.clearHref}
        >
          Clear filters
        </a>
      </div>
    </form>
  );
}