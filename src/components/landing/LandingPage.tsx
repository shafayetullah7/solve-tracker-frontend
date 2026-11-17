import { LandingCta } from "./LandingCta";
import { LandingFeatures } from "./LandingFeatures";
import { LandingHero } from "./LandingHero";
import { LandingHowItWorks } from "./LandingHowItWorks";
import { LandingPlatforms } from "./LandingPlatforms";
import { LandingPrivacy } from "./LandingPrivacy";

export function LandingPage() {
  return (
    <div class="flex flex-col gap-14 py-8 sm:gap-16 sm:py-10 lg:py-12 [&>section+section]:border-t [&>section+section]:border-line [&>section+section]:pt-14 sm:[&>section+section]:pt-16">
      <LandingHero />
      <LandingHowItWorks />
      <LandingFeatures />
      <LandingPlatforms />
      <LandingPrivacy />
      <LandingCta />
    </div>
  );
}