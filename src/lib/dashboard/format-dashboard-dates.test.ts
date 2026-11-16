import { describe, expect, test, vi, afterEach } from "vitest";
import { formatDashboardWhen, formatWeekRangeLabel } from "./format-dashboard-dates";

describe("format-dashboard-dates", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test("formatWeekRangeLabel spans six days", () => {
    expect(formatWeekRangeLabel("2026-11-10")).toMatch(/Nov/);
  });

  test("formatDashboardWhen returns Today for same day", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-16T15:00:00.000Z"));
    expect(formatDashboardWhen("2026-11-16T10:00:00.000Z")).toBe("Today");
  });
});