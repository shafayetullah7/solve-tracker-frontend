import type { FieldErrors } from "./field-errors";

function isValidationIssue(
  value: unknown,
): value is { path?: unknown; message?: unknown } {
  return typeof value === "object" && value !== null;
}

function fieldKeyFromPath(path: unknown): string | undefined {
  if (!Array.isArray(path) || path.length === 0) return undefined;
  const last = path[path.length - 1];
  if (typeof last !== "string" || last.length === 0) return undefined;
  return last;
}

function mapRecordDetails(details: Record<string, unknown>): FieldErrors {
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

function mapIssueArray(details: unknown[]): FieldErrors {
  const out: FieldErrors = {};
  for (const item of details) {
    if (!isValidationIssue(item)) continue;
    if (typeof item.message !== "string" || item.message.length === 0) continue;
    const key = fieldKeyFromPath(item.path);
    if (!key || key in out) continue;
    out[key] = item.message;
  }
  return out;
}

/** Map `ApiError.details` from pipe issues or service field records to form field keys. */
export function mapApiFieldErrors(details: unknown): FieldErrors {
  if (details == null) return {};
  if (Array.isArray(details)) return mapIssueArray(details);
  if (typeof details !== "object") return {};
  return mapRecordDetails(details as Record<string, unknown>);
}