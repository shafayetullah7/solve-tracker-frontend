import { describe, expect, test } from "vitest";
import { dashboardSyncLabel } from "./dashboard-sync-label";

describe("dashboardSyncLabel", () => {
  test("empty platforms", () => {
    expect(dashboardSyncLabel([])).toBe("No platforms in library yet");
  });

  test("lists up to two names", () => {
    expect(
      dashboardSyncLabel([
        { slug: "leetcode", name: "LeetCode", solved: 1, unsolved: 2, total: 3 },
        { slug: "codeforces", name: "Codeforces", solved: 0, unsolved: 1, total: 1 },
      ]),
    ).toBe("Platforms: LeetCode & Codeforces");
  });

  test("truncates with +N when more than two", () => {
    expect(
      dashboardSyncLabel([
        { slug: "leetcode", name: "LeetCode", solved: 0, unsolved: 0, total: 0 },
        { slug: "codeforces", name: "Codeforces", solved: 0, unsolved: 0, total: 0 },
        { slug: "kattis", name: "Kattis", solved: 0, unsolved: 0, total: 0 },
      ]),
    ).toBe("Platforms: LeetCode & Codeforces +1");
  });
});