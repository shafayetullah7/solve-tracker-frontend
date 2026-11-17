import { Title } from "@solidjs/meta";
import { useNavigate } from "@solidjs/router";
import { createSignal, onSettled, Show } from "solid-js";
import { ProfileAboutEditorDialog } from "../../components/profile/ProfileAboutEditorDialog";
import { ProfileAvatarEditorDialog } from "../../components/profile/ProfileAvatarEditorDialog";
import { ProfileAboutSection } from "../../components/profile/ProfileAboutSection";
import { ProfileAccountPanel } from "../../components/profile/ProfileAccountPanel";
import { ProfileEducationSection } from "../../components/profile/ProfileEducationSection";
import { ProfileEntryEditorDialog } from "../../components/profile/ProfileEntryEditorDialog";
import { ProfilePageHeader } from "../../components/profile/ProfilePageHeader";
import { ProfilePasswordEditorDialog } from "../../components/profile/ProfilePasswordEditorDialog";
import { ProfileWorkSection } from "../../components/profile/ProfileWorkSection";
import { useAuth } from "../../lib/auth/context";
import { createMediaApi } from "../../lib/api/modules/media.api";
import { createProfileApi } from "../../lib/api/modules/profile.api";
import { applyProfileApiError } from "../../lib/forms/apply-profile-api-error";
import { profileEntryRemoveMessage } from "../../lib/profile/messages";
import { validateAvatarFile } from "../../lib/profile/profile-avatar-upload";
import {
  isProfileEntryEditorTarget,
  MAX_EDUCATION_ENTRIES,
  type ProfileEditorTarget,
} from "../../lib/profile/profile-editor-target";
import type { ProfileAvatarSaveInput } from "../../components/profile/ProfileAvatarEditorDialog";
import { profileInitials } from "../../lib/profile/profile-initials";
import type { EducationEntry, WorkEntry } from "../../lib/profile/profile-view.types";
import { paths } from "../../router";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { FormAlert } from "../../components/ui/FormAlert";

type ProfileEntryRemoveTarget =
  | { kind: "work"; id: string }
  | { kind: "education"; id: string };

function mergeById<T extends { id: string }>(items: T[], saved: T): T[] {
  const index = items.findIndex((item) => item.id === saved.id);
  if (index === -1) return [...items, saved];
  const next = [...items];
  next[index] = saved;
  return next;
}

function removeById<T extends { id: string }>(items: T[], id: string): T[] {
  return items.filter((item) => item.id !== id);
}

export default function ProfilePage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const profileApi = () => createProfileApi(auth.productClient);
  const mediaApi = () => createMediaApi();

  const [logoutPending, setLogoutPending] = createSignal(false);
  const [editorTarget, setEditorTarget] = createSignal<ProfileEditorTarget | null>(null);
  const [passwordOpen, setPasswordOpen] = createSignal(false);
  const [loadPending, setLoadPending] = createSignal(true);
  const [loadError, setLoadError] = createSignal<string | undefined>();

  const [about, setAbout] = createSignal({ displayName: "", bio: "" });
  const [work, setWork] = createSignal<WorkEntry[]>([]);
  const [education, setEducation] = createSignal<EducationEntry[]>([]);
  const [avatarUrl, setAvatarUrl] = createSignal<string | undefined>();
  const [entryRemoveTarget, setEntryRemoveTarget] =
    createSignal<ProfileEntryRemoveTarget | null>(null);
  const [entryRemovePending, setEntryRemovePending] = createSignal(false);
  const [entryRemoveError, setEntryRemoveError] = createSignal<string | undefined>();

  const aboutInitials = () => profileInitials(about().displayName);
  const entryEditorTarget = () => {
    const target = editorTarget();
    return isProfileEntryEditorTarget(target) ? target : null;
  };

  async function refreshProfile() {
    setLoadPending(true);
    setLoadError(undefined);
    try {
      const profile = await profileApi().getProfile();
      setAbout({ displayName: profile.name, bio: profile.bio });
      setWork(profile.work);
      setEducation(profile.education);
      setAvatarUrl(profile.avatarUrl);
      const sessionUser = auth.user();
      if (sessionUser && sessionUser.name !== profile.name) {
        auth.establishSession({ ...sessionUser, name: profile.name });
      }
    } catch (error) {
      setLoadError(applyProfileApiError(error).banner);
    } finally {
      setLoadPending(false);
    }
  }

  onSettled(() => {
    if (auth.status() === "authenticated") void refreshProfile();
  });

  function closeEditor() {
    setEditorTarget(null);
  }

  async function persistAvatar(input: ProfileAvatarSaveInput) {
    if (input.remove) {
      const profile = await profileApi().patchProfile({ avatarMediaId: null });
      setAvatarUrl(profile.avatarUrl);
      return;
    }
    if (!input.file) return;
    validateAvatarFile(input.file);
    const uploaded = await mediaApi().uploadAvatar(input.file);
    const profile = await profileApi().patchProfile({ avatarMediaId: uploaded.id });
    setAvatarUrl(profile.avatarUrl ?? uploaded.url);
  }

  async function persistAbout(values: { displayName: string; bio: string }) {
    const profile = await profileApi().patchProfile({
      name: values.displayName.trim(),
      bio: values.bio,
    });
    setAbout({ displayName: profile.name, bio: profile.bio });
    const sessionUser = auth.user();
    if (sessionUser) {
      auth.establishSession({ ...sessionUser, name: profile.name });
    }
  }

  async function persistWorkEntry(entry: WorkEntry) {
    const target = entryEditorTarget();
    const body = {
      organization: entry.organization,
      role: entry.role,
      period: entry.period,
    };
    const saved =
      target?.kind === "work-edit"
        ? await profileApi().updateWork(entry.id, body)
        : await profileApi().createWork(body);
    setWork((items) => mergeById(items, saved));
  }

  async function persistEducationEntry(entry: EducationEntry) {
    const target = entryEditorTarget();
    const body = {
      institution: entry.institution,
      program: entry.program,
      endYear: entry.endYear,
    };
    const saved =
      target?.kind === "education-edit"
        ? await profileApi().updateEducation(entry.id, body)
        : await profileApi().createEducation(body);
    setEducation((items) => mergeById(items, saved));
  }

  async function deleteWorkEntry(id: string) {
    await profileApi().deleteWork(id);
    setWork((items) => removeById(items, id));
  }

  async function deleteEducationEntry(id: string) {
    await profileApi().deleteEducation(id);
    setEducation((items) => removeById(items, id));
  }

  function requestRemoveWork(entry: WorkEntry) {
    setEntryRemoveError(undefined);
    setEntryRemoveTarget({ kind: "work", id: entry.id });
  }

  function requestRemoveEducation(entry: EducationEntry) {
    setEntryRemoveError(undefined);
    setEntryRemoveTarget({ kind: "education", id: entry.id });
  }

  async function confirmRemoveEntry() {
    const target = entryRemoveTarget();
    if (!target || entryRemovePending()) return;
    setEntryRemovePending(true);
    setEntryRemoveError(undefined);
    try {
      if (target.kind === "work") {
        await deleteWorkEntry(target.id);
      } else {
        await deleteEducationEntry(target.id);
      }
      const editing = editorTarget();
      if (
        (editing?.kind === "work-edit" && editing.id === target.id) ||
        (editing?.kind === "education-edit" && editing.id === target.id)
      ) {
        closeEditor();
      }
      setEntryRemoveTarget(null);
    } catch (error) {
      setEntryRemoveTarget(null);
      setEntryRemoveError(profileEntryRemoveMessage(error));
    } finally {
      setEntryRemovePending(false);
    }
  }

  async function persistPassword(input: {
    currentPassword: string;
    newPassword: string;
  }) {
    await auth.authApi.changePassword(input);
    auth.clearSession();
    navigate(paths.login());
  }

  async function onLogout() {
    if (logoutPending()) return;
    setLogoutPending(true);
    try {
      await auth.logout();
      navigate(paths.login());
    } finally {
      setLogoutPending(false);
    }
  }

  return (
    <div class="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <Title>Profile — Practice</Title>
      <ProfilePageHeader />
      <Show when={loadError()}>
        <FormAlert class="mt-6" variant="error">
          {loadError()}
        </FormAlert>
      </Show>
      <Show when={loadPending()}>
        <p class="mt-8 text-sm text-muted" role="status">
          Loading profile…
        </p>
      </Show>
      <Show when={!loadPending() && !loadError()}>
        <div class="mt-8 space-y-8">
          <ProfileAboutSection
            displayName={about().displayName}
            bio={about().bio}
            email={auth.user()?.email}
            avatarUrl={avatarUrl()}
            avatarInitials={aboutInitials()}
            onEdit={() => setEditorTarget({ kind: "about-edit" })}
            onEditPhoto={() => setEditorTarget({ kind: "avatar-edit" })}
          />
          <Show when={entryRemoveError()}>
            <FormAlert variant="error">{entryRemoveError()}</FormAlert>
          </Show>
          <div class="grid gap-8 lg:grid-cols-2">
            <ProfileWorkSection
              work={work()}
              onAdd={() => setEditorTarget({ kind: "work-add" })}
              onEdit={(entry: WorkEntry) => setEditorTarget({ kind: "work-edit", id: entry.id })}
              onDelete={requestRemoveWork}
            />
            <ProfileEducationSection
              education={education()}
              onAdd={
                education().length < MAX_EDUCATION_ENTRIES
                  ? () => setEditorTarget({ kind: "education-add" })
                  : undefined
              }
              onEdit={(entry: EducationEntry) =>
                setEditorTarget({ kind: "education-edit", id: entry.id })
              }
              onDelete={requestRemoveEducation}
            />
          </div>
          <ProfileAccountPanel
            logoutPending={logoutPending()}
            revocationUnconfirmed={auth.revocationUnconfirmed()}
            onLogout={() => void onLogout()}
            onRetryLogout={() => void auth.retryLogout()}
            onChangePassword={() => setPasswordOpen(true)}
          />
        </div>
      </Show>
      <ProfileAvatarEditorDialog
        open={editorTarget()?.kind === "avatar-edit"}
        avatarUrl={avatarUrl()}
        avatarInitials={aboutInitials()}
        onClose={closeEditor}
        onSave={persistAvatar}
      />
      <ProfileAboutEditorDialog
        open={editorTarget()?.kind === "about-edit"}
        displayName={about().displayName}
        bio={about().bio}
        onClose={closeEditor}
        onSave={persistAbout}
      />
      <ProfileEntryEditorDialog
        target={entryEditorTarget()}
        work={work()}
        education={education()}
        onClose={closeEditor}
        onSaveWork={persistWorkEntry}
        onSaveEducation={persistEducationEntry}
      />
      <ConfirmDialog
        open={entryRemoveTarget() !== null}
        titleId="profile-list-remove-title"
        title={
          entryRemoveTarget()?.kind === "work"
            ? "Remove this work entry?"
            : "Remove this education entry?"
        }
        description={
          entryRemoveTarget()?.kind === "work"
            ? "This role will disappear from your profile. You can add work history again anytime."
            : "This program will disappear from your profile. You can add education again anytime."
        }
        confirmLabel="Remove entry"
        pendingLabel="Removing…"
        confirmTone="danger"
        pending={entryRemovePending()}
        onConfirm={() => void confirmRemoveEntry()}
        onCancel={() => {
          if (entryRemovePending()) return;
          setEntryRemoveTarget(null);
        }}
      />
      <ProfilePasswordEditorDialog
        open={passwordOpen()}
        onClose={() => setPasswordOpen(false)}
        onSave={persistPassword}
      />
    </div>
  );
}