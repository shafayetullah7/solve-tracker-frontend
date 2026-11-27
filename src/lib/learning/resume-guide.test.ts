import { describe, expect, test } from "vitest";
import { resumeHrefForGuide } from "./resume-guide";

const guideId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const nodeId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

describe("resumeHrefForGuide", () => {
  test("uses resume node when set", () => {
    const result = resumeHrefForGuide(guideId, nodeId);
    expect(result.href).toBe(`/app/learning/${guideId}/study/${nodeId}`);
    expect(result.label).toBe("Continue");
  });

  test("uses first node when no resume pointer", () => {
    const result = resumeHrefForGuide(guideId, null, nodeId);
    expect(result.href).toBe(`/app/learning/${guideId}/study/${nodeId}`);
    expect(result.label).toBe("Continue");
  });

  test("falls back to overview", () => {
    const result = resumeHrefForGuide(guideId, null, null);
    expect(result.href).toBe(`/app/learning/${guideId}`);
    expect(result.label).toBe("Open guide");
  });
});