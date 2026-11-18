import { describe, expect, test, vi } from "vitest";
import { ApiError } from "../errors";
import {
  createPeopleApi,
  decodePersonHeader,
  decodePublicTopicHeader,
} from "./people.api";

const profile = {
  handle: "demo-topics",
  name: "demo-topics",
  bio: "",
  practiceGoal: "contests" as const,
  overall: { total: 2, solved: 1, unsolved: 1 },
  streak: { currentDays: 1, lastSolveDate: "2026-01-01" },
  platforms: [
    {
      slug: "leetcode" as const,
      name: "LeetCode",
      total: 2,
      solved: 1,
      unsolved: 1,
    },
  ],
  practicingSince: "Jan 2026",
};

describe("people API", () => {
  test("getProfile decodes 200", async () => {
    const request = vi.fn().mockResolvedValue(profile);
    const result = await createPeopleApi({ request }).getProfile("demo-topics");
    expect(result).toEqual({ ok: true, data: profile });
    expect(request).toHaveBeenCalledWith({
      path: "/people/demo-topics",
      signal: undefined,
      recoverAuth: true,
    });
  });

  test("maps PROFILE_NOT_FOUND to unavailable", async () => {
    const request = vi.fn().mockRejectedValue(
      new ApiError("http", "missing", 404, "PROFILE_NOT_FOUND"),
    );
    const result = await createPeopleApi({ request }).getProfile("missing");
    expect(result).toEqual({ ok: false, reason: "unavailable" });
  });

  test("rethrows other http errors", async () => {
    const err = new ApiError("http", "rate", 429, "RATE_LIMITED");
    await expect(
      createPeopleApi({ request: vi.fn().mockRejectedValue(err) }).getProfile(
        "x",
      ),
    ).rejects.toBe(err);
  });

  test("decodePersonHeader rejects malformed payload", () => {
    expect(() => decodePersonHeader({ name: "x" })).toThrowError(
      expect.objectContaining({ kind: "contract" }),
    );
  });

  test("decodePublicTopicHeader requires six histogram buckets", () => {
    expect(() =>
      decodePublicTopicHeader({
        name: "DP",
        description: "",
        ownerCompletion: { total: 1, solved: 0, unsolved: 1, percentComplete: 0 },
        copies30d: 0,
        difficultyHistogram: [0, 0, 0, 0, 0],
      }),
    ).toThrowError(expect.objectContaining({ kind: "contract" }));
  });
});