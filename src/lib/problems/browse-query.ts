import { appProblems } from "../app/product-routes";
import type { ListProblemsQuery } from "../api/modules/problems.api";
import { isStoredPlatformSlug } from "../platforms/platform-slugs";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const STATUSES = new Set(["solved", "unsolved"]);
const SORTS = new Set(["title", "createdAt", "solvedAt"]);
const ORDERS = new Set(["asc", "desc"]);
const PAGE_SIZES = new Set([25, 50, 100]);

function isBrowsePlatformFilter(
  value: string,
): value is NonNullable<ListProblemsQuery["platform"]> {
  return isStoredPlatformSlug(value);
}

export const DEFAULT_BROWSE_QUERY: Required<
  Pick<ListProblemsQuery, "page" | "pageSize" | "sort" | "order">
> = {
  page: 1,
  pageSize: 25,
  sort: "createdAt",
  order: "desc",
};

export function browseClearHref(): string {
  return appProblems();
}

function searchParams(search: string): URLSearchParams {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  return new URLSearchParams(raw);
}

export function parseBrowseSearch(search: string): ListProblemsQuery {
  const params = searchParams(search);
  const query: ListProblemsQuery = {
    page: DEFAULT_BROWSE_QUERY.page,
    pageSize: DEFAULT_BROWSE_QUERY.pageSize,
    sort: DEFAULT_BROWSE_QUERY.sort,
    order: DEFAULT_BROWSE_QUERY.order,
  };

  const pageRaw = params.get("page");
  if (pageRaw) {
    const page = Number.parseInt(pageRaw, 10);
    if (Number.isInteger(page) && page >= 1) query.page = page;
  }

  const pageSizeRaw = params.get("pageSize");
  if (pageSizeRaw) {
    const pageSize = Number.parseInt(pageSizeRaw, 10);
    if (PAGE_SIZES.has(pageSize)) query.pageSize = pageSize;
  }

  const q = params.get("q");
  if (q?.trim()) query.q = q.trim();

  const status = params.get("status");
  if (status && STATUSES.has(status)) query.status = status as "solved" | "unsolved";

  const platform = params.get("platform");
  if (platform && isBrowsePlatformFilter(platform)) query.platform = platform;

  const topicIds = params
    .getAll("topicIds")
    .filter((id) => UUID.test(id));
  const uniqueTopicIds = [...new Set(topicIds)];
  if (uniqueTopicIds.length > 0) query.topicIds = uniqueTopicIds;

  const topicId = params.get("topicId");
  if (topicId && UUID.test(topicId) && uniqueTopicIds.length === 0)
    query.topicId = topicId;

  if (params.get("untagged") === "true") query.untagged = "true";

  const sort = params.get("sort");
  if (sort && SORTS.has(sort))
    query.sort = sort as ListProblemsQuery["sort"];

  const order = params.get("order");
  if (order && ORDERS.has(order))
    query.order = order as ListProblemsQuery["order"];

  return query;
}

export function serializeBrowseSearch(query: ListProblemsQuery): string {
  const params = new URLSearchParams();

  const page = query.page ?? DEFAULT_BROWSE_QUERY.page;
  const pageSize = query.pageSize ?? DEFAULT_BROWSE_QUERY.pageSize;
  const sort = query.sort ?? DEFAULT_BROWSE_QUERY.sort;
  const order = query.order ?? DEFAULT_BROWSE_QUERY.order;

  if (page !== DEFAULT_BROWSE_QUERY.page) params.set("page", String(page));
  if (pageSize !== DEFAULT_BROWSE_QUERY.pageSize)
    params.set("pageSize", String(pageSize));

  if (query.q) params.set("q", query.q);
  if (query.status) params.set("status", query.status);
  if (query.platform) params.set("platform", query.platform);

  if (query.untagged === "true") {
    params.set("untagged", "true");
  } else {
    if (query.topicIds?.length) {
      for (const id of query.topicIds) params.append("topicIds", id);
    } else if (query.topicId) {
      params.set("topicId", query.topicId);
    }
  }

  if (sort !== DEFAULT_BROWSE_QUERY.sort) params.set("sort", sort);
  if (order !== DEFAULT_BROWSE_QUERY.order) params.set("order", order);

  return params.toString();
}

export function hasActiveBrowseFilters(search: string): boolean {
  const params = searchParams(search);
  if (params.get("q")?.trim()) return true;
  if (params.get("status") && STATUSES.has(params.get("status")!)) return true;
  const platform = params.get("platform");
  if (platform && isBrowsePlatformFilter(platform)) return true;
  if (params.get("untagged") === "true") return true;
  if (params.get("topicId") && UUID.test(params.get("topicId")!)) return true;
  if (params.getAll("topicIds").some((id) => UUID.test(id))) return true;
  if (params.get("sort") && params.get("sort") !== DEFAULT_BROWSE_QUERY.sort)
    return true;
  if (params.get("order") && params.get("order") !== DEFAULT_BROWSE_QUERY.order)
    return true;
  if (params.get("page") && params.get("page") !== "1") return true;
  if (
    params.get("pageSize") &&
    params.get("pageSize") !== String(DEFAULT_BROWSE_QUERY.pageSize)
  )
    return true;
  return false;
}

/** Sort, topics, untagged, or page size — controls in the collapsible block. */
export function hasAdvancedBrowseFilters(search: string): boolean {
  const params = searchParams(search);
  if (params.get("untagged") === "true") return true;
  if (params.get("topicId") && UUID.test(params.get("topicId")!)) return true;
  if (params.getAll("topicIds").some((id) => UUID.test(id))) return true;
  if (params.get("sort") && params.get("sort") !== DEFAULT_BROWSE_QUERY.sort)
    return true;
  if (params.get("order") && params.get("order") !== DEFAULT_BROWSE_QUERY.order)
    return true;
  if (
    params.get("pageSize") &&
    params.get("pageSize") !== String(DEFAULT_BROWSE_QUERY.pageSize)
  )
    return true;
  return false;
}