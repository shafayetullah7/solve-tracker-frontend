import { cleanup, render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { afterEach, describe, expect, test, vi } from "vitest";
import { RouteErrorFallback } from "./RouteErrorFallback";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("RouteErrorFallback", () => {
  test("renders recovery actions without exposing error text", () => {
    const reset = vi.fn();
    const [err] = createSignal(new Error("secret internals"));
    render(() => <RouteErrorFallback err={err} reset={reset} />);
    expect(screen.getByRole("alert")).toHaveTextContent(/Something went wrong/i);
    expect(screen.queryByText(/secret internals/)).not.toBeInTheDocument();
    screen.getByRole("button", { name: /Try again/i }).click();
    expect(reset).toHaveBeenCalledOnce();
  });
});