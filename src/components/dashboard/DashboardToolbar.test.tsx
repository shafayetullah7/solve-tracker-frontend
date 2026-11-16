import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, describe, expect, test, vi } from "vitest";
import { DashboardToolbar } from "./DashboardToolbar";

afterEach(cleanup);

describe("DashboardToolbar", () => {
  test("shows browse and pill counts when provided", () => {
    const view = render(() => (
      <DashboardToolbar total={24} unsolvedCount={15} untaggedCount={7} />
    ));
    expect(view.getByRole("navigation", { name: "Dashboard actions" })).toBeInTheDocument();
    expect(view.getByRole("link", { name: "Browse library (24)" })).toHaveAttribute(
      "href",
      "/app/problems",
    );
    expect(view.getByRole("link", { name: "Unsolved (15)" })).toHaveAttribute(
      "href",
      expect.stringContaining("status=unsolved"),
    );
    expect(view.getByRole("link", { name: "Untagged (7)" })).toHaveAttribute(
      "href",
      expect.stringContaining("untagged=true"),
    );
    expect(view.getByRole("link", { name: "Manage topics" })).toHaveAttribute("href", "/app/topics");
  });

  test("re-fetch button calls handler when not refreshing", async () => {
    const onRefresh = vi.fn();
    const view = render(() => <DashboardToolbar onRefresh={onRefresh} refreshing={false} />);
    await view.getByRole("button", { name: "Re-fetch" }).click();
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });
});