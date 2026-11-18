import { describe, expect, test, vi } from "vitest";
import {
  googleOAuthLinkHref,
  googleOAuthStartHref,
  isGoogleOAuthEnabled,
} from "./google-oauth";

describe("google-oauth", () => {
  test("googleOAuthStartHref with safe next", () => {
    expect(googleOAuthStartHref("/app")).toBe("/api/auth/google?next=%2Fapp");
    expect(googleOAuthStartHref("/login")).toBe("/api/auth/google");
    expect(googleOAuthStartHref()).toBe("/api/auth/google");
  });

  test("googleOAuthLinkHref includes mode=link", () => {
    expect(googleOAuthLinkHref()).toBe(
      "/api/auth/google?mode=link&next=%2Fapp%2Fprofile",
    );
  });

  test("isGoogleOAuthEnabled reads VITE flag", () => {
    vi.stubEnv("VITE_GOOGLE_OAUTH_ENABLED", "true");
    expect(isGoogleOAuthEnabled()).toBe(true);
    vi.stubEnv("VITE_GOOGLE_OAUTH_ENABLED", "false");
    expect(isGoogleOAuthEnabled()).toBe(false);
    vi.unstubAllEnvs();
  });
});