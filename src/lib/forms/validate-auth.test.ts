import { describe, expect, test } from "vitest";
import {
  AUTH_MSG,
  validateForgot,
  validateLogin,
  validateRegister,
  validateReset,
} from "./validate-auth";

describe("validateRegister", () => {
  test("short password", () => {
    expect(
      validateRegister({
        name: "Test",
        email: "a@b.co",
        password: "a".repeat(7),
      }),
    ).toEqual({ password: AUTH_MSG.passwordLength });
  });

  test("accepts minimum length password", () => {
    expect(
      validateRegister({
        name: "Test",
        email: "a@b.co",
        password: "a".repeat(8),
      }),
    ).toEqual({});
  });

  test("empty name", () => {
    expect(
      validateRegister({ name: "   ", email: "a@b.co", password: "a".repeat(8) }),
    ).toEqual({ name: AUTH_MSG.nameLength });
  });

  test("invalid email", () => {
    expect(
      validateRegister({
        name: "Test",
        email: "not-email",
        password: "a".repeat(8),
      }),
    ).toEqual({ email: AUTH_MSG.emailInvalid });
  });
});

describe("validateLogin", () => {
  test("empty password", () => {
    expect(validateLogin({ email: "a@b.co", password: "" })).toEqual({
      password: AUTH_MSG.passwordRequired,
    });
  });
});

describe("validateReset", () => {
  test("confirm mismatch", () => {
    const pwd = "a".repeat(8);
    expect(validateReset({ password: pwd, confirm: "different-long-pwd" })).toEqual({
      confirm: AUTH_MSG.confirmMismatch,
    });
  });
});

describe("validateForgot", () => {
  test("invalid email", () => {
    expect(validateForgot({ email: "x" })).toEqual({ email: AUTH_MSG.emailInvalid });
  });
});