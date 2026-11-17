import { describe, expect, test } from "vitest";
import {
  formatWorkPeriod,
  formatWorkPeriodLabel,
  parseWorkPeriod,
  validateEducationEndYear,
  validateWorkPeriodMonths,
} from "./profile-entry-dates";

describe("profile-entry-dates", () => {
  test("round-trips canonical work period", () => {
    const stored = formatWorkPeriod("2020-06", "2025-01");
    expect(stored).toBe("2020-06/2025-01");
    expect(parseWorkPeriod(stored)).toEqual({ start: "2020-06", end: "2025-01" });
  });

  test("ongoing work period", () => {
    expect(formatWorkPeriod("2022-03", "")).toBe("2022-03/");
    expect(formatWorkPeriodLabel("2022-03/")).toMatch(/Present/);
  });

  test("legacy period preserved in parse", () => {
    expect(parseWorkPeriod("Summer 2025")).toEqual({
      start: "",
      end: "",
      legacy: "Summer 2025",
    });
    expect(formatWorkPeriodLabel("Summer 2025")).toBe("Summer 2025");
  });

  test("validateWorkPeriodMonths order", () => {
    expect(validateWorkPeriodMonths("2024-06", "2024-01")).toBe(
      "End month must be the same as or after the start month.",
    );
  });

  test("validateEducationEndYear", () => {
    expect(validateEducationEndYear("2026").value).toBe("2026");
    expect(validateEducationEndYear("26").error).toBeDefined();
    expect(validateEducationEndYear("1800").error).toBeDefined();
  });
});