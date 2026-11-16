import { describe, expect, test, vi } from "vitest";
import { createProgressApi } from "./progress.api";

const topicId = "22222222-2222-4222-8222-222222222222";

const payload = {
  overall: { total: 5, solved: 2, unsolved: 3 },
  topics: [
    {
      id: topicId,
      name: "Arrays",
      total: 2,
      solved: 1,
      unsolved: 1,
      percentComplete: 50,
    },
  ],
  platforms: [
    {
      slug: "leetcode" as const,
      name: "LeetCode",
      total: 3,
      solved: 1,
      unsolved: 2,
    },
  ],
};

describe("typed progress API", () => {
  test("getSummaries decodes and enables auth recovery", async () => {
    const request = vi.fn().mockResolvedValue(payload);
    const result = await createProgressApi({ request }).getSummaries();
    expect(result).toEqual(payload);
    expect(request).toHaveBeenCalledWith({
      path: "/progress",
      signal: undefined,
      recoverAuth: true,
    });
  });

  test("decodes empty topics array", async () => {
    const request = vi.fn().mockResolvedValue({
      overall: { total: 0, solved: 0, unsolved: 0 },
      topics: [],
      platforms: [],
    });
    await expect(createProgressApi({ request }).getSummaries()).resolves.toEqual({
      overall: { total: 0, solved: 0, unsolved: 0 },
      topics: [],
      platforms: [],
    });
  });

  test("rejects invalid progress payloads", async () => {
    await expect(
      createProgressApi({
        request: vi.fn().mockResolvedValue({ topics: [], platforms: [] }),
      }).getSummaries(),
    ).rejects.toMatchObject({ kind: "contract" });
    await expect(
      createProgressApi({
        request: vi.fn().mockResolvedValue({
          overall: { total: 1, solved: 0, unsolved: 2 },
          topics: [],
          platforms: [],
        }),
      }).getSummaries(),
    ).rejects.toMatchObject({ kind: "contract" });
    await expect(
      createProgressApi({
        request: vi.fn().mockResolvedValue({
          overall: { total: 1, solved: 0, unsolved: 1 },
          platforms: [],
          topics: [
            {
              id: topicId,
              name: "X",
              total: 1,
              solved: 0,
              unsolved: 1,
              percentComplete: "50",
            },
          ],
        }),
      }).getSummaries(),
    ).rejects.toMatchObject({ kind: "contract" });
  });

  test("getActivity decodes weekly buckets and streak", async () => {
    const activity = {
      weeks: [{ weekStart: "2026-06-08", added: 2, solved: 1 }],
      streak: { currentDays: 3, lastSolveDate: "2026-06-18" },
      timezone: "UTC" as const,
    };
    const request = vi.fn().mockResolvedValue(activity);
    const result = await createProgressApi({ request }).getActivity(12);
    expect(result).toEqual(activity);
    expect(request).toHaveBeenCalledWith({
      path: "/progress/activity",
      query: { weeks: 12 },
      signal: undefined,
      recoverAuth: true,
    });
  });
});