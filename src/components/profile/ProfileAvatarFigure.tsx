import { IconEdit } from "../../icons";

export type ProfileAvatarFigureProps = {
  avatarUrl?: string;
  avatarInitials: string;
  onEditPhoto?: () => void;
};

export function ProfileAvatarFigure(props: ProfileAvatarFigureProps) {
  return (
    <div class="relative mx-auto shrink-0 md:mx-0">
      {props.avatarUrl ? (
        <img
          class="size-28 rounded-full object-cover ring-2 ring-line md:size-32"
          src={props.avatarUrl}
          alt=""
          width={128}
          height={128}
        />
      ) : (
        <span
          class="flex size-28 items-center justify-center rounded-full bg-brand-soft text-2xl font-semibold text-brand ring-2 ring-line md:size-32"
          aria-hidden="true"
        >
          {props.avatarInitials}
        </span>
      )}
      {props.onEditPhoto ? (
        <button
          type="button"
          class="absolute bottom-0 right-0 flex min-h-9 min-w-9 items-center justify-center rounded-full border border-line bg-surface text-ink shadow-panel ring-2 ring-surface transition-colors hover:bg-surface-muted md:bottom-0.5 md:right-0.5"
          aria-label="Change profile photo"
          onClick={() => props.onEditPhoto?.()}
        >
          <IconEdit class="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}