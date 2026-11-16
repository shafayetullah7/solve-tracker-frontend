import { describe, expect, test } from "vitest";
import { browseOrderOptions } from "./browse-order-labels";

describe("browse-order-labels", () => {
  test("uses title-friendly labels", () => {
    expect(browseOrderOptions("title")).toEqual({ asc: "A → Z", desc: "Z → A" });
    expect(browseOrderOptions("createdAt").desc).toBe("Newest first");
  });
});