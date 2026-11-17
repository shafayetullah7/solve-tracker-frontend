import { describe, expect, test } from "vitest";
import { dashboardPlatformBrowseHref } from "./dashboard-platform-href";

describe("dashboardPlatformBrowseHref", () => {
  test("builds platform filter for catalog slug", () => {
    const href = dashboardPlatformBrowseHref({
      slug: "codeforces",
      name: "Codeforces",
      total: 5,
      solved: 2,
      unsolved: 3,
    });
    expect(href).toContain("platform=codeforces");
  });

  test("filters library for other bucket", () => {
    const href = dashboardPlatformBrowseHref({
      slug: "other",
      name: "Other",
      total: 1,
      solved: 0,
      unsolved: 1,
    });
    expect(href).toContain("platform=other");
  });
});