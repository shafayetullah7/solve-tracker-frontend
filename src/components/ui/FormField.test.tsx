import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, describe, expect, test } from "vitest";
import { FormField, formFieldControlAttrs } from "./FormField";

afterEach(cleanup);

describe("FormField", () => {
  test("links label to control and shows hint", () => {
    const view = render(() => (
      <FormField id="test-email" label="Email" hint="Use your email">
        <input class="ui-field" {...formFieldControlAttrs({ id: "test-email", hint: "Use your email" })} />
      </FormField>
    ));
    expect(view.getByLabelText("Email")).toHaveAttribute("id", "test-email");
    expect(view.getByText("Use your email")).toHaveAttribute("id", "test-email-hint");
  });

  test("shows error block when error set", () => {
    const view = render(() => (
      <FormField id="test-pw" label="Password" error="Too short">
        <input
          class="ui-field"
          {...formFieldControlAttrs({ id: "test-pw", error: "Too short" })}
        />
      </FormField>
    ));
    expect(view.getByText("Too short")).toHaveAttribute("id", "test-pw-error");
    expect(view.queryByText(/hint/i)).not.toBeInTheDocument();
  });

  test("control attrs reflect error state", () => {
    const view = render(() => (
      <FormField id="x" label="Field" hint="H" error="E">
        <input
          data-testid="control"
          {...formFieldControlAttrs({ id: "x", hint: "H", error: "E" })}
        />
      </FormField>
    ));
    const control = view.getByTestId("control");
    expect(control).toHaveAttribute("aria-invalid", "true");
    expect(control).toHaveAttribute("aria-describedby", "x-hint x-error");
  });
});