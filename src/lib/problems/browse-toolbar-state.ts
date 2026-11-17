import type { ListProblemsQuery } from "../api/modules/problems.api";
import {
  DEFAULT_BROWSE_QUERY,
  parseBrowseSearch,
  serializeBrowseSearch,
} from "./browse-query";

export type BrowseStatusFilter = "" | "unsolved" | "solved";

export type BrowseToolbarFields = {
  q: string;
  status: BrowseStatusFilter;
  platform: "" | NonNullable<ListProblemsQuery["platform"]>;
  selectedTopicIds: ReadonlySet<string>;
  untagged: boolean;
  sort: NonNullable<ListProblemsQuery["sort"]>;
  order: NonNullable<ListProblemsQuery["order"]>;
  pageSize: number;
};

export function buildListQueryFromToolbar(
  fields: BrowseToolbarFields,
): ListProblemsQuery {
  const query: ListProblemsQuery = {
    page: 1,
    pageSize: fields.pageSize,
    sort: fields.sort,
    order: fields.order,
  };
  const trimmed = fields.q.trim();
  if (trimmed) query.q = trimmed;
  if (fields.status) query.status = fields.status;
  if (fields.platform) query.platform = fields.platform;
  if (fields.untagged) {
    query.untagged = "true";
  } else {
    const ids = [...fields.selectedTopicIds];
    if (ids.length > 0) query.topicIds = ids;
  }
  return query;
}

/** True when toolbar fields would change list filters/sort (ignores `page`). */
export function toolbarDiffersFromSearch(
  fields: BrowseToolbarFields,
  searchKey: string,
): boolean {
  const next = serializeBrowseSearch(buildListQueryFromToolbar(fields));
  const current = parseBrowseSearch(searchKey);
  const currentNorm = serializeBrowseSearch({ ...current, page: 1 });
  return next !== currentNorm;
}

export function fieldsFromBrowseSearch(searchKey: string): BrowseToolbarFields {
  const parsed = parseBrowseSearch(searchKey);
  const ids = new Set<string>();
  if (parsed.untagged !== "true") {
    if (parsed.topicIds?.length) {
      for (const id of parsed.topicIds) ids.add(id);
    } else if (parsed.topicId) ids.add(parsed.topicId);
  }
  return {
    q: parsed.q ?? "",
    status: parsed.status ?? "",
    platform: parsed.platform ?? "",
    selectedTopicIds: ids,
    untagged: parsed.untagged === "true",
    sort: parsed.sort ?? DEFAULT_BROWSE_QUERY.sort,
    order: parsed.order ?? DEFAULT_BROWSE_QUERY.order,
    pageSize: parsed.pageSize ?? DEFAULT_BROWSE_QUERY.pageSize,
  };
}