import { Show } from "solid-js";
import type { PersonHeader } from "../../lib/api/modules/people.api";
import { PeopleFollowButton } from "./PeopleFollowButton";
import { discoverCopy } from "../../lib/discover/copy";
import { formatHandleLabel } from "../../lib/auth/user-handle";
import { peopleComparePath } from "../../lib/people/paths";
import { Button } from "../ui/Button";
import { DashboardStreakBadge } from "../dashboard/DashboardStreakBadge";

const GOAL_LABELS: Record<NonNullable<PersonHeader["practiceGoal"]>, string> = {
  interview: "Interview prep",
  contests: "Contests",
  fundamentals: "Fundamentals",
  coaching: "Coaching",
};

export type PeopleProfileHeaderProps = {
  profile: PersonHeader;
  showFollow?: boolean;
  follow?: () => Promise<void>;
  unfollow?: () => Promise<void>;
};

export function PeopleProfileHeader(props: PeopleProfileHeaderProps) {
  const streakActivity = () => ({
    weeks: [],
    streak: props.profile.streak,
    timezone: "UTC" as const,
  });

  return (
    <header class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div class="flex min-w-0 gap-4">
        <Show when={props.profile.avatarUrl}>
          {(url) => (
            <img
              src={url()}
              alt=""
              class="size-16 shrink-0 rounded-full border border-line object-cover"
            />
          )}
        </Show>
        <div class="min-w-0">
          <h1 class="text-page font-semibold tracking-tight">{props.profile.name}</h1>
          <p class="text-muted">{formatHandleLabel(props.profile.handle)}</p>
          <Show when={props.profile.bio}>
            <p class="mt-2 max-w-prose text-body">{props.profile.bio}</p>
          </Show>
          <p class="mt-2 text-sm text-muted">
            {discoverCopy("profile.practicingSince", {
              monthYear: props.profile.practicingSince,
            })}
          </p>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <a href={peopleComparePath(props.profile.handle)}>
          <Button type="button" variant="secondary">
            {discoverCopy("profile.compareWithMe")}
          </Button>
        </a>
        <Show
          when={
            props.showFollow &&
            props.follow &&
            props.unfollow &&
            props.profile.viewerFollows !== undefined
          }
        >
          <PeopleFollowButton
            handle={props.profile.handle}
            initialFollowing={props.profile.viewerFollows ?? false}
            follow={props.follow!}
            unfollow={props.unfollow!}
          />
        </Show>
        <Show when={props.profile.practiceGoal}>
          {(goal) => (
            <span class="rounded-full border border-line px-3 py-1 text-sm">
              {GOAL_LABELS[goal()]}
            </span>
          )}
        </Show>
        <DashboardStreakBadge streak={streakActivity().streak} />
      </div>
    </header>
  );
}