import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, describe, expect, test } from "vitest";
import { DashboardActivitySection } from "./DashboardActivitySection";

afterEach(cleanup);

const emptyActivity = {
  weeks: [
    { weekStart: "2026-11-10", added: 0, solved: 0 },
    { weekStart: "2026-11-17", added: 0, solved: 0 },
  ],
  streak: { currentDays: 0, lastSolveDate: null },
  timezone: "UTC" as const,
};

const activeActivity = {
  weeks: [
    { weekStart: "2026-11-03", added: 1, solved: 0 },
    { weekStart: "2026-11-10", added: 2, solved: 3 },
  ],
  streak: { currentDays: 2, lastSolveDate: "2026-11-16" },
  timezone: "UTC" as const,
};

describe("DashboardActivitySection", () => {
  test("empty window shows CTA copy without chart summary", () => {
    const view = render(() => (
      <DashboardActivitySection status="ready" data={emptyActivity} />
    ));
    expect(view.getByRole("heading", { name: "Activity" })).toBeInTheDocument();
    expect(view.getByText(/No activity in this window yet/)).toBeInTheDocument();
    expect(view.queryByLabelText(/Last \d+ weeks/)).not.toBeInTheDocument();
  });

  test("non-empty window shows accessible chart summary", () => {
    const view = render(() => (
      <DashboardActivitySection status="ready" data={activeActivity} />
    ));
    expect(
      view.getByLabelText(/Last 2 weeks \(UTC\): 3 problems added, 3 solved/),
    ).toBeInTheDocument();
    expect(view.getByRole("status")).toHaveTextContent(/2-day solve streak/);
  });
});