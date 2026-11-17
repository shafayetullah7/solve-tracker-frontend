import { For } from "solid-js";
import { LANDING_PRIVACY } from "./landing-copy";
import { LandingSectionHeader } from "./LandingSectionHeader";

export function LandingPrivacy() {
  return (
    <section class="space-y-6" aria-labelledby="landing-privacy-heading">
      <LandingSectionHeader id="landing-privacy-heading" title={LANDING_PRIVACY.title} />
      <ul class="divide-y divide-line rounded-panel border border-line bg-surface shadow-panel">
        <For each={[...LANDING_PRIVACY.bullets]}>
          {(bullet) => (
            <li class="flex gap-4 px-5 py-4 sm:px-6 sm:py-5">
              <span
                class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand"
                aria-hidden="true"
              />
              <span class="text-label leading-relaxed text-muted">{bullet}</span>
            </li>
          )}
        </For>
      </ul>
    </section>
  );
}