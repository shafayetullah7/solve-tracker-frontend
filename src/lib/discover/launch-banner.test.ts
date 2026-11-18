import { afterEach, describe, expect, it } from "vitest";
import {
  dismissLaunchBanner,
  isLaunchBannerDismissed,
  LAUNCH_BANNER_STORAGE_KEY,
} from "./launch-banner";

describe("launch banner storage", () => {
  afterEach(() => {
    localStorage.removeItem(LAUNCH_BANNER_STORAGE_KEY);
  });

  it("starts visible until dismissed", () => {
    expect(isLaunchBannerDismissed()).toBe(false);
    dismissLaunchBanner();
    expect(isLaunchBannerDismissed()).toBe(true);
  });
});