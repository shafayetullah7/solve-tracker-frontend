import { describe, expect, test } from "vitest";
import {
  LIBRARY_PAGE_SUBTITLE,
  STUDY_LINKED_PROBLEMS_HINT,
  WELCOME_BANNER_BODY,
  WELCOME_BANNER_TITLE,
} from "./learning-product-copy";

describe("learning-product-copy", () => {
  test("library subtitle mentions guides and separate metrics", () => {
    expect(LIBRARY_PAGE_SUBTITLE).toMatch(/guide/i);
    expect(LIBRARY_PAGE_SUBTITLE).toMatch(/solve streak/);
  });

  test("study hint mentions library and chart separation", () => {
    expect(STUDY_LINKED_PROBLEMS_HINT).toMatch(/library/);
    expect(STUDY_LINKED_PROBLEMS_HINT).not.toMatch(/unified/i);
  });

  test("welcome banner is non-empty", () => {
    expect(WELCOME_BANNER_TITLE.length).toBeGreaterThan(10);
    expect(WELCOME_BANNER_BODY).toMatch(/guide|problem/i);
  });
});