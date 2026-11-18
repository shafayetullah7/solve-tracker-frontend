import { discoverCopy } from "../../lib/discover/copy";
import { paths } from "../../router";

export function DiscoverOptInBanner() {
  return (
    <div
      class="rounded-card border border-line bg-surface-muted px-4 py-3 text-body text-ink"
      role="status"
    >
      <p class="mb-2">{discoverCopy("discover.optInBanner")}</p>
      <a href={paths.app.profile()} class="text-label font-medium text-brand hover:underline">
        {discoverCopy("discover.optInCta")}
      </a>
    </div>
  );
}