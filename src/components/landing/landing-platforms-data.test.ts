import { describe, expect, test } from "vitest";
import type { PlatformCatalogItem } from "../../lib/api/modules/platforms.api";
import { resolveAllPlatforms } from "./landing-platforms-data";

function item(
  partial: Pick<PlatformCatalogItem, "slug" | "name"> &
    Partial<PlatformCatalogItem>,
): PlatformCatalogItem {
  return {
    baseUrl: `https://example.com/${partial.slug}`,
    urlHosts: [`${partial.slug}.example`],
    ...partial,
  };
}

describe("landing-platforms-data", () => {
  test("resolveAllPlatforms returns empty when no entries", () => {
    expect(resolveAllPlatforms(undefined)).toEqual([]);
    expect(resolveAllPlatforms([])).toEqual([]);
  });

  test("resolveAllPlatforms sorts by name and maps fields", () => {
    const entries = [
      item({ slug: "spoj", name: "SPOJ" }),
      item({ slug: "leetcode", name: "LeetCode" }),
      item({ slug: "cses", name: "CSES" }),
    ];
    const result = resolveAllPlatforms(entries);
    expect(result.map((r) => r.name)).toEqual(["CSES", "LeetCode", "SPOJ"]);
    expect(result[1]).toEqual({
      slug: "leetcode",
      name: "LeetCode",
      baseUrl: entries[1].baseUrl,
    });
  });
});