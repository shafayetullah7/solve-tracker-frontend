import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, describe, expect, test } from "vitest";
import { DashboardActivityChart } from "./DashboardActivityChart";

afterEach(cleanup);

describe("DashboardActivityChart", () => {
  test("exposes accessible summary and bar chart", () => {
    const view = render(() => (
      <DashboardActivityChart
        data={{
          weeks: [
            { weekStart: "2026-06-01", added: 2, solved: 1 },
            { weekStart: "2026-06-08", added: 0, solved: 3 },
          ],
          streak: { currentDays: 0, lastSolveDate: null },
          timezone: "UTC",
        }}
      />
    ));
    expect(
      view.getByLabelText(/Last 2 weeks \(UTC\): 2 problems added, 4 solved/),
    ).toBeInTheDocument();
  });
});