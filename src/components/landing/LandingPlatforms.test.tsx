import { cleanup, render, screen, waitFor } from "@solidjs/testing-library";
import { afterEach, describe, expect, test, vi } from "vitest";
import { LANDING_PLATFORMS } from "./landing-copy";
import { LandingPlatforms } from "./LandingPlatforms";
import { landingPlatformListFixture } from "./landing-platforms-fixture";
import { LandingTestAuth } from "./landing-test-auth";

afterEach(cleanup);

describe("LandingPlatforms", () => {
  test("shows all judges from API in one grid", async () => {
    const listPlatforms = vi.fn().mockResolvedValue(landingPlatformListFixture);
    render(() => (
      <LandingTestAuth>
        <LandingPlatforms listPlatforms={listPlatforms} />
      </LandingTestAuth>
    ));

    expect(listPlatforms).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Problems stay on their sites")).toBeNull();

    await waitFor(() => {
      expect(
        screen.getByRole("region", { name: LANDING_PLATFORMS.sectionAriaLabel }),
      ).toBeTruthy();
      for (const name of ["AtCoder", "SPOJ", "LeetCode", "CSES", "GeeksforGeeks"]) {
        expect(screen.getByRole("img", { name })).toBeTruthy();
      }
      const leetcodeLinks = screen.getAllByRole("link", { name: /LeetCode/i });
      expect(
        leetcodeLinks.some((a) => a.getAttribute("href") === "https://leetcode.com"),
      ).toBe(true);
      expect(screen.getAllByRole("img", { name: "LeetCode" }).length).toBe(1);
    });
  });

  test("shows error only when API fails", async () => {
    const listPlatforms = vi.fn().mockRejectedValue(new Error("offline"));
    render(() => (
      <LandingTestAuth>
        <LandingPlatforms listPlatforms={listPlatforms} />
      </LandingTestAuth>
    ));

    await waitFor(() => {
      expect(screen.getByText(/couldn't load the full list/i)).toBeTruthy();
    });
    expect(screen.queryByRole("img", { name: "AtCoder" })).toBeNull();
  });
});