import { render, screen } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { AuthNav } from "./AuthNav";

describe("AuthNav", () => {
  test("shows guest links only", () => {
    render(() => <AuthNav />);
    expect(screen.getByRole("link", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Register" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Library" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Topics" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Account" })).not.toBeInTheDocument();
  });
});