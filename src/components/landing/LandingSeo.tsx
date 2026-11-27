import { Link, Meta, Script, Title } from "@solidjs/meta";
import { Show } from "solid-js";
import { absoluteSitePath } from "../../lib/site/public-origin";
import { LANDING_SEO } from "./landing-copy";

export function buildLandingJsonLd() {
  const url = absoluteSitePath("/");
  const image = absoluteSitePath(LANDING_SEO.ogImagePath);
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: LANDING_SEO.jsonLd.name,
    description: LANDING_SEO.description,
    applicationCategory: LANDING_SEO.jsonLd.applicationCategory,
    operatingSystem: "Web",
    ...(url ? { url } : {}),
    ...(image ? { image } : {}),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

/** SSR-safe head tags for the marketing home page. */
export function LandingSeo() {
  const canonical = () => absoluteSitePath("/");
  const ogImage = () => absoluteSitePath(LANDING_SEO.ogImagePath);

  return (
    <>
      <Title>{LANDING_SEO.title}</Title>
      <Meta name="description" content={LANDING_SEO.description} />
      <Meta name="robots" content="index, follow" />
      <Show when={canonical()}>
        {(href) => <Link rel="canonical" href={href()} />}
      </Show>
        <Meta property="og:type" content="website" />
        <Meta property="og:site_name" content={LANDING_SEO.siteName} />
        <Meta property="og:locale" content="en_US" />
        <Meta property="og:title" content={LANDING_SEO.title} />
        <Meta property="og:description" content={LANDING_SEO.description} />
        <Show when={canonical()}>
          {(href) => <Meta property="og:url" content={href()} />}
        </Show>
        <Show when={ogImage()}>
          {(src) => (
            <>
              <Meta property="og:image" content={src()} />
              <Meta property="og:image:width" content={String(LANDING_SEO.ogImageWidth)} />
              <Meta property="og:image:height" content={String(LANDING_SEO.ogImageHeight)} />
              <Meta property="og:image:alt" content={LANDING_SEO.ogImageAlt} />
            </>
          )}
        </Show>
        <Meta name="twitter:card" content="summary_large_image" />
        <Meta name="twitter:title" content={LANDING_SEO.title} />
        <Meta name="twitter:description" content={LANDING_SEO.description} />
        <Show when={ogImage()}>
          {(src) => (
            <>
              <Meta name="twitter:image" content={src()} />
              <Meta name="twitter:image:alt" content={LANDING_SEO.ogImageAlt} />
            </>
          )}
        </Show>
      <Script type="application/ld+json">{JSON.stringify(buildLandingJsonLd())}</Script>
    </>
  );
}