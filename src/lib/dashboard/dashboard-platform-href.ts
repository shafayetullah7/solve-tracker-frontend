import type { PlatformProgress } from "../api/modules/progress.api";
import type { ListProblemsQuery } from "../api/modules/problems.api";
import { browseClearHref, DEFAULT_BROWSE_QUERY } from "../problems/browse-query";
import { problemsBrowseHref } from "../problems/paths";
import { isPlatformSlug } from "../platforms/catalog";

export function dashboardPlatformBrowseHref(row: PlatformProgress): string {
  if (row.slug === "other" || !isPlatformSlug(row.slug)) {
    return browseClearHref();
  }
  const query: ListProblemsQuery = {
    ...DEFAULT_BROWSE_QUERY,
    platform: row.slug,
  };
  return problemsBrowseHref(query);
}