import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, describe, expect, test } from "vitest";
import { ProgressBar } from "./ProgressBar";

afterEach(cleanup);

describe("ProgressBar", () => {
  test("exposes progressbar semantics", () => {
    const view = render(() => (
      <ProgressBar value={42} label="42 percent complete" />
    ));
    const bar = view.getByRole("progressbar", { name: "42 percent complete" });
    expect(bar).toHaveAttribute("aria-valuenow", "42");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  test("clamps out-of-range values", () => {
    const view = render(() => <ProgressBar value={150} label="Full" />);
    expect(view.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  });
});