import { For } from "solid-js";
import { Panel } from "../ui/Panel";
import { LANDING_FEATURES } from "./landing-copy";
import { LandingSectionHeader } from "./LandingSectionHeader";

export function LandingFeatures() {
  return (
    <section class="space-y-8" aria-labelledby="landing-features-heading">
      <LandingSectionHeader id="landing-features-heading" title={LANDING_FEATURES.title} />
      <div class="grid gap-5 md:grid-cols-3 md:gap-6">
        <For each={[...LANDING_FEATURES.items]}>
          {(item) => (
            <div class="h-full border-t-2 border-brand pt-1">
              <Panel title={item.title} description={item.description} />
            </div>
          )}
        </For>
      </div>
    </section>
  );
}