import { render } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { BlockList } from "./BlockViews";

describe("BlockList", () => {
  test("renders text as plain text without executing markup", () => {
    const { container } = render(() => (
      <BlockList
        blocks={[
          {
            id: "11111111-1111-4111-8111-111111111111",
            position: 0,
            type: "text",
            payload: { body: "<script>alert(1)</script>safe" },
            schemaVersion: 1,
          },
        ]}
      />
    ));
    expect(container.textContent).toContain("safe");
    expect(container.querySelector("script")).toBeNull();
  });
});