import { describe, expect, test } from "vitest";
import { ApiError } from "../api/errors";
import { resolveFormBanner } from "./resolve-form-banner";

describe("resolveFormBanner", () => {
  test("VALIDATION_ERROR with field errors yields no banner", () => {
    const error = new ApiError("http", "Invalid input.", 400, "VALIDATION_ERROR");
    expect(
      resolveFormBanner(error, { password: "Too short" }, "auth"),
    ).toBeUndefined();
  });

  test("VALIDATION_ERROR without fields uses domain message", () => {
    const error = new ApiError("http", "Invalid input.", 400, "VALIDATION_ERROR");
    expect(resolveFormBanner(error, {}, "auth")).toBe("Invalid input.");
    expect(resolveFormBanner(error, {}, "problem")).toBe("Invalid input.");
    expect(resolveFormBanner(error, {}, "topic")).toBe("Invalid input.");
    const bare = new ApiError("http", "", 400, "VALIDATION_ERROR");
    expect(resolveFormBanner(bare, {}, "auth")).toBe("Check the highlighted fields.");
  });

  test("INVALID_CREDENTIALS returns credentials message", () => {
    const error = new ApiError("http", "x", 401, "INVALID_CREDENTIALS");
    expect(resolveFormBanner(error, {}, "auth")).toBe("Invalid email or password.");
  });

  test("handle business errors with field copy skip duplicate banner", () => {
    const cooldown = new ApiError(
      "http",
      "You can change your handle again in 30 day(s).",
      409,
      "HANDLE_CHANGE_COOLDOWN",
    );
    const fields = {
      handle: "You can change your handle again in 30 day(s).",
    };
    expect(resolveFormBanner(cooldown, fields, "profile")).toBeUndefined();
    expect(resolveFormBanner(cooldown, {}, "profile")).toBe(
      "You can change your handle again in 30 day(s).",
    );
  });

  test("non-ApiError returns undefined", () => {
    expect(resolveFormBanner(new Error("x"), {}, "auth")).toBeUndefined();
  });
});