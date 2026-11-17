import { describe, expect, test } from "vitest";
import { profileInitials } from "./profile-initials";

describe("profileInitials", () => {
  test("single name", () => {
    expect(profileInitials("Alex")).toBe("AL");
  });

  test("first and last", () => {
    expect(profileInitials("Alex Rivera")).toBe("AR");
  });

  test("trim", () => {
    expect(profileInitials("  Jo  Lee  ")).toBe("JL");
  });
});