import { describe, expect, test } from "vitest";
import { mockPlatformFilterOptions } from "../platforms/catalog-fixture";
import {
  browseHrefOmitting,
  buildBrowseActiveChips,
} from "./browse-active-filters";
import { parseBrowseSearch } from "./browse-query";

const topicA = "11111111-1111-4111-8111-111111111111";
const topicNames = new Map([[topicA, "Arrays"]]);
const platformOptions = mockPlatformFilterOptions;

describe("browse-active-filters", () => {
  test("builds chips for combined q, platform, status", () => {
    const search = "?q=two&platform=leetcode&status=unsolved";
    const chips = buildBrowseActiveChips(search, topicNames, platformOptions);
    expect(chips.map((c) => c.label)).toEqual([
      'Search: "two"',
      "Status: Unsolved",
      "Platform: LeetCode",
    ]);
  });

  test("browseHrefOmitting removes q only", () => {
    const query = parseBrowseSearch(
      "?q=Binary&platform=leetcode&status=unsolved",
    );
    const href = browseHrefOmitting(query, "q");
    expect(href.startsWith("/app/problems?")).toBe(true);
    expect(parseBrowseSearch(href.slice(href.indexOf("?")))).toMatchObject({
      platform: "leetcode",
      status: "unsolved",
    });
    expect(parseBrowseSearch(href.slice(href.indexOf("?"))).q).toBeUndefined();
  });

  test("topic chip uses name from map", () => {
    const chips = buildBrowseActiveChips(
      `?topicId=${topicA}`,
      topicNames,
      platformOptions,
    );
    expect(chips).toHaveLength(1);
    expect(chips[0]!.label).toBe("Topic: Arrays");
    expect(chips[0]!.href).toBe("/app/problems");
  });
});