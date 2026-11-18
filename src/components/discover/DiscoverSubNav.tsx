import { useLocation } from "@solidjs/router";
import { discoverCopy } from "../../lib/discover/copy";
import {
  discoverForYouPath,
  discoverPeoplePath,
  discoverTopicsPath,
} from "../../lib/discover/paths";

export function DiscoverSubNav() {
  const location = useLocation();
  const path = () => location.pathname.replace(/\/$/, "");

  return (
    <nav class="flex gap-2 border-b border-line pb-2" aria-label="Discover">
      <a
        class={[
          "min-h-11 rounded-control px-3 py-2 text-label font-medium",
          path() === discoverForYouPath() ? "bg-brand-soft text-brand" : "text-muted hover:text-ink",
        ]}
        href={discoverForYouPath()}
        aria-current={path() === discoverForYouPath() ? "page" : undefined}
      >
        {discoverCopy("nav.forYou")}
      </a>
      <a
        class={[
          "min-h-11 rounded-control px-3 py-2 text-label font-medium",
          path() === discoverPeoplePath() ? "bg-brand-soft text-brand" : "text-muted hover:text-ink",
        ]}
        href={discoverPeoplePath()}
        aria-current={path() === discoverPeoplePath() ? "page" : undefined}
      >
        {discoverCopy("nav.people")}
      </a>
      <a
        class={[
          "min-h-11 rounded-control px-3 py-2 text-label font-medium",
          path() === discoverTopicsPath() || path().startsWith(`${discoverTopicsPath()}/`)
            ? "bg-brand-soft text-brand"
            : "text-muted hover:text-ink",
        ]}
        href={discoverTopicsPath()}
        aria-current={
          path() === discoverTopicsPath() || path().startsWith(`${discoverTopicsPath()}/`)
            ? "page"
            : undefined
        }
      >
        {discoverCopy("nav.topics")}
      </a>
    </nav>
  );
}