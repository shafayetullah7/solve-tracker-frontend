import { describe, expect, test, vi } from "vitest";
import { loadDashboardPreviews } from "./load-dashboard-previews";
import { DASHBOARD_LIST_QUERIES } from "./dashboard-queries";

const problem = {
  id: "11111111-1111-4111-8111-111111111111",
  title: "A",
  url: "https://leetcode.com/problems/a/",
  platformProblemId: null,
  difficulty: null,
  rating: null,
  notes: null,
  status: "unsolved" as const,
  solvedAt: null,
  topics: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("loadDashboardPreviews", () => {
  test("fetches four presets and maps totals and items", async () => {
    const list = vi
      .fn()
      .mockResolvedValueOnce({ items: [], meta: { page: 1, pageSize: 1, total: 3 } })
      .mockResolvedValueOnce({
        items: [problem],
        meta: { page: 1, pageSize: 5, total: 1 },
      })
      .mockResolvedValueOnce({ items: [], meta: { page: 1, pageSize: 5, total: 0 } })
      .mockResolvedValueOnce({ items: [], meta: { page: 1, pageSize: 5, total: 0 } });

    const result = await loadDashboardPreviews(
      { list } as unknown as Parameters<typeof loadDashboardPreviews>[0],
    );

    expect(result).toEqual({
      untaggedTotal: 3,
      focus: [problem],
      recentAdded: [],
      recentSolved: [],
    });

    expect(list).toHaveBeenCalledTimes(4);
    expect(list.mock.calls[0][0]).toEqual(DASHBOARD_LIST_QUERIES.untaggedCount);
    expect(list.mock.calls[1][0]).toEqual(DASHBOARD_LIST_QUERIES.focusQueue);
    expect(list.mock.calls[2][0]).toEqual(DASHBOARD_LIST_QUERIES.recentAdded);
    expect(list.mock.calls[3][0]).toEqual(DASHBOARD_LIST_QUERIES.recentSolved);
  });
});