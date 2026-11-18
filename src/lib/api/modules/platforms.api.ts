import type { ApiClient } from "../client";
import { ApiError } from "../errors";
import type { operations } from "../generated/backend";
import { isKnownCatalogSlug } from "../../platforms/platform-slugs";

export type PlatformCatalogItem =
  operations["PlatformsController_list"]["responses"][200]["content"]["application/json"]["items"][number];
export type PlatformListResponse =
  operations["PlatformsController_list"]["responses"][200]["content"]["application/json"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function decodePlatformCatalogItem(value: unknown): PlatformCatalogItem {
  if (!isRecord(value))
    throw new ApiError("contract", "Invalid platform catalog item.");
  const { slug, name, baseUrl, urlHosts } = value;
  if (
    typeof slug !== "string" ||
    !slug ||
    typeof name !== "string" ||
    !name ||
    typeof baseUrl !== "string" ||
    !baseUrl
  )
    throw new ApiError("contract", "Invalid platform catalog item.");
  if (!isKnownCatalogSlug(slug))
    throw new ApiError("contract", "Invalid platform catalog item.");
  if (!Array.isArray(urlHosts) || urlHosts.length < 1)
    throw new ApiError("contract", "Invalid platform catalog item.");
  for (const host of urlHosts) {
    if (typeof host !== "string" || !host)
      throw new ApiError("contract", "Invalid platform catalog item.");
  }
  return {
    slug,
    name,
    baseUrl,
    urlHosts: [...urlHosts],
  };
}

function decodePlatformList(value: unknown): PlatformListResponse {
  if (!isRecord(value) || !Array.isArray(value.items))
    throw new ApiError("contract", "Invalid platform list response.");
  return {
    items: value.items.map(decodePlatformCatalogItem),
  };
}

export function createPlatformsApi(client: ApiClient) {
  return {
    async listPlatforms(signal?: AbortSignal): Promise<PlatformListResponse> {
      return decodePlatformList(
        await client.request({
          path: "/platforms",
          signal,
          recoverAuth: false,
        }),
      );
    },
  };
}