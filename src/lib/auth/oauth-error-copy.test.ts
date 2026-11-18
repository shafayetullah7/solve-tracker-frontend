import { describe, expect, test } from "vitest";
import { oauthErrorMessage } from "./oauth-error-copy";

describe("oauthErrorMessage", () => {
  test("maps known codes", () => {
    expect(oauthErrorMessage("OAUTH_EMAIL_UNVERIFIED")).toContain("verified");
    expect(oauthErrorMessage("OAUTH_STATE_INVALID")).toBeTruthy();
  });

  test("returns undefined when code absent", () => {
    expect(oauthErrorMessage(null)).toBeUndefined();
    expect(oauthErrorMessage("")).toBeUndefined();
  });

  test("falls back for unknown codes", () => {
    expect(oauthErrorMessage("UNKNOWN_CODE")).toContain("did not complete");
  });
});