import { render, screen } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { PeopleUnavailable } from "./PeopleUnavailable";

describe("PeopleUnavailable", () => {
  test("uses shared unavailable copy", () => {
    render(() => <PeopleUnavailable />);
    expect(
      screen.getByText("This practice profile isn’t available"),
    ).toBeInTheDocument();
  });
});