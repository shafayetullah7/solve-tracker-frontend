import { Title } from "@solidjs/meta";
import { useNavigate } from "@solidjs/router";
import { createSignal } from "solid-js";
import { ProfileAboutEditorDialog } from "../../components/profile/ProfileAboutEditorDialog";
import { ProfileAvatarEditorDialog } from "../../components/profile/ProfileAvatarEditorDialog";
import { ProfileAboutSection } from "../../components/profile/ProfileAboutSection";
import { ProfileAccountPanel } from "../../components/profile/ProfileAccountPanel";
import { ProfileEducationSection } from "../../components/profile/ProfileEducationSection";
import { ProfileEntryEditorDialog } from "../../components/profile/ProfileEntryEditorDialog";
import { ProfileMockupBanner } from "../../components/profile/ProfileMockupBanner";
import { ProfilePageHeader } from "../../components/profile/ProfilePageHeader";
import { ProfileWorkSection } from "../../components/profile/ProfileWorkSection";
import { useAuth } from "../../lib/auth/context";
import {
  isProfileEntryEditorTarget,
  MAX_EDUCATION_ENTRIES,
  type ProfileEditorTarget,
} from "../../lib/profile/profile-editor-target";
import type { ProfileAvatarSaveInput } from "../../components/profile/ProfileAvatarEditorDialog";
import {
  saveAbout,
  saveAvatar,
  saveEducation,
  saveWork,
} from "../../lib/profile/profile-mock.client";
import { SAMPLE_PROFILE } from "../../lib/profile/profile-view.fixture";
import { profileInitials } from "../../lib/profile/profile-initials";
import type { EducationEntry, WorkEntry } from "../../lib/profile/profile-view.types";
import { paths } from "../../router";

function mergeById<T extends { id: string }>(items: T[], saved: T): T[] {
  const index = items.findIndex((item) => item.id === saved.id);
  if (index === -1) return [...items, saved];
  const next = [...items];
  next[index] = saved;
  return next;
}

export default function ProfilePage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [logoutPending, setLogoutPending] = createSignal(false);
  const [editorTarget, setEditorTarget] = createSignal<ProfileEditorTarget | null>(null);
  const [about, setAbout] = createSignal({
    displayName: SAMPLE_PROFILE.displayName,
    bio: SAMPLE_PROFILE.bio,
  });
  const [work, setWork] = createSignal<WorkEntry[]>([...SAMPLE_PROFILE.work]);
  const [education, setEducation] = createSignal<EducationEntry[]>([...SAMPLE_PROFILE.education]);
  const [avatarUrl, setAvatarUrl] = createSignal<string | undefined>(SAMPLE_PROFILE.avatarUrl);

  let ownedAvatarBlobUrl: string | undefined;

  function revokeOwnedAvatarBlob() {
    if (ownedAvatarBlobUrl) {
      URL.revokeObjectURL(ownedAvatarBlobUrl);
      ownedAvatarBlobUrl = undefined;
    }
  }

  const profile = () => SAMPLE_PROFILE;
  const aboutInitials = () => profileInitials(about().displayName);
  const entryEditorTarget = () => {
    const target = editorTarget();
    return isProfileEntryEditorTarget(target) ? target : null;
  };

  function closeEditor() {
    setEditorTarget(null);
  }

  async function persistAvatar(input: ProfileAvatarSaveInput) {
    await saveAvatar(input.file, input.remove);
    if (input.remove) {
      revokeOwnedAvatarBlob();
      setAvatarUrl(undefined);
      return;
    }
    if (input.file) {
      revokeOwnedAvatarBlob();
      ownedAvatarBlobUrl = URL.createObjectURL(input.file);
      setAvatarUrl(ownedAvatarBlobUrl);
    }
  }

  async function persistAbout(values: { displayName: string; bio: string }) {
    const saved = await saveAbout(values, about());
    setAbout(saved);
  }

  async function persistWorkEntry(entry: WorkEntry) {
    const target = entryEditorTarget();
    const mode = target?.kind === "work-edit" ? "update" : "add";
    const saved = await saveWork(entry, work(), mode);
    setWork((items) => mergeById(items, saved));
  }

  async function persistEducationEntry(entry: EducationEntry) {
    const target = entryEditorTarget();
    const mode = target?.kind === "education-edit" ? "update" : "add";
    const saved = await saveEducation(entry, education(), mode);
    setEducation((items) => mergeById(items, saved));
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
      <div class="mt-8 space-y-8">
        <ProfileMockupBanner />
        <ProfileAboutSection
          displayName={about().displayName}
          bio={about().bio}
          avatarUrl={avatarUrl()}
          avatarInitials={aboutInitials()}
          onEdit={() => setEditorTarget({ kind: "about-edit" })}
          onEditPhoto={() => setEditorTarget({ kind: "avatar-edit" })}
        />
        <div class="grid gap-8 lg:grid-cols-2">
          <ProfileWorkSection
            work={work()}
            onAdd={() => setEditorTarget({ kind: "work-add" })}
            onEdit={(entry: WorkEntry) => setEditorTarget({ kind: "work-edit", id: entry.id })}
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
          />
        </div>
        <ProfileAccountPanel
          name={auth.user()?.name}
          email={auth.user()?.email}
          logoutPending={logoutPending()}
          revocationUnconfirmed={auth.revocationUnconfirmed()}
          onLogout={() => void onLogout()}
          onRetryLogout={() => void auth.retryLogout()}
        />
      </div>
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
    </div>
  );
}