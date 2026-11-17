import { describe, expect, test } from "vitest";
import {
  platformLabelForStoredSlug,
  platformLabelFromUrl,
  platformPreviewFromUrl,
} from "./platform-display";

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
    expect(platformLabelFromUrl("https://www.hackerrank.com/challenges/solve-me-first")).toBe(
      "HackerRank",
    );
  });

  test("falls back for unknown hosts", () => {
    expect(platformLabelFromUrl("https://example.com/p")).toBe("example.com");
    expect(platformLabelFromUrl("not-a-url")).toBe("Other");
  });
});

describe("platformLabelForStoredSlug", () => {
  test("maps API slug values", () => {
    expect(platformLabelForStoredSlug("leetcode")).toBe("LeetCode");
    expect(platformLabelForStoredSlug("other")).toBe("Other");
  });
});

describe("platformPreviewFromUrl", () => {
  test("detects catalog host", () => {
    expect(
      platformPreviewFromUrl("https://leetcode.com/problems/two-sum/"),
    ).toEqual({ slug: "leetcode", label: "LeetCode" });
  });

  test("maps unknown host to other", () => {
    expect(platformPreviewFromUrl("https://example.com/p")).toEqual({
      slug: "other",
      label: "Other",
    });
  });

  test("prompts when url empty", () => {
    expect(platformPreviewFromUrl("  ")).toEqual({
      slug: "other",
      label: "Enter a URL to detect the judge.",
    });
  });
});