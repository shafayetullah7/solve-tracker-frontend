import { describe, expect, test } from "vitest";
import { ApiError } from "../api/errors";
import {
  isTerminalAuthError,
  shouldInvalidateProductSession,
} from "./terminal-auth";

describe("terminal-auth", () => {
  test.each(["AUTH_SESSION_INVALID", "AUTH_REFRESH_INVALID"] as const)(
    "isTerminalAuthError accepts %s",
    (code) => {
      expect(
        isTerminalAuthError(new ApiError("http", "x", 401, code)),
      ).toBe(true);
    },
  );

  test("rejects AUTH_REFRESH_REQUIRED and non-401", () => {
    expect(
      isTerminalAuthError(
        new ApiError("http", "x", 401, "AUTH_REFRESH_REQUIRED"),
      ),
    ).toBe(false);
    expect(isTerminalAuthError(new ApiError("http", "x", 403, "FORBIDDEN"))).toBe(
      false,
    );
  });

  test("shouldInvalidateProductSession after failed recovery", () => {
    expect(
      shouldInvalidateProductSession(
        new ApiError("http", "x", 401, "AUTH_REFRESH_REQUIRED"),
        { afterFailedRecovery: true },
      ),
    ).toBe(true);
  });

  test("shouldInvalidateProductSession after recovery retry 401", () => {
    expect(
      shouldInvalidateProductSession(
        new ApiError("http", "x", 401, "AUTH_REFRESH_REQUIRED"),
        { afterRecoveryRetry: true },
      ),
    ).toBe(true);
  });
});