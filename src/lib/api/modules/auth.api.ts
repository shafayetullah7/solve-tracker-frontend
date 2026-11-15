import type { ApiClient } from "../client";
import { ApiError } from "../errors";
import type { operations } from "../generated/backend";

type JsonInput<
  T extends { requestBody: { content: { "application/json": unknown } } },
> = T["requestBody"]["content"]["application/json"];
export type RegisterInput = JsonInput<operations["AuthController_register"]>;
export type LoginInput = JsonInput<operations["AuthController_login"]>;
export type ForgotPasswordInput = JsonInput<
  operations["AuthController_forgot"]
>;
export type ResetPasswordInput = JsonInput<operations["AuthController_reset"]>;
export type SessionResponse =
  operations["AuthController_session"]["responses"][200]["content"]["application/json"];
export type ForgotPasswordResponse =
  operations["AuthController_forgot"]["responses"][202]["content"]["application/json"];
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function session(value: unknown): SessionResponse {
  if (
    !isRecord(value) ||
    !isRecord(value.user) ||
    typeof value.user.id !== "string" ||
    typeof value.user.name !== "string" ||
    typeof value.user.email !== "string"
  )
    throw new ApiError("contract", "Invalid session response.");
  return {
    user: { id: value.user.id, name: value.user.name, email: value.user.email },
  };
}
// Every auth operation explicitly disables recovery, including the coordinator's
// read-only session probe. Phase 4 injects a recovery-disabled client instance.
export function createAuthApi(client: ApiClient) {
  const send = (path: string, body?: unknown, signal?: AbortSignal) =>
    client.request({
      path: `/auth/${path}`,
      method: "POST",
      body,
      signal,
      recoverAuth: false,
    });
  return {
    async register(input: RegisterInput, signal?: AbortSignal) {
      return session(await send("register", input, signal));
    },
    async login(input: LoginInput, signal?: AbortSignal) {
      return session(await send("login", input, signal));
    },
    async getSession(signal?: AbortSignal) {
      return session(
        await client.request({
          path: "/auth/session",
          signal,
          recoverAuth: false,
        }),
      );
    },
    async refresh(signal?: AbortSignal) {
      return session(await send("refresh", undefined, signal));
    },
    async logout(signal?: AbortSignal): Promise<void> {
      await client.request({
        path: "/auth/logout",
        method: "POST",
        response: "empty",
        signal,
        recoverAuth: false,
      });
    },
    async forgotPassword(
      input: ForgotPasswordInput,
      signal?: AbortSignal,
    ): Promise<ForgotPasswordResponse> {
      const value = await send("forgot-password", input, signal);
      if (!isRecord(value) || typeof value.message !== "string")
        throw new ApiError("contract", "Invalid password recovery response.");
      return { message: value.message };
    },
    async resetPassword(
      input: ResetPasswordInput,
      signal?: AbortSignal,
    ): Promise<void> {
      await client.request({
        path: "/auth/reset-password",
        method: "POST",
        body: input,
        response: "empty",
        signal,
        recoverAuth: false,
      });
    },
  };
}
