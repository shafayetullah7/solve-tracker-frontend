import type { ApiClient } from "../client";
import { ApiError } from "../errors";
import type { operations } from "../generated/backend";

type Greeting =
  operations["AppController_getHello"]["responses"][200]["content"]["text/plain"];

// Only an existing scaffold endpoint. Product modules arrive with their APIs.
export function createSystemApi(client: ApiClient) {
  return {
    async getGreeting(signal?: AbortSignal): Promise<Greeting> {
      const value = await client.request({
        path: "/",
        response: "text",
        signal,
      });
      if (typeof value !== "string")
        throw new ApiError("contract", "Expected a text greeting.");
      return value;
    },
  };
}
