import { describe, expect, test } from "vitest";
import { formatRetryAfterHint } from "./format-retry-after";

describe("formatRetryAfterHint", () => {
  test("converts seconds to minutes", () => {
    expect(formatRetryAfterHint("90")).toBe("Try again in about 2 minutes.");
    expect(formatRetryAfterHint("60")).toBe("Try again in about 1 minute.");
  });

  test("invalid values", () => {
    expect(formatRetryAfterHint(undefined)).toBeUndefined();
    expect(formatRetryAfterHint("")).toBeUndefined();
    expect(formatRetryAfterHint("nope")).toBeUndefined();
  });
});