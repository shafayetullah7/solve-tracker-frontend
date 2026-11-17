import { PracticeMark } from "../brand/PracticeMark";
import { paths } from "../../router";
import { LANDING_HERO } from "./landing-copy";
import { LandingLibraryPreview } from "./LandingLibraryPreview";

export function LandingHero() {
  return (
    <section
      class="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-14"
      aria-labelledby="landing-hero-heading"
    >
      <div class="space-y-7">
        <PracticeMark class="h-11 w-11 text-brand" aria-hidden="true" />
        <h1
          id="landing-hero-heading"
          class="max-w-xl text-balance text-page font-semibold tracking-tight text-ink"
        >
          {LANDING_HERO.title}
        </h1>
        <p class="max-w-xl text-pretty text-body leading-7 text-muted">{LANDING_HERO.subtitle}</p>
        <div class="flex flex-wrap gap-3 pt-1">
          <a class="ui-button" data-variant="primary" href={paths.register()}>
            {LANDING_HERO.registerLabel}
          </a>
          <a class="ui-button" data-variant="secondary" href={paths.login()}>
            {LANDING_HERO.signInLabel}
          </a>
        </div>
      </div>
      <div class="lg:pl-2">
        <LandingLibraryPreview />
      </div>
    </section>
  );
}