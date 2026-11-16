import { render, screen } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { RouteLoadingScreen } from "./RouteLoadingScreen";

describe("RouteLoadingScreen", () => {
  test("shows centered status with brand mark only", () => {
    const { container } = render(() => <RouteLoadingScreen />);
    expect(screen.getByRole("status", { name: "Loading" })).toBeTruthy();
    expect(screen.getByRole("status").textContent?.trim()).toBe("");
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
    expect(screen.getByRole("status").id).toBe("main-content");
  });
});