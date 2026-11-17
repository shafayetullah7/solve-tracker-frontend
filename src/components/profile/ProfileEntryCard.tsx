import { Show, type ParentProps } from "solid-js";
import { IconEdit, IconTrash } from "../../icons";
import { ProfileIconAction } from "./ProfileIconAction";

export type ProfileEntryCardProps = ParentProps<{
  primary: string;
  secondary?: string;
  meta?: string;
  onEdit: () => void;
  editLabel: string;
  onDelete?: () => void;
  deleteLabel?: string;
}>;

export function ProfileEntryCard(props: ProfileEntryCardProps) {
  return (
    <article class="flex gap-3 rounded-control border border-line bg-canvas p-4">
      <div class="min-w-0 flex-1 space-y-1">
        <h3 class="text-body font-medium text-ink">{props.primary}</h3>
        {props.secondary ? (
          <p class="text-label text-muted">{props.secondary}</p>
        ) : null}
        {props.meta ? (
          <p class="text-caption text-muted tabular-nums">{props.meta}</p>
        ) : null}
        {props.children}
      </div>
      <div class="flex shrink-0 items-start">
        <ProfileIconAction label={props.editLabel} onClick={() => props.onEdit()}>
          <IconEdit class="h-5 w-5" />
        </ProfileIconAction>
        <Show when={props.onDelete}>
          <ProfileIconAction
            label={props.deleteLabel ?? "Remove entry"}
            class="hover:bg-danger-soft hover:text-danger"
            onClick={() => props.onDelete!()}
          >
            <IconTrash class="h-5 w-5" />
          </ProfileIconAction>
        </Show>
      </div>
    </article>
  );
}