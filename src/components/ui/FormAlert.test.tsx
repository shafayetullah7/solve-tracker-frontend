import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, describe, expect, test } from "vitest";
import { FormAlert } from "./FormAlert";

afterEach(cleanup);

describe("FormAlert", () => {
  test("error uses alert role", () => {
    const view = render(() => <FormAlert variant="error">Bad input</FormAlert>);
    expect(view.getByRole("alert")).toHaveTextContent("Bad input");
  });

  test("success uses status role", () => {
    const view = render(() => <FormAlert variant="success">Saved</FormAlert>);
    expect(view.getByRole("status")).toHaveTextContent("Saved");
  });

  test("appends retry after hint", () => {
    const view = render(() => (
      <FormAlert variant="error" retryAfter="120">
        Too many attempts.
      </FormAlert>
    ));
    expect(view.getByRole("alert")).toHaveTextContent(/Too many attempts/);
    expect(view.getByRole("alert")).toHaveTextContent(/Try again in about 2 minutes/);
  });
});