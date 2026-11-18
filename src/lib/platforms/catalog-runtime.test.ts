import { describe, expect, test } from "vitest";
import { mockPlatformEntries } from "./catalog-fixture";
import {
  platformPreviewFromUrl,
  platformSlugFromUrl,
} from "./catalog-runtime";

const fixture = mockPlatformEntries;

describe("catalog-runtime", () => {
  test("detects leetcode from URL", () => {
    expect(platformSlugFromUrl(fixture, "https://leetcode.com/problems/x")).toBe(
      "leetcode",
    );
  });

  test("detects codeforces from URL", () => {
    expect(platformSlugFromUrl(fixture, "https://codeforces.com/problemset")).toBe(
      "codeforces",
    );
  });

  test("preview uses catalog labels", () => {
    expect(
      platformPreviewFromUrl(fixture, "https://leetcode.com/problems/x"),
    ).toEqual({ slug: "leetcode", label: "LeetCode" });
  });

  test("unknown host is other", () => {
    expect(platformSlugFromUrl(fixture, "https://example.com/x")).toBeNull();
    expect(platformPreviewFromUrl(fixture, "https://example.com/x")).toEqual({
      slug: "other",
      label: "Other",
    });
  });
});