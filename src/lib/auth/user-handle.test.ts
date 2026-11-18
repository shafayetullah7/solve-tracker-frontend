import { describe, expect, test } from "vitest";
import {
  formatHandleLabel,
  isSystemAssignedHandle,
  validateUserHandle,
} from "./user-handle";

describe("user-handle", () => {
  test("formatHandleLabel", () => {
    expect(formatHandleLabel("tourist")).toBe("@tourist");
  });

  test("detects system handles", () => {
    expect(isSystemAssignedHandle("ua1b2c3d4e5f64789a012345")).toBe(true);
    expect(isSystemAssignedHandle("rabcdefghijklmnopqrstuv")).toBe(true);
    expect(isSystemAssignedHandle("tourist")).toBe(false);
  });

  test("validates shape", () => {
    expect(validateUserHandle("valid_handle")).toBeUndefined();
    expect(validateUserHandle("ab")).toBeTruthy();
    expect(validateUserHandle("_bad")).toBeTruthy();
    expect(validateUserHandle("has space")).toBeTruthy();
  });
});