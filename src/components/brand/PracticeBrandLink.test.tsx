import { render, screen } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { PracticeBrandLink } from "./PracticeBrandLink";

describe("PracticeBrandLink", () => {
  test("renders mark and wordmark for nav", () => {
    render(() => <PracticeBrandLink href="/" />);
    const link = screen.getByRole("link", { name: /practice/i });
    expect(link).toHaveAttribute("href", "/");
    expect(link.querySelector("svg")).toBeTruthy();
    expect(link).toHaveTextContent("practice.");
  });

  test("mark-only uses accessible name", () => {
    render(() => <PracticeBrandLink href="/app" wordmark={false} />);
    expect(screen.getByRole("link", { name: "Practice home" })).toBeTruthy();
  });
});