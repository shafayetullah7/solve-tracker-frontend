import { ApiError } from "../api/errors";

export type FieldErrors = Record<string, string>;

const AUTH_ONLY_PATHS = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
]);

export function isPublicAuthPath(pathname: string): boolean {
  const path = pathname.split("?")[0] ?? "";
  return path === "/forgot-password" || path === "/reset-password";
}

function isAllowedAppPath(path: string): boolean {
  if (path === "/" || path === "/account" || path.startsWith("/account/")) return true;
  if (path === "/topics" || path.startsWith("/topics/")) return true;
  return false;
}

export function safeReturnPath(value: string | null | undefined): string | undefined {
  if (value == null || value === "") return undefined;
  const path = value.trim().split("?")[0] ?? "";
  if (!path.startsWith("/") || path.startsWith("//")) return undefined;
  if (path.includes(":")) return undefined;
  const lower = value.toLowerCase();
  if (lower.includes("http") || lower.startsWith("javascript")) return undefined;
  if (AUTH_ONLY_PATHS.has(path)) return undefined;
  if (!isAllowedAppPath(path)) return undefined;
  return path;
}

export function loginPathWithReturn(
  returnTo: string | undefined,
  loginPath: string,
): string {
  if (returnTo == null || returnTo === "") return loginPath;
  const safe = safeReturnPath(returnTo);
  if (!safe) return loginPath;
  return `${loginPath}?${new URLSearchParams({ next: safe }).toString()}`;
}

export function mapAuthFieldErrors(details: unknown): FieldErrors {
  if (typeof details !== "object" || details === null) return {};
  const out: FieldErrors = {};
  for (const [key, value] of Object.entries(details)) {
    if (typeof value === "string" && value.length > 0) out[key] = value;
    else if (Array.isArray(value)) {
      const first = value.find((item) => typeof item === "string");
      if (typeof first === "string") out[key] = first;
    }
  }
  return out;
}

export type AuthFormMessage =
  | { kind: "credentials"; message: string }
  | { kind: "email_in_use"; message: string }
  | { kind: "rate_limit"; message: string; retryAfter?: string }
  | { kind: "unavailable"; message: string }
  | { kind: "generic"; message: string };

export function authFormMessage(error: unknown): AuthFormMessage {
  if (error instanceof ApiError) {
    if (error.kind === "network" || error.kind === "timeout")
      return {
        kind: "unavailable",
        message: "The service is temporarily unavailable. Try again shortly.",
      };
    if (error.code === "INVALID_CREDENTIALS")
      return {
        kind: "credentials",
        message: "Invalid email or password.",
      };
    if (error.code === "EMAIL_IN_USE")
      return {
        kind: "email_in_use",
        message: "That email is already registered.",
      };
    if (error.code === "RATE_LIMITED")
      return {
        kind: "rate_limit",
        message: error.message || "Too many attempts. Please wait and try again.",
        retryAfter: error.retryAfter,
      };
    if (error.code === "VALIDATION_ERROR")
      return { kind: "generic", message: error.message || "Check the highlighted fields." };
    if (error.kind === "http" && error.status !== undefined && error.status >= 500)
      return {
        kind: "unavailable",
        message: "The service is temporarily unavailable. Try again shortly.",
      };
    if (error.message) return { kind: "generic", message: error.message };
  }
  return { kind: "unavailable", message: "Something went wrong. Try again." };
}

/** Parse `#token=...` from a password-reset email link. */
export function parseResetTokenFromHash(hash: string): string | undefined {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!raw) return undefined;
  const params = new URLSearchParams(raw);
  const token = params.get("token");
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return undefined;
  return token;
}

export function codePointLength(value: string): number {
  return Array.from(value).length;
}