import { describe, expect, test } from "vitest";
import { parseBrowseSearch } from "../problems/browse-query";
import {
  DASHBOARD_LIST_QUERIES,
  dashboardBrowseHref,
} from "./dashboard-queries";

describe("dashboard-queries", () => {
  test("focus browse href includes unsolved and ascending createdAt", () => {
    const href = dashboardBrowseHref("focusQueue");
    expect(href).toContain("/app/problems?");
    const qs = href.slice(href.indexOf("?"));
    expect(parseBrowseSearch(qs)).toMatchObject({
      status: "unsolved",
      order: "asc",
      sort: "createdAt",
    });
  });

  test("presets use preview page size for list fetches", () => {
    expect(DASHBOARD_LIST_QUERIES.focusQueue.pageSize).toBe(5);
    expect(DASHBOARD_LIST_QUERIES.untaggedCount.pageSize).toBe(1);
  });

  test("untagged browse href sets untagged filter", () => {
    const href = dashboardBrowseHref("untaggedCount");
    expect(parseBrowseSearch(href.slice(href.indexOf("?"))).untagged).toBe("true");
  });
});