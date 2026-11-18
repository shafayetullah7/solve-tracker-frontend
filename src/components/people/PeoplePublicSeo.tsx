import { Link, Meta, Title } from "@solidjs/meta";
import { Show } from "solid-js";
import { discoverCopy } from "../../lib/discover/copy";
import { formatHandleLabel } from "../../lib/auth/user-handle";
import type { PersonHeader } from "../../lib/api/modules/people.api";
import { absolutePublicPeopleProfileUrl, publicPeopleProfilePath } from "../../lib/people/paths";
import { absoluteSitePath } from "../../lib/site/public-origin";
import { LANDING_SEO } from "../landing/landing-copy";

const GOAL_LABELS: Record<NonNullable<PersonHeader["practiceGoal"]>, string> = {
  interview: "Interview prep",
  contests: "Contests",
  fundamentals: "Fundamentals",
  coaching: "Coaching",
};

export type PeoplePublicSeoProps = {
  profile: PersonHeader | undefined;
};

export function PeoplePublicSeo(props: PeoplePublicSeoProps) {
  const title = () =>
    props.profile
      ? `${formatHandleLabel(props.profile.handle)} · Practice`
      : discoverCopy("public.unavailableTitle");
  const description = () => {
    const p = props.profile;
    if (!p) return discoverCopy("unavailable.profileBody");
    const goal = p.practiceGoal ? GOAL_LABELS[p.practiceGoal] : undefined;
    const parts = [
      p.name,
      `${p.overall.solved} solved`,
      ...(goal ? [goal] : []),
    ];
    return parts.join(" · ");
  };
  const canonical = () =>
    props.profile
      ? absolutePublicPeopleProfileUrl(props.profile.handle)
      : undefined;
  const image = () =>
    props.profile?.avatarUrl ?? absoluteSitePath(LANDING_SEO.ogImagePath);

  return (
    <>
      <Title>{title()}</Title>
      <Meta name="description" content={description()} />
      <Meta name="robots" content="noindex, nofollow" />
      <Show when={canonical()}>
        {(href) => <Link rel="canonical" href={href()} />}
      </Show>
      <Meta property="og:type" content="profile" />
      <Meta property="og:title" content={title()} />
      <Meta property="og:description" content={description()} />
      <Show when={canonical()}>
        {(href) => <Meta property="og:url" content={href()} />}
      </Show>
      <Show when={image()}>
        {(src) => <Meta property="og:image" content={src()} />}
      </Show>
      <Show when={props.profile}>
        {(p) => (
          <Meta
            property="og:site_name"
            content={publicPeopleProfilePath(p().handle)}
          />
        )}
      </Show>
    </>
  );
}