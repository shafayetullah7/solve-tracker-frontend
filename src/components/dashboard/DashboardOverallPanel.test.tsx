import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, describe, expect, test } from "vitest";
import { DashboardOverallPanel } from "./DashboardOverallPanel";

afterEach(cleanup);

describe("DashboardOverallPanel", () => {
  test("shows progress bar when library has problems", () => {
    const view = render(() => (
      <DashboardOverallPanel counts={{ total: 10, solved: 4, unsolved: 6 }} />
    ));
    expect(view.getByRole("progressbar", { name: /40% of problems solved/ })).toBeInTheDocument();
    expect(view.getByRole("group", { name: "Library totals" })).toBeInTheDocument();
    expect(view.getByText("40")).toBeInTheDocument();
  });

  test("hides progress bar when total is zero", () => {
    const view = render(() => (
      <DashboardOverallPanel counts={{ total: 0, solved: 0, unsolved: 0 }} />
    ));
    expect(view.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(view.getByText(/You have not saved any problems yet/)).toBeInTheDocument();
  });
});