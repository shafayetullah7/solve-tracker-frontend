import { describe, expect, test } from "vitest";
import { ApiError } from "../api/errors";
import { applyProfileApiError } from "./apply-profile-api-error";

describe("applyProfileApiError", () => {
  test("HANDLE_CHANGE_COOLDOWN with handle field omits banner", () => {
    const error = new ApiError(
      "http",
      "You can change your handle again in 30 day(s).",
      409,
      "HANDLE_CHANGE_COOLDOWN",
      { handle: "You can change your handle again in 30 day(s)." },
    );
    const applied = applyProfileApiError(error);
    expect(applied.banner).toBeUndefined();
    expect(applied.fieldErrors.handle).toBe(
      "You can change your handle again in 30 day(s).",
    );
  });

  test("profile error without field errors keeps banner", () => {
    const error = new ApiError(
      "http",
      "Could not save your profile.",
      500,
      "INTERNAL_ERROR",
    );
    const applied = applyProfileApiError(error);
    expect(applied.banner).toBe("Could not save your profile.");
    expect(Object.keys(applied.fieldErrors)).toHaveLength(0);
  });
});