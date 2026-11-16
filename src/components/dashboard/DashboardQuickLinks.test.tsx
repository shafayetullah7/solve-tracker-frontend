import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, describe, expect, test } from "vitest";
import { DashboardQuickLinks } from "./DashboardQuickLinks";

afterEach(cleanup);

describe("DashboardQuickLinks", () => {
  test("shows Unsolved count when prop set", () => {
    const view = render(() => <DashboardQuickLinks unsolvedCount={3} />);
    expect(view.getByRole("link", { name: "Unsolved (3)" })).toBeInTheDocument();
  });

  test("hides stat links when counts omitted", () => {
    const view = render(() => <DashboardQuickLinks />);
    expect(view.queryByRole("link", { name: /Unsolved/ })).not.toBeInTheDocument();
    expect(view.queryByRole("link", { name: /Untagged/ })).not.toBeInTheDocument();
  });
});