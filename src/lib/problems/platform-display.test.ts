import { describe, expect, test } from "vitest";
import { platformLabelFromUrl } from "./platform-display";

describe("platformLabelFromUrl", () => {
  test("recognizes seeded platform hosts", () => {
    expect(platformLabelFromUrl("https://leetcode.com/problems/two-sum/")).toBe(
      "LeetCode",
    );
    expect(platformLabelFromUrl("https://codeforces.com/problemset/problem/1/A")).toBe(
      "Codeforces",
    );
    expect(platformLabelFromUrl("https://www.codechef.com/problems/TEST")).toBe(
      "CodeChef",
    );
  });

  test("falls back for unknown hosts", () => {
    expect(platformLabelFromUrl("https://example.com/p")).toBe("example.com");
    expect(platformLabelFromUrl("not-a-url")).toBe("Other");
  });
});