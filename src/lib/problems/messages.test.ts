import { describe, expect, test } from "vitest";
import { ApiError } from "../api/errors";
import {
  problemExistingIdFromError,
  problemFieldErrors,
  problemFormMessage,
  problemListMessage,
} from "./messages";

describe("problem messages", () => {
  test("problemListMessage codes", () => {
    expect(problemListMessage(new ApiError("http", "x", 404, "NOT_FOUND"))).toMatch(
      /topic filter/i,
    );
    expect(problemListMessage(new ApiError("network", "x"))).toMatch(/unavailable/i);
  });

  test("problemFormMessage NOT_FOUND vs list", () => {
    const err = new ApiError("http", "missing", 404, "NOT_FOUND");
    expect(problemListMessage(err)).toMatch(/topic filter/i);
    expect(problemFormMessage(err)).toMatch(/Problem was not found/i);
  });

  test("problemFormMessage PROBLEM_URL_IN_USE", () => {
    expect(
      problemFormMessage(new ApiError("http", "dup", 409, "PROBLEM_URL_IN_USE")),
    ).toMatch(/already saved/i);
  });

  test("problemFieldErrors maps strings", () => {
    expect(
      problemFieldErrors({ title: "Too short", url: "Invalid URL" }),
    ).toEqual({ title: "Too short", url: "Invalid URL" });
  });

  test("problemExistingIdFromError", () => {
    const id = "11111111-1111-4111-8111-111111111111";
    expect(
      problemExistingIdFromError(
        new ApiError("http", "dup", 409, "PROBLEM_URL_IN_USE", { existingProblemId: id }),
      ),
    ).toBe(id);
    expect(
      problemExistingIdFromError(new ApiError("http", "dup", 409, "PROBLEM_URL_IN_USE")),
    ).toBeUndefined();
  });
});