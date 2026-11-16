import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, describe, expect, test } from "vitest";
import { DashboardStreakBadge } from "./DashboardStreakBadge";

afterEach(cleanup);

describe("DashboardStreakBadge", () => {
  test("shows streak when positive", () => {
    const view = render(() => (
      <DashboardStreakBadge streak={{ currentDays: 3, lastSolveDate: "2026-06-18" }} />
    ));
    expect(view.getByRole("status")).toHaveTextContent("3-day solve streak");
  });

  test("hides when streak is zero", () => {
    const view = render(() => (
      <DashboardStreakBadge streak={{ currentDays: 0, lastSolveDate: null }} />
    ));
    expect(view.queryByRole("status")).not.toBeInTheDocument();
  });
});