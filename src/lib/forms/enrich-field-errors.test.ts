import { describe, expect, test } from "vitest";
import { ApiError } from "../api/errors";
import {
  enrichFieldErrorsFromError,
  fieldErrorsFromApiError,
} from "./enrich-field-errors";

describe("enrichFieldErrorsFromError", () => {
  test("EMAIL_IN_USE adds email when map is empty", () => {
    const error = new ApiError("http", "in use", 409, "EMAIL_IN_USE");
    expect(enrichFieldErrorsFromError(error, {})).toEqual({
      email: "That email is already registered.",
    });
  });

  test("does not overwrite existing email from validation", () => {
    const error = new ApiError("http", "in use", 409, "EMAIL_IN_USE");
    expect(
      enrichFieldErrorsFromError(error, { email: "Invalid email format" }),
    ).toEqual({ email: "Invalid email format" });
  });

  test("PROBLEM_URL_IN_USE adds url when map is empty", () => {
    const error = new ApiError("http", "dup", 409, "PROBLEM_URL_IN_USE");
    expect(enrichFieldErrorsFromError(error, {})).toEqual({
      url: "You already saved a problem with this URL.",
    });
  });

  test("TOPIC_NAME_IN_USE adds name when map is empty", () => {
    const error = new ApiError("http", "dup", 409, "TOPIC_NAME_IN_USE");
    expect(enrichFieldErrorsFromError(error, {})).toEqual({
      name: "You already have a topic with that name.",
    });
  });
});

describe("fieldErrorsFromApiError", () => {
  test("maps pipe details and enriches", () => {
    const error = new ApiError("http", "Invalid input.", 400, "VALIDATION_ERROR", [
      { path: ["password"], message: "Password must contain 8–128 characters" },
    ]);
    expect(fieldErrorsFromApiError(error)).toEqual({
      password: "Password must contain 8–128 characters",
    });
  });

  test("non-ApiError returns empty", () => {
    expect(fieldErrorsFromApiError(new Error("x"))).toEqual({});
  });
});