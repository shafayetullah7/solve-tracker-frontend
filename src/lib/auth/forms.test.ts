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
    expect(safeReturnPath("/app/topics")).toBe("/app/topics");
    expect(safeReturnPath("/app/topics/abc")).toBe("/app/topics/abc");
    expect(safeReturnPath("/app/problems")).toBe("/app/problems");
    expect(safeReturnPath("/app/problems/11111111-1111-4111-8111-111111111111")).toBe(
      "/app/problems/11111111-1111-4111-8111-111111111111",
    );
    expect(safeReturnPath("/app/problems/11111111-1111-4111-8111-111111111111/edit")).toBe(
      "/app/problems/11111111-1111-4111-8111-111111111111/edit",
    );
    expect(safeReturnPath("//evil")).toBeUndefined();
    expect(safeReturnPath("https://evil.test")).toBeUndefined();
    expect(safeReturnPath("/account?x=1")).toBe("/account?x=1");
    expect(safeReturnPath("/app/profile")).toBe("/app/profile");
    expect(safeReturnPath("/app")).toBe("/app");
    expect(safeReturnPath("/dashboard")).toBeUndefined();
    expect(safeReturnPath("/problems")).toBeUndefined();
    const topicQuery = "?topicId=550e8400-e29b-41d4-a716-446655440000";
    expect(safeReturnPath(`/app/problems${topicQuery}`)).toBe(
      `/app/problems${topicQuery}`,
    );
    expect(safeReturnPath("/login")).toBeUndefined();
    expect(safeReturnPath("/register")).toBeUndefined();
    expect(safeReturnPath("/forgot-password")).toBeUndefined();
    expect(safeReturnPath("/reset-password")).toBeUndefined();
  });

  test("loginPathWithReturn", () => {
    const login = "/login";
    expect(loginPathWithReturn(undefined, login)).toBe("/login");
    expect(loginPathWithReturn("/account", login)).toBe("/login?next=%2Faccount");
    expect(loginPathWithReturn("/app", login)).toBe("/login?next=%2Fapp");
    expect(loginPathWithReturn("/login", login)).toBe("/login");
  });

  test("isPublicAuthPath", () => {
    expect(isPublicAuthPath("/reset-password")).toBe(true);
    expect(isPublicAuthPath("/forgot-password")).toBe(true);
    expect(isPublicAuthPath("/login")).toBe(false);
  });

  test("mapAuthFieldErrors record details", () => {
    expect(mapAuthFieldErrors({ email: "Invalid email", name: ["Too long"] })).toEqual(
      { email: "Invalid email", name: "Too long" },
    );
  });

  test("mapAuthFieldErrors pipe issue array", () => {
    expect(
      mapAuthFieldErrors([
        { path: ["password"], message: "Password must contain 15–128 characters" },
      ]),
    ).toEqual({
      password: "Password must contain 15–128 characters",
    });
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