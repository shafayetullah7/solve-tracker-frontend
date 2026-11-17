import { render, screen } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { LANDING_HERO, LANDING_PREVIEW_ARIA } from "./landing-copy";
import { LandingPage } from "./LandingPage";

describe("LandingPage", () => {
  test("shows hero, CTAs, preview, and platform names", () => {
    render(() => <LandingPage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(LANDING_HERO.title);
    const registerLinks = screen.getAllByRole("link", { name: /create account/i });
    const signInLinks = screen.getAllByRole("link", { name: /sign in/i });
    expect(registerLinks.length).toBeGreaterThanOrEqual(1);
    expect(signInLinks.length).toBeGreaterThanOrEqual(1);
    expect(registerLinks[0]).toHaveAttribute("href", "/register");
    expect(signInLinks[0]).toHaveAttribute("href", "/login");
    expect(screen.getByRole("img", { name: LANDING_PREVIEW_ARIA })).toBeTruthy();
    expect(screen.getByRole("img", { name: "AtCoder" })).toBeTruthy();
    expect(document.querySelector('a[href*="/app/problems"]')).toBeNull();
  });
});