import { render } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { DashboardPlatformGrid } from "./DashboardPlatformGrid";

describe("DashboardPlatformGrid readOnly", () => {
  test("omits library links when readOnly", () => {
    const { container } = render(() => (
      <DashboardPlatformGrid
        readOnly
        platforms={[
          {
            slug: "leetcode",
            name: "LeetCode",
            total: 2,
            solved: 1,
            unsolved: 1,
          },
        ]}
      />
    ));
    expect(container.innerHTML).not.toContain("/app/problems");
  });
});