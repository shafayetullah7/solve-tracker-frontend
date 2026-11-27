import { describe, expect, test } from "vitest";
import {
  learningEditPath,
  learningStudyPath,
} from "./paths";

const guideId = "550e8400-e29b-41d4-a716-446655440000";
const nodeId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

describe("learning paths", () => {
  test("study and edit deep links", () => {
    expect(learningStudyPath(guideId, nodeId)).toBe(
      `/app/learning/${guideId}/study/${nodeId}`,
    );
    expect(learningEditPath(guideId, nodeId)).toBe(
      `/app/learning/${guideId}/edit/${nodeId}`,
    );
  });

  test("rejects invalid node ids", () => {
    expect(() => learningStudyPath(guideId, "not-uuid")).toThrow();
  });
});