import { cleanup, render, screen, waitFor } from "@solidjs/testing-library";
import { afterEach, describe, expect, test, vi } from "vitest";
import { LANDING_HERO, LANDING_PREVIEW_ARIA } from "./landing-copy";
import { LandingPage } from "./LandingPage";
import { landingPlatformListFixture } from "./landing-platforms-fixture";
import { LandingTestAuth, landingAuthStub } from "./landing-test-auth";

afterEach(cleanup);

describe("LandingPage", () => {
  test("shows hero, CTAs, preview, and platform names", async () => {
    const request = vi.fn().mockResolvedValue(landingPlatformListFixture);
    render(() => (
      <LandingTestAuth
        value={landingAuthStub({
          productClient: { request } as ReturnType<
            typeof landingAuthStub
          >["productClient"],
        })}
      >
        <LandingPage />
      </LandingTestAuth>
    ));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(LANDING_HERO.title);
    const registerLinks = screen.getAllByRole("link", { name: /create account/i });
    const signInLinks = screen.getAllByRole("link", { name: /sign in/i });
    expect(registerLinks.length).toBeGreaterThanOrEqual(1);
    expect(signInLinks.length).toBeGreaterThanOrEqual(1);
    expect(registerLinks[0]).toHaveAttribute("href", "/register");
    expect(signInLinks[0]).toHaveAttribute("href", "/login");
    expect(screen.getByRole("img", { name: LANDING_PREVIEW_ARIA })).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByRole("img", { name: "AtCoder" })).toBeTruthy();
      expect(screen.getByRole("img", { name: "SPOJ" })).toBeTruthy();
    });
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ path: "/platforms", recoverAuth: false }),
    );
    expect(document.querySelector('a[href*="/app/problems"]')).toBeNull();
  });
});