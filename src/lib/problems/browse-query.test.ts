import { describe, expect, test } from "vitest";
import {
  browseClearHref,
  DEFAULT_BROWSE_QUERY,
  hasActiveBrowseFilters,
  parseBrowseSearch,
  serializeBrowseSearch,
} from "./browse-query";

const topicA = "11111111-1111-4111-8111-111111111111";
const topicB = "22222222-2222-4222-8222-222222222222";

describe("browse-query", () => {
  test("defaults when search is empty", () => {
    expect(parseBrowseSearch("")).toEqual(DEFAULT_BROWSE_QUERY);
    expect(hasActiveBrowseFilters("")).toBe(false);
    expect(browseClearHref()).toBe("/problems");
  });

  test("round-trip full filter set", () => {
    const query = {
      page: 2,
      pageSize: 50,
      q: "two sum",
      status: "unsolved" as const,
      platform: "leetcode" as const,
      topicIds: [topicA, topicB],
      sort: "title" as const,
      order: "asc" as const,
    };
    const serialized = serializeBrowseSearch(query);
    expect(parseBrowseSearch(`?${serialized}`)).toMatchObject(query);
    expect(hasActiveBrowseFilters(`?${serialized}`)).toBe(true);
  });

  test("preserves legacy topicId", () => {
    const search = `?topicId=${topicA}`;
    expect(parseBrowseSearch(search)).toMatchObject({ topicId: topicA });
    expect(serializeBrowseSearch({ ...DEFAULT_BROWSE_QUERY, topicId: topicA })).toBe(
      `topicId=${topicA}`,
    );
  });

  test("repeated topicIds in URL", () => {
    const search = `?topicIds=${topicA}&topicIds=${topicB}`;
    expect(parseBrowseSearch(search).topicIds).toEqual([topicA, topicB]);
  });

  test("drops invalid topic ids", () => {
    expect(
      parseBrowseSearch(`?topicIds=bad&topicIds=${topicA}`).topicIds,
    ).toEqual([topicA]);
  });

  test("untagged true", () => {
    expect(parseBrowseSearch("?untagged=true").untagged).toBe("true");
    expect(serializeBrowseSearch({ ...DEFAULT_BROWSE_QUERY, untagged: "true" })).toBe(
      "untagged=true",
    );
  });
});