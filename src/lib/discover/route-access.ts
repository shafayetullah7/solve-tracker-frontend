import { isDiscoverFullEnabled, isDiscoverSharingEnabled } from "./flag";

export function shouldBlockDiscoverAppRoute(pathname: string): boolean {
  const path = pathname.replace(/\/$/, "") || pathname;
  if (!path.startsWith("/app/discover")) return false;
  return !isDiscoverFullEnabled();
}

export function shouldBlockPeopleRoute(
  pathname: string,
  viewerHandle: string | undefined,
  routeHandle: string,
): boolean {
  if (!isDiscoverSharingEnabled()) return true;
  if (isDiscoverFullEnabled()) return false;
  if (!viewerHandle) return true;
  return routeHandle.trim().toLowerCase() !== viewerHandle.trim().toLowerCase();
}