import type { ListPublicProblemsQuery } from "../api/modules/people.api";
import { isStoredPlatformSlug } from "../platforms/platform-slugs";

const STATUSES = new Set(["solved", "unsolved"]);

export const DEFAULT_PUBLIC_TOPIC_QUERY: Required<
  Pick<ListPublicProblemsQuery, "page" | "pageSize">
> = {
  page: 1,
  pageSize: 50,
};

function searchParams(search: string): URLSearchParams {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  return new URLSearchParams(raw);
}

export function parsePublicTopicSearch(search: string): ListPublicProblemsQuery {
  const params = searchParams(search);
  const query: ListPublicProblemsQuery = { ...DEFAULT_PUBLIC_TOPIC_QUERY };

  const pageRaw = params.get("page");
  if (pageRaw) {
    const page = Number.parseInt(pageRaw, 10);
    if (Number.isInteger(page) && page >= 1) query.page = page;
  }

  const status = params.get("status");
  if (status && STATUSES.has(status)) {
    query.status = status as ListPublicProblemsQuery["status"];
  }

  const platform = params.get("platform");
  if (platform && isStoredPlatformSlug(platform)) {
    query.platform = platform;
  }

  return query;
}

export function stringifyPublicTopicQuery(
  query: ListPublicProblemsQuery,
): string {
  const params = new URLSearchParams();
  if (query.page && query.page !== 1) params.set("page", String(query.page));
  if (query.pageSize && query.pageSize !== DEFAULT_PUBLIC_TOPIC_QUERY.pageSize) {
    params.set("pageSize", String(query.pageSize));
  }
  if (query.status) params.set("status", query.status);
  if (query.platform) params.set("platform", query.platform);
  const built = params.toString();
  return built ? `?${built}` : "";
}