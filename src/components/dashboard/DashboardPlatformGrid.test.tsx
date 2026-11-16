import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, describe, expect, test } from "vitest";
import { DashboardPlatformGrid } from "./DashboardPlatformGrid";

afterEach(cleanup);

describe("DashboardPlatformGrid", () => {
  test("renders platform cell with filter link", () => {
    const view = render(() => (
      <DashboardPlatformGrid
        platforms={[
          {
            slug: "codeforces",
            name: "Codeforces",
            total: 4,
            solved: 1,
            unsolved: 3,
          },
        ]}
      />
    ));
    expect(view.getByText("Codeforces")).toBeInTheDocument();
    const link = view.getByRole("link", { name: /View on Codeforces/i });
    expect(link.getAttribute("href") ?? "").toContain("platform=codeforces");
  });
});