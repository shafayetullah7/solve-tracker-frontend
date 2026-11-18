import { describe, expect, test } from "vitest";
import { parsePublicTopicSearch, stringifyPublicTopicQuery } from "./public-topic-query";

describe("public-topic-query", () => {
  test("defaults page size to 50", () => {
    expect(parsePublicTopicSearch("")).toEqual({ page: 1, pageSize: 50 });
  });

  test("round-trips filters", () => {
    const q = parsePublicTopicSearch("?status=solved&platform=leetcode&page=2");
    expect(q.status).toBe("solved");
    expect(q.platform).toBe("leetcode");
    expect(stringifyPublicTopicQuery(q)).toContain("status=solved");
  });
});