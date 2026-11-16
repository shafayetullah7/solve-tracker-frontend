import type {
  createProblemsApi,
  ProblemResponse,
} from "../api/modules/problems.api";
import { DASHBOARD_LIST_QUERIES } from "./dashboard-queries";

export type DashboardPreviews = {
  /** From GET /problems untagged meta.total (progress has no untagged count). */
  untaggedTotal: number;
  focus: ProblemResponse[];
  recentAdded: ProblemResponse[];
  recentSolved: ProblemResponse[];
};

type ProblemsApi = ReturnType<typeof createProblemsApi>;

export async function loadDashboardPreviews(
  api: ProblemsApi,
  signal?: AbortSignal,
): Promise<DashboardPreviews> {
  const [untagged, focus, recentAdded, recentSolved] = await Promise.all([
    api.list(DASHBOARD_LIST_QUERIES.untaggedCount, signal),
    api.list(DASHBOARD_LIST_QUERIES.focusQueue, signal),
    api.list(DASHBOARD_LIST_QUERIES.recentAdded, signal),
    api.list(DASHBOARD_LIST_QUERIES.recentSolved, signal),
  ]);

  return {
    untaggedTotal: untagged.meta.total,
    focus: focus.items,
    recentAdded: recentAdded.items,
    recentSolved: recentSolved.items,
  };
}