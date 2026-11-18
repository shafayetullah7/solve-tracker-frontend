import { render, screen } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { DiscoverReasonLine } from "./DiscoverReasonLine";

describe("DiscoverReasonLine", () => {
  test("renders reason text", () => {
    render(() => <DiscoverReasonLine text="Shares Graphs · leetcode" />);
    expect(screen.getByTestId("discover-reason")).toHaveTextContent("Shares Graphs");
  });
});