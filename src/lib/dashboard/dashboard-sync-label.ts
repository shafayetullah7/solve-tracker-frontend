import type { PlatformProgress } from "../api/modules/progress.api";

/** Short header line from platforms with problems in the library. */
export function dashboardSyncLabel(platforms: PlatformProgress[]): string {
  if (platforms.length === 0) return "No platforms in library yet";
  const names = platforms.slice(0, 2).map((p) => p.name);
  const extra = platforms.length > 2 ? ` +${platforms.length - 2}` : "";
  return `Platforms: ${names.join(" & ")}${extra}`;
}