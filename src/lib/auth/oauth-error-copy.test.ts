import { describe, expect, it } from "vitest";
import { GOOGLE_PRACTICE_LOGOUT_NOTE, oauthErrorMessage } from "./oauth-error-copy";

describe("oauth-error-copy", () => {
  it("documents Google vs Practice logout and optional RISC", () => {
    expect(GOOGLE_PRACTICE_LOGOUT_NOTE).toContain(
      "does not sign you out of Practice",
    );
    expect(GOOGLE_PRACTICE_LOGOUT_NOTE).toContain("Cross-Account Protection");
  });

  it("maps known OAuth error codes", () => {
    expect(oauthErrorMessage("OAUTH_DISABLED")).toMatch(/not enabled/i);
    expect(oauthErrorMessage("unknown_code")).toBeDefined();
  });
});