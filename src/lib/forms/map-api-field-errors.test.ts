import { describe, expect, test } from "vitest";
import { mapApiFieldErrors } from "./map-api-field-errors";

describe("mapApiFieldErrors", () => {
  test("maps record-shaped details", () => {
    expect(mapApiFieldErrors({ email: "Invalid email", name: ["Too long"] })).toEqual({
      email: "Invalid email",
      name: "Too long",
    });
  });

  test("maps pipe-shaped issue array", () => {
    expect(
      mapApiFieldErrors([
        { path: ["password"], message: "Password must contain 8–128 characters" },
        { path: ["email"], message: "Invalid email" },
      ]),
    ).toEqual({
      password: "Password must contain 8–128 characters",
      email: "Invalid email",
    });
  });

  test("first message wins for duplicate keys", () => {
    expect(
      mapApiFieldErrors([
        { path: ["password"], message: "First password error" },
        { path: ["password"], message: "Second password error" },
      ]),
    ).toEqual({ password: "First password error" });
  });

  test("uses last path segment for nested paths", () => {
    expect(
      mapApiFieldErrors([{ path: ["body", "email"], message: "Invalid email" }]),
    ).toEqual({ email: "Invalid email" });
  });

  test("empty and invalid inputs", () => {
    expect(mapApiFieldErrors(null)).toEqual({});
    expect(mapApiFieldErrors(undefined)).toEqual({});
    expect(mapApiFieldErrors([])).toEqual({});
    expect(mapApiFieldErrors({})).toEqual({});
    expect(mapApiFieldErrors("x")).toEqual({});
  });

  test("skips malformed issue entries", () => {
    expect(
      mapApiFieldErrors([
        { path: [], message: "No path" },
        { path: ["email"], message: "" },
        { message: "Missing path" },
        null,
        { path: ["name"], message: "Bad name" },
      ]),
    ).toEqual({ name: "Bad name" });
  });

  test("does not treat issue array as numeric record keys", () => {
    const result = mapApiFieldErrors([
      { path: ["email"], message: "Invalid email" },
    ]);
    expect(result).not.toHaveProperty("0");
    expect(result).not.toHaveProperty("1");
  });
});