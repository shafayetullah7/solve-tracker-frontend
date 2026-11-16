import { describe, expect, test } from "vitest";
import { ApiError } from "../api/errors";
import {
  applyProblemApiError,
  applyTopicApiError,
} from "./apply-product-api-error";

describe("applyProblemApiError", () => {
  test("VALIDATION_ERROR with url field suppresses banner", () => {
    const error = new ApiError("http", "Problem URL must use http or https.", 400, "VALIDATION_ERROR", {
      url: "Problem URL must use http or https.",
    });
    const result = applyProblemApiError(error);
    expect(result.fieldErrors.url).toBe("Problem URL must use http or https.");
    expect(result.banner).toBeUndefined();
  });

  test("PROBLEM_URL_IN_USE sets url field and banner", () => {
    const id = "550e8400-e29b-41d4-a716-446655440000";
    const result = applyProblemApiError(
      new ApiError("http", "dup", 409, "PROBLEM_URL_IN_USE", {
        existingProblemId: id,
      }),
    );
    expect(result.fieldErrors.url).toBe(
      "You already saved a problem with this URL.",
    );
    expect(result.banner).toBe("You already saved a problem with this URL.");
    expect(result.existingProblemId).toBe(id);
  });
});

describe("applyTopicApiError", () => {
  test("TOPIC_NAME_IN_USE sets name field", () => {
    const result = applyTopicApiError(
      new ApiError("http", "dup", 409, "TOPIC_NAME_IN_USE"),
    );
    expect(result.fieldErrors.name).toBe(
      "You already have a topic with that name.",
    );
    expect(result.banner).toBe("You already have a topic with that name.");
  });
});