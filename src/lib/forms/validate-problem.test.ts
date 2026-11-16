import { describe, expect, test } from "vitest";
import { PROBLEM_TITLE_MAX, PROBLEM_URL_MAX } from "../problems/fields";
import { PROBLEM_MSG, validateProblemDraft } from "./validate-problem";

describe("validateProblemDraft", () => {
  const base = {
    title: "Two Sum",
    url: "https://leetcode.com/problems/two-sum/",
    platformProblemId: "",
    difficulty: "",
    rating: "",
    notes: "",
  };

  test("empty url", () => {
    expect(validateProblemDraft({ ...base, url: "   " }).url).toBe(
      PROBLEM_MSG.urlEmpty,
    );
  });

  test("unsupported scheme", () => {
    expect(validateProblemDraft({ ...base, url: "ftp://example.com/x" }).url).toBe(
      PROBLEM_MSG.urlScheme,
    );
  });

  test("overlong title", () => {
    const title = "x".repeat(PROBLEM_TITLE_MAX + 1);
    expect(validateProblemDraft({ ...base, title }).title).toBe(PROBLEM_MSG.titleTooLong);
  });

  test("junk rating", () => {
    expect(validateProblemDraft({ ...base, rating: "abc" }).rating).toBe(
      PROBLEM_MSG.ratingInvalid,
    );
  });

  test("emoji counts as one code point for title length", () => {
    const title = "😀".repeat(PROBLEM_TITLE_MAX);
    expect(validateProblemDraft({ ...base, title }).title).toBeUndefined();
    expect(
      validateProblemDraft({ ...base, title: "😀".repeat(PROBLEM_TITLE_MAX + 1) }).title,
    ).toBe(PROBLEM_MSG.titleTooLong);
  });

  test("url max length", () => {
    const path = "a".repeat(PROBLEM_URL_MAX);
    expect(
      validateProblemDraft({
        ...base,
        url: `https://e.com/${path}`,
      }).url,
    ).toBe(PROBLEM_MSG.urlTooLong);
  });
});