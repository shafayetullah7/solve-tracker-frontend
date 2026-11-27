import type { ListGuidesQuery } from "../api/modules/learning-guides.api";
import { learningLibraryPath } from "./paths";

const STATUSES = new Set(["active", "archived"]);

export const DEFAULT_LIBRARY_QUERY: Required<
  Pick<ListGuidesQuery, "page" | "pageSize" | "status">
> = {
  page: 1,
  pageSize: 25,
  status: "active",
};

function searchParams(search: string): URLSearchParams {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  return new URLSearchParams(raw);
}

export function parseLibrarySearch(search: string): ListGuidesQuery {
  const params = searchParams(search);
  const query: ListGuidesQuery = {
    page: DEFAULT_LIBRARY_QUERY.page,
    pageSize: DEFAULT_LIBRARY_QUERY.pageSize,
    status: DEFAULT_LIBRARY_QUERY.status,
  };

  const pageRaw = params.get("page");
  if (pageRaw) {
    const page = Number.parseInt(pageRaw, 10);
    if (Number.isInteger(page) && page >= 1 && page <= 10000) query.page = page;
  }

  const pageSizeRaw = params.get("pageSize");
  if (pageSizeRaw) {
    const pageSize = Number.parseInt(pageSizeRaw, 10);
    if (Number.isInteger(pageSize) && pageSize >= 1 && pageSize <= 100)
      query.pageSize = pageSize;
  }

  const status = params.get("status");
  if (status && STATUSES.has(status)) {
    query.status = status as "active" | "archived";
  }

  const searchTerm = params.get("search")?.trim();
  if (searchTerm) query.search = searchTerm.slice(0, 200);

  return query;
}

export function buildLibrarySearchQuery(query: ListGuidesQuery): string {
  const params = new URLSearchParams();
  const page = query.page ?? DEFAULT_LIBRARY_QUERY.page;
  const pageSize = query.pageSize ?? DEFAULT_LIBRARY_QUERY.pageSize;
  const status = query.status ?? DEFAULT_LIBRARY_QUERY.status;

  if (page !== DEFAULT_LIBRARY_QUERY.page) params.set("page", String(page));
  if (pageSize !== DEFAULT_LIBRARY_QUERY.pageSize)
    params.set("pageSize", String(pageSize));
  if (status !== DEFAULT_LIBRARY_QUERY.status) params.set("status", status);
  if (query.search?.trim()) params.set("search", query.search.trim());

  return params.toString();
}

export function libraryHref(query: ListGuidesQuery): string {
  const qs = buildLibrarySearchQuery(query);
  return qs ? `${learningLibraryPath()}?${qs}` : learningLibraryPath();
}

export function libraryTabHref(
  status: "active" | "archived",
  current: ListGuidesQuery,
): string {
  return libraryHref({
    ...current,
    status,
    page: 1,
    search: current.search,
  });
}

export function libraryPageHref(current: ListGuidesQuery, page: number): string {
  return libraryHref({ ...current, page });
}

export function librarySearchHref(
  current: ListGuidesQuery,
  search: string | undefined,
): string {
  const trimmed = search?.trim();
  return libraryHref({
    ...current,
    page: 1,
    search: trimmed ? trimmed : undefined,
  });
}

export function hasLibraryFilters(search: string): boolean {
  const q = parseLibrarySearch(search);
  if (q.search?.trim()) return true;
  if (q.status !== DEFAULT_LIBRARY_QUERY.status) return true;
  if ((q.page ?? 1) !== 1) return true;
  if ((q.pageSize ?? 25) !== DEFAULT_LIBRARY_QUERY.pageSize) return true;
  return false;
}