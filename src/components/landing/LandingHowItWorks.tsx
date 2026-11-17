import { For } from "solid-js";
import { LANDING_HOW_IT_WORKS } from "./landing-copy";
import { LandingSectionHeader } from "./LandingSectionHeader";

export function LandingHowItWorks() {
  return (
    <section class="space-y-8" aria-labelledby="landing-steps-heading">
      <LandingSectionHeader
        id="landing-steps-heading"
        title={LANDING_HOW_IT_WORKS.title}
        subtitle={LANDING_HOW_IT_WORKS.subtitle}
      />
      <ol class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        <For each={[...LANDING_HOW_IT_WORKS.steps]}>
          {(step, index) => (
            <li class="flex h-full flex-col rounded-panel border border-line bg-surface p-5 shadow-panel sm:p-6">
              <div class="mb-3 flex items-center gap-3">
                <span
                  class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-caption font-semibold tabular-nums text-brand"
                  aria-hidden="true"
                >
                  {index() + 1}
                </span>
                <p class="text-label font-semibold text-ink">{step.title}</p>
              </div>
              <p class="text-label leading-relaxed text-muted">{step.body}</p>
            </li>
          )}
        </For>
      </ol>
    </section>
  );
}