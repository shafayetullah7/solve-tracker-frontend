import { cleanup, render, screen } from "@solidjs/testing-library";
import { afterEach, describe, expect, test, vi } from "vitest";
import { RouteErrorFallback } from "./RouteErrorFallback";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("RouteErrorFallback", () => {
  test("renders recovery actions without exposing error text", () => {
    const reset = vi.fn();
    const error = new Error("secret internals");
    const err = () => error;
    render(() => <RouteErrorFallback err={err} reset={reset} />);
    expect(screen.getByRole("alert")).toHaveTextContent(/Something went wrong/i);
    expect(screen.queryByText(/secret internals/)).not.toBeInTheDocument();
    screen.getByRole("button", { name: /Try again/i }).click();
    expect(reset).toHaveBeenCalledOnce();
  });

  test("renders inside shell without a second main landmark", () => {
    const reset = vi.fn();
    const error = new Error("x");
    const err = () => error;
    const { container } = render(() => (
      <RouteErrorFallback err={err} reset={reset} mainContent={false} />
    ));
    expect(container.querySelector("main")).toBeNull();
    expect(screen.getByRole("alert")).toBeTruthy();
  });
});