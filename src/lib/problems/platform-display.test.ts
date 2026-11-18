import { describe, expect, test } from "vitest";
import { mockPlatformEntries } from "../platforms/catalog-fixture";
import {
  platformLabelForStoredSlug,
  platformLabelFromUrl,
  platformPreviewFromUrl,
} from "../platforms/catalog-runtime";

const entries = mockPlatformEntries;

describe("platformLabelFromUrl (runtime catalog)", () => {
  test("recognizes seeded platform hosts", () => {
    expect(
      platformLabelFromUrl(entries, "https://leetcode.com/problems/two-sum/"),
    ).toBe("LeetCode");
    expect(
      platformLabelFromUrl(
        entries,
        "https://codeforces.com/problemset/problem/1/A",
      ),
    ).toBe("Codeforces");
    expect(
      platformLabelFromUrl(entries, "https://www.codechef.com/problems/TEST"),
    ).toBe("CodeChef");
    expect(
      platformLabelFromUrl(
        entries,
        "https://www.hackerrank.com/challenges/solve-me-first",
      ),
    ).toBe("HackerRank");
  });

  test("falls back for unknown hosts", () => {
    expect(platformLabelFromUrl(entries, "https://example.com/p")).toBe(
      "example.com",
    );
    expect(platformLabelFromUrl(entries, "not-a-url")).toBe("Other");
  });
});

describe("platformLabelForStoredSlug (runtime catalog)", () => {
  test("maps API slug values", () => {
    expect(platformLabelForStoredSlug(entries, "leetcode")).toBe("LeetCode");
    expect(platformLabelForStoredSlug(entries, "other")).toBe("Other");
  });
});

describe("platformPreviewFromUrl (runtime catalog)", () => {
  test("detects catalog host", () => {
    expect(
      platformPreviewFromUrl(entries, "https://leetcode.com/problems/two-sum/"),
    ).toEqual({ slug: "leetcode", label: "LeetCode" });
  });

  test("maps unknown host to other", () => {
    expect(platformPreviewFromUrl(entries, "https://example.com/p")).toEqual({
      slug: "other",
      label: "Other",
    });
  });

  test("prompts when url empty", () => {
    expect(platformPreviewFromUrl(entries, "  ")).toEqual({
      slug: "other",
      label: "Enter a URL to detect the judge.",
    });
  });
});