import { describe, expect, test, vi } from "vitest";
import { createTopicsApi } from "./topics.api";
import { ApiError } from "../errors";

const topic = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "Arrays",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("typed topics API", () => {
  test("lists topics with pagination and recovery enabled", async () => {
    const request = vi.fn().mockResolvedValue({
      items: [topic],
      meta: { page: 2, pageSize: 10, total: 1 },
    });
    const result = await createTopicsApi({ request }).list({
      page: 2,
      pageSize: 10,
    });
    expect(result).toEqual({
      items: [topic],
      meta: { page: 2, pageSize: 10, total: 1 },
    });
    expect(request).toHaveBeenCalledWith({
      path: "/topics",
      query: { page: 2, pageSize: 10 },
      signal: undefined,
      recoverAuth: true,
    });
  });

  test("creates and decodes a topic without extra fields", async () => {
    const request = vi.fn().mockResolvedValue({ ...topic, userId: "hidden" });
    expect(
      await createTopicsApi({ request }).create({ name: "Arrays" }),
    ).toEqual(topic);
    expect(request.mock.calls[0][0]).toMatchObject({
      path: "/topics",
      method: "POST",
      recoverAuth: true,
    });
  });

  test("rejects invalid list payloads", async () => {
    await expect(
      createTopicsApi({
        request: vi.fn().mockResolvedValue({ items: [], meta: { page: 1 } }),
      }).list(),
    ).rejects.toMatchObject({ kind: "contract" });
  });

  test("rejects invalid topic ids before calling transport", async () => {
    const request = vi.fn();
    const api = createTopicsApi({ request });
    await expect(api.rename("not-a-uuid", { name: "X" })).rejects.toThrow(
      ApiError,
    );
    await expect(api.delete("not-a-uuid")).rejects.toThrow(ApiError);
    expect(request).not.toHaveBeenCalled();
  });

  test("rename and delete enable auth recovery", async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce(topic)
      .mockResolvedValueOnce(undefined);
    const id = topic.id;
    await createTopicsApi({ request }).rename(id, { name: "Greedy" });
    await createTopicsApi({ request }).delete(id);
    expect(request.mock.calls[0][0]).toMatchObject({
      path: `/topics/${id}`,
      method: "PATCH",
      recoverAuth: true,
    });
    expect(request.mock.calls[1][0]).toMatchObject({
      path: `/topics/${id}`,
      method: "DELETE",
      recoverAuth: true,
    });
  });
});