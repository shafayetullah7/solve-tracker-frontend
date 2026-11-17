import { For, Show } from "solid-js";
import type { EducationEntry } from "../../lib/profile/profile-view.types";
import { ProfileEntryCard } from "./ProfileEntryCard";
import { ProfileSectionShell } from "./ProfileSectionShell";

export type ProfileEducationSectionProps = {
  education: EducationEntry[];
  onAdd?: () => void;
  onEdit: (entry: EducationEntry) => void;
  onDelete: (entry: EducationEntry) => void;
};

function educationMeta(entry: EducationEntry) {
  return entry.endYear ? `Class of ${entry.endYear}` : undefined;
}

export function ProfileEducationSection(props: ProfileEducationSectionProps) {
  return (
    <ProfileSectionShell
      title="Education"
      description="Optional schools and certificates."
      titleId="profile-education-heading"
      onAdd={props.onAdd}
      addLabel="Add education entry"
    >
      <Show
        when={props.education.length > 0}
        fallback={
          <p class="text-label text-muted">
            No education added yet. Use the add button to preview the entry flow.
          </p>
        }
      >
        <ul class="space-y-3">
          <For each={props.education}>
            {(entry) => (
              <li>
                <ProfileEntryCard
                  primary={entry.institution}
                  secondary={entry.program}
                  meta={educationMeta(entry)}
                  editLabel={`Edit education at ${entry.institution}`}
                  deleteLabel={`Remove education at ${entry.institution}`}
                  onEdit={() => props.onEdit(entry)}
                  onDelete={() => props.onDelete(entry)}
                />
              </li>
            )}
          </For>
        </ul>
      </Show>
    </ProfileSectionShell>
  );
}