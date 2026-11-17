import { For } from "solid-js";
import { platformEntryBySlug, type PlatformSlug } from "../../lib/platforms/catalog";
import { PlatformMark } from "../platforms/PlatformMark";
import { LANDING_PLATFORMS } from "./landing-copy";
import { LandingSectionHeader } from "./LandingSectionHeader";

export function LandingPlatforms() {
  const entries = () =>
    LANDING_PLATFORMS.featuredSlugs.flatMap((slug) => {
      const entry = platformEntryBySlug(slug as PlatformSlug);
      return entry ? [entry] : [];
    });

  return (
    <section class="space-y-6" aria-labelledby="landing-platforms-heading">
      <LandingSectionHeader
        id="landing-platforms-heading"
        title={LANDING_PLATFORMS.title}
        subtitle={LANDING_PLATFORMS.subtitle}
      />
      <div class="rounded-panel border border-line bg-surface-muted/50 px-5 py-5 sm:px-7 sm:py-6">
        <ul class="flex flex-wrap items-center gap-x-8 gap-y-4">
          <For each={entries()}>
            {(entry) => (
              <li>
                <PlatformMark slug={entry.slug} label={entry.name} />
              </li>
            )}
          </For>
        </ul>
      </div>
    </section>
  );
}