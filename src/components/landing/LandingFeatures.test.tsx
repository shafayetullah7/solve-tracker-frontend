import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, describe, expect, test } from "vitest";
import { LANDING_FEATURES } from "./landing-copy";
import { LandingFeatures } from "./LandingFeatures";

afterEach(cleanup);

describe("LandingFeatures", () => {
  test("responsive grid includes lg four-column breakpoint", () => {
    const view = render(() => <LandingFeatures />);
    expect(view.getByRole("heading", { name: LANDING_FEATURES.title })).toBeInTheDocument();
    const grid = view.container.querySelector("section .grid");
    expect(grid).not.toBeNull();
    expect(grid?.className).toContain("sm:grid-cols-2");
    expect(grid?.className).toContain("lg:grid-cols-4");
  });
});