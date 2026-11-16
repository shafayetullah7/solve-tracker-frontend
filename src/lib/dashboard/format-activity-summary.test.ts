import { describe, expect, test } from "vitest";
import {
  formatActivityChartSummary,
  formatWeekLabel,
} from "./format-activity-summary";

describe("format-activity-summary", () => {
  test("summarizes totals and streak", () => {
    const text = formatActivityChartSummary({
      weeks: [
        { weekStart: "2026-06-01", added: 1, solved: 0 },
        { weekStart: "2026-06-08", added: 2, solved: 3 },
      ],
      streak: { currentDays: 2, lastSolveDate: "2026-06-18" },
      timezone: "UTC",
    });
    expect(text).toContain("3 problems added");
    expect(text).toContain("3 solved");
    expect(text).toContain("streak: 2 days");
  });

  test("formatWeekLabel uses UTC", () => {
    expect(formatWeekLabel("2026-06-08")).toMatch(/Jun/);
  });
});