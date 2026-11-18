import { createEffect, createSignal, Show } from "solid-js";
import { discoverCopy } from "../../lib/discover/copy";
import { isDiscoverFullEnabled } from "../../lib/discover/flag";
import { discoverForYouPath } from "../../lib/discover/paths";
import {
  dismissLaunchBanner,
  isLaunchBannerDismissed,
} from "../../lib/discover/launch-banner";
import { Button } from "../ui/Button";

export function DiscoverLaunchBanner() {
  const [visible, setVisible] = createSignal(false);

  createEffect(
    () => isDiscoverFullEnabled(),
    (enabled) => {
      if (!enabled) return;
      setVisible(!isLaunchBannerDismissed());
    },
  );

  function dismiss() {
    dismissLaunchBanner();
    setVisible(false);
  }

  return (
    <Show when={visible()}>
      <section
        class="flex flex-col gap-3 rounded-card border border-line bg-surface-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between"
        aria-labelledby="discover-launch-banner"
      >
        <p id="discover-launch-banner" class="text-body text-ink">
          {discoverCopy("launch.banner")}
        </p>
        <div class="flex shrink-0 flex-wrap gap-2">
          <a href={discoverForYouPath()}>
            <Button type="button" variant="secondary">
              {discoverCopy("launch.bannerCta")}
            </Button>
          </a>
          <Button type="button" variant="secondary" onClick={dismiss}>
            Dismiss
          </Button>
        </div>
      </section>
    </Show>
  );
}