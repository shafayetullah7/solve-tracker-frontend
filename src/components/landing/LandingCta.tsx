import { paths } from "../../router";
import { LANDING_CTA } from "./landing-copy";

export function LandingCta() {
  return (
    <section
      class="rounded-panel border border-brand/25 bg-brand-soft px-6 py-8 text-center shadow-panel sm:px-10 sm:py-10"
      aria-labelledby="landing-cta-heading"
    >
      <h2 id="landing-cta-heading" class="text-section font-semibold tracking-tight text-ink">
        {LANDING_CTA.title}
      </h2>
      <p class="mx-auto mt-3 max-w-md text-pretty text-label leading-relaxed text-muted">
        {LANDING_CTA.description}
      </p>
      <div class="mt-7 flex flex-wrap justify-center gap-3">
        <a class="ui-button" data-variant="primary" href={paths.register()}>
          {LANDING_CTA.registerLabel}
        </a>
        <a class="ui-button" data-variant="secondary" href={paths.login()}>
          {LANDING_CTA.signInLabel}
        </a>
      </div>
    </section>
  );
}