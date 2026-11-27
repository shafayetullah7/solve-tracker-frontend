import { cleanup, fireEvent, render } from "@solidjs/testing-library";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { LearningWelcomeBanner } from "./LearningWelcomeBanner";
import { WELCOME_BANNER_STORAGE_KEY, WELCOME_BANNER_TITLE } from "../../lib/learning/learning-product-copy";

afterEach(cleanup);

beforeEach(() => {
  localStorage.clear();
});

describe("LearningWelcomeBanner", () => {
  test("renders links when authenticated and not dismissed", () => {
    const view = render(() => (
      <LearningWelcomeBanner authStatus={() => "authenticated"} />
    ));
    expect(view.getByRole("heading", { name: WELCOME_BANNER_TITLE })).toBeInTheDocument();
    expect(view.getByRole("link", { name: "New guide" })).toHaveAttribute("href", "/app/learning/new");
    expect(view.getByRole("link", { name: "Browse problems" })).toHaveAttribute("href", "/app/problems");
  });

  test("dismiss stores key and hides banner", async () => {
    const view = render(() => (
      <LearningWelcomeBanner authStatus={() => "authenticated"} />
    ));
    await fireEvent.click(view.getByRole("button", { name: "Dismiss" }));
    expect(localStorage.getItem(WELCOME_BANNER_STORAGE_KEY)).toBe("1");
    expect(view.queryByRole("heading", { name: WELCOME_BANNER_TITLE })).not.toBeInTheDocument();
  });

  test("hidden when already dismissed", () => {
    localStorage.setItem(WELCOME_BANNER_STORAGE_KEY, "1");
    const view = render(() => (
      <LearningWelcomeBanner authStatus={() => "authenticated"} />
    ));
    expect(view.queryByRole("region")).not.toBeInTheDocument();
  });
});