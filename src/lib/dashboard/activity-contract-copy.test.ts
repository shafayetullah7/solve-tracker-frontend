import { describe, expect, test } from "vitest";
import {
  DASHBOARD_ACTIVITY_SUBTITLE,
  DASHBOARD_CONTINUE_LEARNING_HINT,
  DASHBOARD_STATS_STRIP_LABEL,
} from "./activity-contract-copy";

describe("activity-contract-copy", () => {
  test("exports non-empty contract-aligned strings", () => {
    expect(DASHBOARD_ACTIVITY_SUBTITLE.length).toBeGreaterThan(20);
    expect(DASHBOARD_ACTIVITY_SUBTITLE).toMatch(/Coding problems/);
    expect(DASHBOARD_ACTIVITY_SUBTITLE).toMatch(/solve streak/);

    expect(DASHBOARD_STATS_STRIP_LABEL).toBe("Problem library totals");

    expect(DASHBOARD_CONTINUE_LEARNING_HINT.length).toBeGreaterThan(10);
    expect(DASHBOARD_CONTINUE_LEARNING_HINT).toMatch(/required study steps/);
  });
});