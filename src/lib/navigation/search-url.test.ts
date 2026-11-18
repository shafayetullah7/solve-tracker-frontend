import { describe, expect, test } from "vitest";
import { pathWithoutSearchKeys } from "./search-url";

describe("pathWithoutSearchKeys", () => {
  test("removes keys and preserves others", () => {
    expect(
      pathWithoutSearchKeys("/app/profile", "?focus=handle&oauth_error=x", [
        "focus",
      ]),
    ).toBe("/app/profile?oauth_error=x");
  });

  test("drops query entirely when empty", () => {
    expect(
      pathWithoutSearchKeys("/app/profile", "?focus=handle", ["focus"]),
    ).toBe("/app/profile");
  });
});