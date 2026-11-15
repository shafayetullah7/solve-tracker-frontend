import { describe, expect, test } from "vitest";
import { ApiError } from "../api/errors";
import {
  authFormMessage,
  isPublicAuthPath,
  loginPathWithReturn,
  mapAuthFieldErrors,
  parseResetTokenFromHash,
  safeReturnPath,
} from "./forms";

describe("auth forms", () => {
  test("safeReturnPath allowlist", () => {
    expect(safeReturnPath("/account")).toBe("/account");
    expect(safeReturnPath("/")).toBe("/");
    expect(safeReturnPath("/topics")).toBe("/topics");
    expect(safeReturnPath("/topics/abc")).toBe("/topics/abc");
    expect(safeReturnPath("/problems")).toBe("/problems");
    expect(safeReturnPath("/problems/11111111-1111-4111-8111-111111111111")).toBe(
      "/problems/11111111-1111-4111-8111-111111111111",
    );
    expect(safeReturnPath("/problems/11111111-1111-4111-8111-111111111111/edit")).toBe(
      "/problems/11111111-1111-4111-8111-111111111111/edit",
    );
    expect(safeReturnPath("//evil")).toBeUndefined();
    expect(safeReturnPath("https://evil.test")).toBeUndefined();
    expect(safeReturnPath("/account?x=1")).toBe("/account");
    expect(safeReturnPath("/login")).toBeUndefined();
    expect(safeReturnPath("/register")).toBeUndefined();
    expect(safeReturnPath("/forgot-password")).toBeUndefined();
    expect(safeReturnPath("/reset-password")).toBeUndefined();
  });

  test("loginPathWithReturn", () => {
    const login = "/login";
    expect(loginPathWithReturn(undefined, login)).toBe("/login");
    expect(loginPathWithReturn("/account", login)).toBe("/login?next=%2Faccount");
    expect(loginPathWithReturn("/login", login)).toBe("/login");
  });

  test("isPublicAuthPath", () => {
    expect(isPublicAuthPath("/reset-password")).toBe(true);
    expect(isPublicAuthPath("/forgot-password")).toBe(true);
    expect(isPublicAuthPath("/login")).toBe(false);
  });

  test("mapAuthFieldErrors", () => {
    expect(mapAuthFieldErrors({ email: "Invalid email", name: ["Too long"] })).toEqual(
      { email: "Invalid email", name: "Too long" },
    );
  });

  test("authFormMessage kinds", () => {
    expect(
      authFormMessage(
        new ApiError("http", "x", 401, "INVALID_CREDENTIALS"),
      ).kind,
    ).toBe("credentials");
    expect(authFormMessage(new ApiError("network", "x")).kind).toBe("unavailable");
  });

  test("parseResetTokenFromHash", () => {
    const token = "a".repeat(43);
    expect(parseResetTokenFromHash(`#token=${token}`)).toBe(token);
    expect(parseResetTokenFromHash("#token=short")).toBeUndefined();
  });
});