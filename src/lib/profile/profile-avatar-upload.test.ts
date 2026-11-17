import { describe, expect, test } from "vitest";
import { ProfileSaveError } from "./profile-save-error";
import { validateAvatarFile } from "./profile-avatar-upload";

describe("validateAvatarFile", () => {
  test("accepts png", () => {
    expect(() =>
      validateAvatarFile(new File(["x"], "a.png", { type: "image/png" })),
    ).not.toThrow();
  });

  test("rejects non-image", () => {
    expect(() =>
      validateAvatarFile(new File(["x"], "a.txt", { type: "text/plain" })),
    ).toThrow(ProfileSaveError);
  });
});