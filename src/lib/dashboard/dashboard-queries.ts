import type { ListProblemsQuery } from "../api/modules/problems.api";
import { DEFAULT_BROWSE_QUERY } from "../problems/browse-query";
import { problemsBrowseHref } from "../problems/paths";

const PREVIEW_PAGE_SIZE = 5;

/** List presets for dashboard preview fetches (not for count-only calls). */
export const DASHBOARD_LIST_QUERIES = {
  untaggedCount: {
    untagged: "true",
    page: 1,
    pageSize: 1,
  },
  focusQueue: {
    status: "unsolved",
    sort: "createdAt",
    order: "asc",
    page: 1,
    pageSize: PREVIEW_PAGE_SIZE,
  },
  recentAdded: {
    sort: "createdAt",
    order: "desc",
    page: 1,
    pageSize: PREVIEW_PAGE_SIZE,
  },
  recentSolved: {
    status: "solved",
    sort: "solvedAt",
    order: "desc",
    page: 1,
    pageSize: PREVIEW_PAGE_SIZE,
  },
} as const satisfies Record<string, ListProblemsQuery>;

export type DashboardListQueryKey = keyof typeof DASHBOARD_LIST_QUERIES;

/** Browse URL for a preset — navigation uses library default page size, not preview cap. */
export function dashboardBrowseHref(
  key: Exclude<DashboardListQueryKey, "untaggedCount">,
): string;
export function dashboardBrowseHref(key: "untaggedCount"): string;
export function dashboardBrowseHref(key: DashboardListQueryKey): string {
  const preset = DASHBOARD_LIST_QUERIES[key];
  const browse: ListProblemsQuery = {
    page: 1,
    pageSize: DEFAULT_BROWSE_QUERY.pageSize,
    sort: "sort" in preset ? preset.sort : DEFAULT_BROWSE_QUERY.sort,
    order: "order" in preset ? preset.order : DEFAULT_BROWSE_QUERY.order,
  };
  if ("status" in preset && preset.status) browse.status = preset.status;
  if ("untagged" in preset && preset.untagged) browse.untagged = preset.untagged;
  return problemsBrowseHref(browse);
}

export const DASHBOARD_UNSOLVED_BROWSE_HREF = problemsBrowseHref({
  status: "unsolved",
  page: 1,
  pageSize: DEFAULT_BROWSE_QUERY.pageSize,
  sort: DEFAULT_BROWSE_QUERY.sort,
  order: DEFAULT_BROWSE_QUERY.order,
});

export const DASHBOARD_UNTAGGED_BROWSE_HREF = problemsBrowseHref({
  untagged: "true",
  page: 1,
  pageSize: DEFAULT_BROWSE_QUERY.pageSize,
  sort: DEFAULT_BROWSE_QUERY.sort,
  order: DEFAULT_BROWSE_QUERY.order,
});