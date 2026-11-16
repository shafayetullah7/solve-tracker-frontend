import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, describe, expect, test } from "vitest";
import { DashboardStatsStrip } from "./DashboardStatsStrip";

afterEach(cleanup);

describe("DashboardStatsStrip", () => {
  test("shows progress bar when library has problems", () => {
    const view = render(() => (
      <DashboardStatsStrip counts={{ total: 10, solved: 4, unsolved: 6 }} platformCount={2} />
    ));
    expect(view.getByRole("progressbar", { name: /40% of problems solved/ })).toBeInTheDocument();
    expect(view.getByRole("region", { name: "Library totals" })).toBeInTheDocument();
    expect(view.getByText("40%")).toBeInTheDocument();
  });

  test("hides progress bar when total is zero", () => {
    const view = render(() => (
      <DashboardStatsStrip counts={{ total: 0, solved: 0, unsolved: 0 }} platformCount={0} />
    ));
    expect(view.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(view.getByText(/No problems yet/)).toBeInTheDocument();
  });
});