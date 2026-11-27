import { describe, expect, test } from "vitest";
import {
  DEFAULT_LIBRARY_QUERY,
  buildLibrarySearchQuery,
  libraryHref,
  parseLibrarySearch,
} from "./library-query";

describe("library-query", () => {
  test("defaults when search empty", () => {
    expect(parseLibrarySearch("")).toEqual(DEFAULT_LIBRARY_QUERY);
  });

  test("parses status search and page", () => {
    expect(parseLibrarySearch("?status=archived&search=algo&page=2&pageSize=25")).toEqual({
      page: 2,
      pageSize: 25,
      status: "archived",
      search: "algo",
    });
  });

  test("ignores invalid status and clamps page", () => {
    expect(parseLibrarySearch("?status=deleted&page=0")).toEqual({
      page: 1,
      pageSize: 25,
      status: "active",
    });
  });

  test("build and href round-trip non-default fields", () => {
    const query = {
      page: 3,
      pageSize: 25,
      status: "archived" as const,
      search: "rust",
    };
    const built = buildLibrarySearchQuery(query);
    expect(built).toContain("status=archived");
    expect(built).toContain("search=rust");
    expect(libraryHref(query)).toBe(`/app/learning?${built}`);
  });
});