import type { ProfileViewModel } from "../../lib/profile/profile-view.types";
import { ProfileAvatarFigure } from "./ProfileAvatarFigure";
import { ProfileSectionShell } from "./ProfileSectionShell";

export type ProfileAboutSectionProps = Pick<
  ProfileViewModel,
  "displayName" | "bio" | "avatarUrl" | "avatarInitials"
> & {
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
          <p class="text-section font-semibold tracking-tight text-ink">{props.displayName}</p>
          <p class="text-body leading-7 text-muted whitespace-pre-wrap">{props.bio}</p>
        </div>
      </div>
    </ProfileSectionShell>
  );
}