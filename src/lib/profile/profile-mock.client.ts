import { validateAvatarFile } from "./profile-avatar-upload";
import { MAX_EDUCATION_ENTRIES } from "./profile-editor-target";
import { ProfileSaveError } from "./profile-save-error";
import type { EducationEntry, WorkEntry } from "./profile-view.types";

export const PROFILE_MOCK_LATENCY_MS = 400;

export type ProfileAboutPayload = {
  displayName: string;
  bio: string;
};

export type ProfileSaveMode = "add" | "update";

function mockDelay(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, PROFILE_MOCK_LATENCY_MS);
  });
}

function optionalTrim(value: string | undefined): string | undefined {
  const trimmed = (value ?? "").trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function findWorkEntry(list: WorkEntry[], id: string): WorkEntry | undefined {
  return list.find((item) => item.id === id);
}

export function findEducationEntry(
  list: EducationEntry[],
  id: string,
): EducationEntry | undefined {
  return list.find((item) => item.id === id);
}

export async function saveAvatar(file: File | null, remove: boolean): Promise<void> {
  await mockDelay();
  if (remove) return;
  if (!file) {
    throw new ProfileSaveError("Choose an image to upload.");
  }
  validateAvatarFile(file);
}

export async function saveAbout(
  draft: ProfileAboutPayload,
  _current: ProfileAboutPayload,
): Promise<ProfileAboutPayload> {
  await mockDelay();
  return {
    displayName: draft.displayName.trim(),
    bio: draft.bio,
  };
}

export async function saveWork(
  entry: WorkEntry,
  list: WorkEntry[],
  mode: ProfileSaveMode,
): Promise<WorkEntry> {
  await mockDelay();
  if (mode === "update" && !findWorkEntry(list, entry.id)) {
    throw new ProfileSaveError("This entry was removed.");
  }
  return {
    id: entry.id,
    organization: entry.organization.trim(),
    role: entry.role.trim(),
    period: optionalTrim(entry.period),
  };
}

export async function saveEducation(
  entry: EducationEntry,
  list: EducationEntry[],
  mode: ProfileSaveMode,
): Promise<EducationEntry> {
  await mockDelay();
  if (mode === "add" && list.length >= MAX_EDUCATION_ENTRIES) {
    throw new ProfileSaveError(
      `You can add at most ${MAX_EDUCATION_ENTRIES} education entries.`,
    );
  }
  if (mode === "update" && !findEducationEntry(list, entry.id)) {
    throw new ProfileSaveError("This entry was removed.");
  }
  return {
    id: entry.id,
    institution: entry.institution.trim(),
    program: entry.program.trim(),
    endYear: optionalTrim(entry.endYear),
  };
}