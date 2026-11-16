import { describe, expect, test } from "vitest";
import { TOPIC_MSG, validateTopicName } from "./validate-topic";

describe("validateTopicName", () => {
  test("empty after trim", () => {
    expect(validateTopicName({ name: "   " })).toEqual({ name: TOPIC_MSG.empty });
  });

  test("too long", () => {
    expect(validateTopicName({ name: "x".repeat(101) })).toEqual({
      name: TOPIC_MSG.tooLong,
    });
  });

  test("valid", () => {
    expect(validateTopicName({ name: "Graphs" })).toEqual({});
  });
});