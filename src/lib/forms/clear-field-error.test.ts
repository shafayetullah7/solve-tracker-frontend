import { describe, expect, test, vi } from "vitest";
import type { FieldErrors } from "./field-errors";
import { clearFieldError, onInputClearingField, type SetFieldErrors } from "./clear-field-error";

describe("clearFieldError", () => {
  test("removes key when present", () => {
    const setFieldErrors: SetFieldErrors = vi.fn((value) => {
      const result =
        typeof value === "function"
          ? value({ email: "bad", password: "bad" })
          : value;
      expect(result).toEqual({ password: "bad" });
    });
    clearFieldError(setFieldErrors, "email");
    expect(setFieldErrors).toHaveBeenCalled();
  });

  test("no-op when key missing", () => {
    const setFieldErrors: SetFieldErrors = vi.fn((value) => {
      const prev: FieldErrors = { email: "bad" };
      const result = typeof value === "function" ? value(prev) : value;
      expect(result).toBe(prev);
    });
    clearFieldError(setFieldErrors, "password");
  });
});

describe("onInputClearingField", () => {
  test("sets value and clears error", () => {
    const setValue = vi.fn();
    const setFieldErrors = vi.fn();
    const handler = onInputClearingField(setValue, setFieldErrors, "email");
    handler({ currentTarget: { value: "a@b.co" } });
    expect(setValue).toHaveBeenCalledWith("a@b.co");
    expect(setFieldErrors).toHaveBeenCalled();
  });
});