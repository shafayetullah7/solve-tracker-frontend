import { describe, expect, test, vi } from "vitest";
import { createPlatformsApi } from "./platforms.api";
import { ApiError } from "../errors";

const leetcodeItem = {
  slug: "leetcode",
  name: "LeetCode",
  baseUrl: "https://leetcode.com",
  urlHosts: ["leetcode.com"],
} as const;

describe("typed platforms API", () => {
  test("lists platforms with recovery disabled", async () => {
    const request = vi.fn().mockResolvedValue({ items: [leetcodeItem] });
    const controller = new AbortController();
    const result = await createPlatformsApi({ request }).listPlatforms(
      controller.signal,
    );
    expect(result).toEqual({ items: [leetcodeItem] });
    expect(request).toHaveBeenCalledWith({
      path: "/platforms",
      signal: controller.signal,
      recoverAuth: false,
    });
  });

  test("rejects invalid list payloads", async () => {
    await expect(
      createPlatformsApi({
        request: vi.fn().mockResolvedValue({}),
      }).listPlatforms(),
    ).rejects.toBeInstanceOf(ApiError);
    await expect(
      createPlatformsApi({
        request: vi.fn().mockResolvedValue({
          items: [{ ...leetcodeItem, urlHosts: [] }],
        }),
      }).listPlatforms(),
    ).rejects.toMatchObject({ kind: "contract" });
    await expect(
      createPlatformsApi({
        request: vi.fn().mockResolvedValue({
          items: [{ ...leetcodeItem, slug: "not-a-catalog-slug" }],
        }),
      }).listPlatforms(),
    ).rejects.toMatchObject({ kind: "contract" });
  });
});