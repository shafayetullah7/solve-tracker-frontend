import { describe, expect, it } from "vitest";
import { deleteAccountConfirmEnabled } from "./ProfileDeleteAccountDialog";

describe("ProfileDeleteAccountDialog", () => {
  it("requires the exact DELETE confirmation phrase", () => {
    expect(deleteAccountConfirmEnabled("DELETE")).toBe(true);
    expect(deleteAccountConfirmEnabled("delete")).toBe(false);
    expect(deleteAccountConfirmEnabled("")).toBe(false);
  });
});