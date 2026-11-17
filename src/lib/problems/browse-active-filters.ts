import type { ListProblemsQuery } from "../api/modules/problems.api";
import {
  DEFAULT_BROWSE_QUERY,
  parseBrowseSearch,
  serializeBrowseSearch,
} from "./browse-query";
import { browseOrderOptionLabel } from "./browse-order-labels";
import { problemsBrowseHref } from "./paths";
import { PLATFORM_FILTER_OPTIONS } from "./platform-display";

export type BrowseFilterOmit =
  | "q"
  | "status"
  | "platform"
  | "topics"
  | "untagged"
  | "sort"
  | "order"
  | "pageSize"
  | "page";

export type BrowseFilterChip = {
  id: BrowseFilterOmit | `topic:${string}`;
  label: string;
  href: string;
  removeAriaLabel: string;
};

const STATUS_LABELS: Record<"solved" | "unsolved", string> = {
  solved: "Solved",
  unsolved: "Unsolved",
};

const SORT_LABELS: Record<NonNullable<ListProblemsQuery["sort"]>, string> = {
  createdAt: "Date added",
  title: "Title",
  solvedAt: "Date solved",
};

function platformLabel(slug: NonNullable<ListProblemsQuery["platform"]>): string {
  if (slug === "other") return "Other";
  return (
    PLATFORM_FILTER_OPTIONS.find((entry) => entry.slug === slug)?.label ?? slug
  );
}

export function browseQueryOmitting(
  query: ListProblemsQuery,
  omit: BrowseFilterOmit,
): ListProblemsQuery {
  const next: ListProblemsQuery = { ...query };
  switch (omit) {
    case "q":
      delete next.q;
      break;
    case "status":
      delete next.status;
      break;
    case "platform":
      delete next.platform;
      break;
    case "topics":
      delete next.topicId;
      delete next.topicIds;
      break;
    case "untagged":
      delete next.untagged;
      break;
    case "sort":
      next.sort = DEFAULT_BROWSE_QUERY.sort;
      break;
    case "order":
      next.order = DEFAULT_BROWSE_QUERY.order;
      break;
    case "pageSize":
      next.pageSize = DEFAULT_BROWSE_QUERY.pageSize;
      break;
    case "page":
      next.page = DEFAULT_BROWSE_QUERY.page;
      break;
  }
  return next;
}

export function browseHrefOmitting(
  query: ListProblemsQuery,
  omit: BrowseFilterOmit,
): string {
  return problemsBrowseHref(browseQueryOmitting(query, omit));
}

function chip(
  id: BrowseFilterChip["id"],
  label: string,
  href: string,
): BrowseFilterChip {
  return {
    id,
    label,
    href,
    removeAriaLabel: `Remove filter: ${label}`,
  };
}

export type BrowseActiveChipGroups = {
  filters: BrowseFilterChip[];
  view: BrowseFilterChip[];
};

export function buildBrowseActiveChipGroups(
  search: string,
  topicNameById: Map<string, string>,
): BrowseActiveChipGroups {
  const query = parseBrowseSearch(search);
  const filters: BrowseFilterChip[] = [];
  const view: BrowseFilterChip[] = [];

  if (query.q) {
    filters.push(chip("q", `Search: "${query.q}"`, browseHrefOmitting(query, "q")));
  }

  if (query.status) {
    const label = `Status: ${STATUS_LABELS[query.status]}`;
    filters.push(chip("status", label, browseHrefOmitting(query, "status")));
  }

  if (query.platform) {
    const label = `Platform: ${platformLabel(query.platform)}`;
    filters.push(chip("platform", label, browseHrefOmitting(query, "platform")));
  }

  if (query.untagged === "true") {
    filters.push(
      chip("untagged", "Untagged only", browseHrefOmitting(query, "untagged")),
    );
  } else if (query.topicIds?.length) {
    if (query.topicIds.length === 1) {
      const id = query.topicIds[0]!;
      const name = topicNameById.get(id) ?? "Topic";
      filters.push(
        chip(
          `topic:${id}`,
          `Topic: ${name}`,
          browseHrefOmitting(query, "topics"),
        ),
      );
    } else {
      filters.push(
        chip(
          "topics",
          `Topics: ${query.topicIds.length} (any match)`,
          browseHrefOmitting(query, "topics"),
        ),
      );
    }
  } else if (query.topicId) {
    const name = topicNameById.get(query.topicId) ?? "Topic";
    filters.push(
      chip(
        `topic:${query.topicId}`,
        `Topic: ${name}`,
        browseHrefOmitting(query, "topics"),
      ),
    );
  }

  const sort = query.sort ?? DEFAULT_BROWSE_QUERY.sort;
  const order = query.order ?? DEFAULT_BROWSE_QUERY.order;

  if (sort !== DEFAULT_BROWSE_QUERY.sort) {
    view.push(
      chip(
        "sort",
        `Sort: ${SORT_LABELS[sort]}`,
        browseHrefOmitting(query, "sort"),
      ),
    );
  }

  if (order !== DEFAULT_BROWSE_QUERY.order) {
    view.push(
      chip(
        "order",
        browseOrderOptionLabel(sort, order),
        browseHrefOmitting(query, "order"),
      ),
    );
  }

  const pageSize = query.pageSize ?? DEFAULT_BROWSE_QUERY.pageSize;
  if (pageSize !== DEFAULT_BROWSE_QUERY.pageSize) {
    view.push(
      chip(
        "pageSize",
        `Per page: ${pageSize}`,
        browseHrefOmitting(query, "pageSize"),
      ),
    );
  }

  const page = query.page ?? DEFAULT_BROWSE_QUERY.page;
  if (page !== DEFAULT_BROWSE_QUERY.page) {
    view.push(
      chip("page", `Page: ${page}`, browseHrefOmitting(query, "page")),
    );
  }

  return { filters, view };
}

export function buildBrowseActiveChips(
  search: string,
  topicNameById: Map<string, string>,
): BrowseFilterChip[] {
  const groups = buildBrowseActiveChipGroups(search, topicNameById);
  return [...groups.filters, ...groups.view];
}

/** Round-trip helper for tests. */
export function serializedBrowseFromSearch(search: string): string {
  return serializeBrowseSearch(parseBrowseSearch(search));
}