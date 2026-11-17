import { Show } from "solid-js";
import type { ProfileViewModel } from "../../lib/profile/profile-view.types";
import { ProfileAvatarFigure } from "./ProfileAvatarFigure";
import { ProfileSectionShell } from "./ProfileSectionShell";

export type ProfileAboutSectionProps = Pick<
  ProfileViewModel,
  "displayName" | "bio" | "avatarUrl" | "avatarInitials"
> & {
  email?: string;
  onEdit: () => void;
  onEditPhoto: () => void;
};

export function ProfileAboutSection(props: ProfileAboutSectionProps) {
  return (
    <ProfileSectionShell
      title="About you"
      description="How you present yourself in Practice."
      titleId="profile-about-heading"
      onEdit={props.onEdit}
      editLabel="Edit about you"
    >
      <div class="flex flex-col gap-6 md:flex-row md:items-start">
        <ProfileAvatarFigure
          avatarUrl={props.avatarUrl}
          avatarInitials={props.avatarInitials}
          onEditPhoto={props.onEditPhoto}
        />
        <div class="min-w-0 flex-1 space-y-3 text-center md:text-left">
          <div class="space-y-1">
            <p class="text-section font-semibold tracking-tight text-ink">{props.displayName}</p>
            <Show when={props.email}>
              <p class="text-sm text-muted" id="profile-about-email">
                {props.email}
              </p>
            </Show>
          </div>
          <p class="text-body leading-7 text-muted whitespace-pre-wrap">{props.bio}</p>
        </div>
      </div>
    </ProfileSectionShell>
  );
}