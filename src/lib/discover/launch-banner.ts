export const LAUNCH_BANNER_STORAGE_KEY = "discover.launch-banner.v1";

export function isLaunchBannerDismissed(): boolean {
  if (typeof localStorage === "undefined") return true;
  return localStorage.getItem(LAUNCH_BANNER_STORAGE_KEY) === "1";
}

export function dismissLaunchBanner(): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(LAUNCH_BANNER_STORAGE_KEY, "1");
}