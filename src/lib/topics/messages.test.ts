import { describe, expect, test } from "vitest";
import { ApiError } from "../api/errors";
import { topicFieldErrors, topicFormMessage } from "./messages";

describe("topic messages", () => {
  test("topicFormMessage codes", () => {
    expect(topicFormMessage(new ApiError("http", "x", 409, "TOPIC_NAME_IN_USE"))).toMatch(
      /already have a topic/i,
    );
    expect(topicFormMessage(new ApiError("http", "x", 404, "NOT_FOUND"))).toMatch(
      /not found/i,
    );
    expect(topicFormMessage(new ApiError("network", "x"))).toMatch(/unavailable/i);
  });

  test("topicFieldErrors", () => {
    expect(topicFieldErrors({ name: "Too long" })).toEqual({ name: "Too long" });
  });
});