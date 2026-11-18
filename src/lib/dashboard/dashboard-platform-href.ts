import type { PlatformProgress } from "../api/modules/progress.api";
import type { ListProblemsQuery } from "../api/modules/problems.api";
import { DEFAULT_BROWSE_QUERY } from "../problems/browse-query";
import { problemsBrowseHref } from "../problems/paths";
export function dashboardPlatformBrowseHref(row: PlatformProgress): string {
  const query: ListProblemsQuery = {
    ...DEFAULT_BROWSE_QUERY,
    platform: row.slug,
  };
  return problemsBrowseHref(query);
}