import { fireEvent, render, waitFor } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";
import { PasswordInput } from "./PasswordInput";

describe("PasswordInput", () => {
  test("toggles password visibility", async () => {
    const onInput = vi.fn();
    const { container, getByRole } = render(() => (
      <PasswordInput id="test-password" value="secret" onInput={onInput} />
    ));
    const input = container.querySelector("#test-password") as HTMLInputElement;
    expect(input.type).toBe("password");

    fireEvent.click(getByRole("button", { name: "Show password" }));
    await waitFor(() => {
      expect((container.querySelector("#test-password") as HTMLInputElement).type).toBe(
        "text",
      );
    });
    expect(getByRole("button", { name: "Hide password" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    fireEvent.click(getByRole("button", { name: "Hide password" }));
    await waitFor(() => {
      expect((container.querySelector("#test-password") as HTMLInputElement).type).toBe(
        "password",
      );
    });
  });

  test("toggle button does not submit the form", () => {
    const onSubmit = vi.fn((event: Event) => event.preventDefault());
    const { getByRole } = render(() => (
      <form onSubmit={onSubmit}>
        <PasswordInput id="pwd" value="" onInput={() => undefined} />
        <button type="submit">Send</button>
      </form>
    ));
    fireEvent.click(getByRole("button", { name: "Show password" }));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});