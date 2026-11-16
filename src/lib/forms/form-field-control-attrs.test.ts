import { describe, expect, test } from "vitest";
import {
  formFieldControlAttrs,
  formFieldErrorId,
  formFieldHintId,
} from "./form-field-control-attrs";

describe("formFieldHintId / formFieldErrorId", () => {
  test("suffixes field id", () => {
    expect(formFieldHintId("register-email")).toBe("register-email-hint");
    expect(formFieldErrorId("register-email")).toBe("register-email-error");
  });
});

describe("formFieldControlAttrs", () => {
  test("hint only", () => {
    expect(
      formFieldControlAttrs({ id: "f1", hint: "Help text" }),
    ).toEqual({
      id: "f1",
      "aria-describedby": "f1-hint",
    });
  });

  test("error with hint includes both ids", () => {
    expect(
      formFieldControlAttrs({
        id: "f1",
        hint: "Help",
        error: "Bad value",
      }),
    ).toEqual({
      id: "f1",
      "aria-describedby": "f1-hint f1-error",
      "aria-invalid": "true",
    });
  });

  test("error without hint", () => {
    expect(
      formFieldControlAttrs({ id: "f1", error: "Required" }),
    ).toEqual({
      id: "f1",
      "aria-describedby": "f1-error",
      "aria-invalid": "true",
    });
  });

  test("no hint or error", () => {
    expect(formFieldControlAttrs({ id: "f1" })).toEqual({ id: "f1" });
  });

  test("required", () => {
    expect(formFieldControlAttrs({ id: "f1", required: true })).toEqual({
      id: "f1",
      "aria-required": "true",
    });
  });
});