import type { ParentProps } from "solid-js";
import { Show } from "solid-js";
import { IconEdit, IconPlus } from "../../icons";
import { ProfileIconAction } from "./ProfileIconAction";

export type ProfileSectionShellProps = ParentProps<{
  title: string;
  description?: string;
  titleId?: string;
  onEdit?: () => void;
  editLabel?: string;
  onAdd?: () => void;
  addLabel?: string;
  toolbarHidden?: boolean;
}>;

export function ProfileSectionShell(props: ProfileSectionShellProps) {
  const titleId = () => props.titleId ?? `profile-section-${props.title.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <section
      class="rounded-panel border border-line bg-surface p-5 shadow-panel sm:p-6"
      aria-labelledby={titleId()}
    >
      <header class="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0 space-y-1">
          <h2 id={titleId()} class="text-section font-semibold tracking-tight">
            {props.title}
          </h2>
          <Show when={props.description}>
            <p class="text-label text-muted">{props.description}</p>
          </Show>
        </div>
        <Show when={!props.toolbarHidden && (props.onEdit ?? props.onAdd)}>
          <div class="flex shrink-0 items-center gap-1">
            <Show when={props.onEdit}>
              <ProfileIconAction
                label={props.editLabel ?? `Edit ${props.title.toLowerCase()}`}
                onClick={() => props.onEdit?.()}
              >
                <IconEdit class="h-5 w-5" />
              </ProfileIconAction>
            </Show>
            <Show when={props.onAdd}>
              <ProfileIconAction
                label={props.addLabel ?? `Add ${props.title.toLowerCase()} entry`}
                onClick={() => props.onAdd?.()}
              >
                <IconPlus class="h-5 w-5" />
              </ProfileIconAction>
            </Show>
          </div>
        </Show>
      </header>
      {props.children}
    </section>
  );
}