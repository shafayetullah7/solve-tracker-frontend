import { describe, expect, test } from "vitest";
import { ApiError } from "../api/errors";
import { applyAuthApiError } from "./apply-auth-api-error";

describe("applyAuthApiError", () => {
  test("VALIDATION_ERROR with password field suppresses banner", () => {
    const error = new ApiError("http", "Invalid input.", 400, "VALIDATION_ERROR", [
      { path: ["password"], message: "Password must contain 15–128 characters" },
    ]);
    const result = applyAuthApiError(error);
    expect(result.fieldErrors.password).toBe(
      "Password must contain 15–128 characters",
    );
    expect(result.banner).toBeUndefined();
  });

  test("INVALID_CREDENTIALS yields banner only", () => {
    const result = applyAuthApiError(
      new ApiError("http", "x", 401, "INVALID_CREDENTIALS"),
    );
    expect(result.fieldErrors).toEqual({});
    expect(result.banner).toBe("Invalid email or password.");
  });

  test("EMAIL_IN_USE sets email field", () => {
    const result = applyAuthApiError(
      new ApiError("http", "x", 409, "EMAIL_IN_USE"),
    );
    expect(result.fieldErrors.email).toBe("That email is already registered.");
  });
});