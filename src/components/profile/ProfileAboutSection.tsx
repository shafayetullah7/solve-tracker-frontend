import { Show } from "solid-js";
import { formatHandleLabel } from "../../lib/auth/user-handle";
import type { ProfileViewModel } from "../../lib/profile/profile-view.types";
import { ProfileAvatarFigure } from "./ProfileAvatarFigure";
import { ProfileSectionShell } from "./ProfileSectionShell";

export type ProfileAboutSectionProps = Pick<
  ProfileViewModel,
  "displayName" | "handle" | "bio" | "avatarUrl" | "avatarInitials"
> & {
  email?: string;
  onEdit: () => void;
  onEditHandle?: () => void;
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
      <p
        class="mb-4 rounded-control border border-line bg-surface-muted/40 px-4 py-3 text-left text-sm text-muted leading-relaxed"
        id="profile-identity-help"
      >
        <strong class="font-medium text-ink">Name</strong> is how you appear in the app.{" "}
        <strong class="font-medium text-ink">Handle</strong> is your unique public id (shown as{" "}
        {formatHandleLabel(props.handle)}). <strong class="font-medium text-ink">Email</strong> is
        private and used only to sign in.
      </p>
      <div class="flex flex-col gap-6 md:flex-row md:items-start">
        <ProfileAvatarFigure
          avatarUrl={props.avatarUrl}
          avatarInitials={props.avatarInitials}
          onEditPhoto={props.onEditPhoto}
        />
        <div class="min-w-0 flex-1 space-y-3 text-center md:text-left">
          <div class="space-y-1">
            <p class="text-section font-semibold tracking-tight text-ink">{props.displayName}</p>
            <div class="flex flex-wrap items-center justify-center gap-2 md:justify-start">
              <p class="text-sm font-medium text-brand tabular-nums" id="profile-about-handle">
                {formatHandleLabel(props.handle)}
              </p>
              <Show when={props.onEditHandle}>
                <button
                  type="button"
                  class="text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
                  onClick={() => props.onEditHandle?.()}
                >
                  Edit handle
                </button>
              </Show>
            </div>
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