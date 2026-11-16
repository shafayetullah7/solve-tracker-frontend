import { render } from "@solidjs/testing-library";
import { describe, expect, test } from "vitest";
import { PasswordCodePointMeter } from "./PasswordCodePointMeter";

describe("PasswordCodePointMeter", () => {
  test("hidden when not visible", () => {
    const { container } = render(() => (
      <PasswordCodePointMeter fieldId="register-password" value="abc" visible={false} />
    ));
    expect(container.textContent?.trim()).toBe("");
  });

  test("counts emoji as multiple code points", () => {
    const { container } = render(() => (
      <PasswordCodePointMeter fieldId="register-password" value="😀😀" visible />
    ));
    expect(container.textContent).toContain("2 / 15");
  });
});