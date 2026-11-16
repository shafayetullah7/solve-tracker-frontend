import { describe, expect, test } from "vitest";
import {
  buildListQueryFromToolbar,
  toolbarDiffersFromSearch,
} from "./browse-toolbar-state";

describe("browse-toolbar-state", () => {
  test("buildListQueryFromToolbar resets page", () => {
    const query = buildListQueryFromToolbar({
      q: "a",
      status: "unsolved",
      platform: "leetcode",
      selectedTopicIds: new Set(),
      untagged: false,
      sort: "createdAt",
      order: "desc",
      pageSize: 25,
    });
    expect(query).toMatchObject({
      page: 1,
      q: "a",
      status: "unsolved",
      platform: "leetcode",
    });
  });

  test("toolbarDiffersFromSearch ignores page in URL", () => {
    const fields = {
      q: "",
      status: "" as const,
      platform: "" as const,
      selectedTopicIds: new Set<string>(),
      untagged: false,
      sort: "createdAt" as const,
      order: "desc" as const,
      pageSize: 25,
    };
    expect(toolbarDiffersFromSearch(fields, "?page=3")).toBe(false);
    expect(
      toolbarDiffersFromSearch(
        { ...fields, status: "unsolved" },
        "?page=3",
      ),
    ).toBe(true);
  });
});