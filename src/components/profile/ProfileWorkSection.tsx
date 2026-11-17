import { For, Show } from "solid-js";
import type { WorkEntry } from "../../lib/profile/profile-view.types";
import { ProfileEntryCard } from "./ProfileEntryCard";
import { ProfileSectionShell } from "./ProfileSectionShell";

export type ProfileWorkSectionProps = {
  work: WorkEntry[];
  onAdd: () => void;
  onEdit: (entry: WorkEntry) => void;
};

export function ProfileWorkSection(props: ProfileWorkSectionProps) {
  return (
    <ProfileSectionShell
      title="Work"
      description="Optional roles, internships, and teams."
      titleId="profile-work-heading"
      onAdd={props.onAdd}
      addLabel="Add work entry"
    >
      <Show
        when={props.work.length > 0}
        fallback={
          <p class="text-label text-muted">
            No work added yet. Use the add button to preview the entry flow.
          </p>
        }
      >
        <ul class="space-y-3">
          <For each={props.work}>
            {(entry) => (
              <li>
                <ProfileEntryCard
                  primary={entry.organization}
                  secondary={entry.role}
                  meta={entry.period}
                  editLabel={`Edit work at ${entry.organization}`}
                  onEdit={() => props.onEdit(entry)}
                />
              </li>
            )}
          </For>
        </ul>
      </Show>
    </ProfileSectionShell>
  );
}