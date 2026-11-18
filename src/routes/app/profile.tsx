import { Title } from "@solidjs/meta";
import { useLocation, useNavigate } from "@solidjs/router";
import { createEffect, createSignal, Show } from "solid-js";
import { ProfileAboutEditorDialog } from "../../components/profile/ProfileAboutEditorDialog";
import { ProfileHandleEditorDialog } from "../../components/profile/ProfileHandleEditorDialog";
import { ProfileAvatarEditorDialog } from "../../components/profile/ProfileAvatarEditorDialog";
import { ProfileAboutSection } from "../../components/profile/ProfileAboutSection";
import {
  ProfilePracticeVisibilityPanel,
  type PracticeGoal,
  type PracticeVisibility,
} from "../../components/profile/ProfilePracticeVisibilityPanel";
import { ProfileAccountPanel } from "../../components/profile/ProfileAccountPanel";
import { ProfileEducationSection } from "../../components/profile/ProfileEducationSection";
import { ProfileEntryEditorDialog } from "../../components/profile/ProfileEntryEditorDialog";
import { ProfilePageHeader } from "../../components/profile/ProfilePageHeader";
import { ProfileConnectedAccountsPanel } from "../../components/profile/ProfileConnectedAccountsPanel";
import { ProfilePasswordEditorDialog } from "../../components/profile/ProfilePasswordEditorDialog";
import { ProfileSetPasswordDialog } from "../../components/profile/ProfileSetPasswordDialog";
import { oauthErrorMessage } from "../../lib/auth/oauth-error-copy";
import { AppPageContainer } from "../../components/app/AppPageContainer";
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
import { pathWithoutSearchKeys } from "../../lib/navigation/search-url";
import { paths } from "../../router";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { isDiscoverOff } from "../../lib/discover/flag";
import { discoverCopy } from "../../lib/discover/copy";
import { trackDiscoverEvent } from "../../lib/discover/track";
import {
  absolutePeopleProfileUrl,
  absolutePublicPeopleProfileUrl,
  peopleProfilePath,
} from "../../lib/people/paths";
import { copyTextToClipboard } from "../../lib/people/copy-link";
import { FormAlert } from "../../components/ui/FormAlert";

type ProfileEntryRemoveTarget =
  | { kind: "work"; id: string }
  | { kind: "education"; id: string };

const pulse = "motion-safe:animate-pulse rounded bg-surface-muted";
const panel =
  "rounded-panel border border-line bg-surface p-5 shadow-panel sm:p-6";

function ProfileSectionSkeleton() {
  return (
    <section class={panel}>
      <div class="mb-5 space-y-2">
        <div class={`h-5 w-28 ${pulse}`} />
        <div class={`h-4 w-56 ${pulse}`} />
      </div>
      <div class="space-y-3">
        <div class={`h-4 w-full ${pulse}`} />
        <div class={`h-4 w-5/6 ${pulse}`} />
        <div class={`h-4 w-2/3 ${pulse}`} />
      </div>
    </section>
  );
}

function ProfilePageSkeleton() {
  return (
    <div class="space-y-8" role="status" aria-label="Loading">
      <div class="space-y-2">
        <div class={`h-9 w-44 ${pulse}`} />
        <div class={`h-5 w-full max-w-xl ${pulse}`} />
      </div>
      <section class={panel}>
        <div class="mb-5 space-y-2">
          <div class={`h-5 w-32 ${pulse}`} />
          <div class={`h-4 w-64 ${pulse}`} />
        </div>
        <div class="flex flex-col gap-6 md:flex-row md:items-start">
          <div class={`size-28 shrink-0 rounded-full md:size-32 ${pulse}`} />
          <div class="min-w-0 flex-1 space-y-3">
            <div class={`h-7 w-48 ${pulse}`} />
            <div class={`h-4 w-64 ${pulse}`} />
            <div class={`h-4 w-full ${pulse}`} />
            <div class={`h-4 w-4/5 ${pulse}`} />
          </div>
        </div>
      </section>
      <div class="grid gap-8 lg:grid-cols-2">
        <ProfileSectionSkeleton />
        <ProfileSectionSkeleton />
      </div>
      <ProfileSectionSkeleton />
    </div>
  );
}

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
  const location = useLocation();
  const profileApi = () => createProfileApi(auth.productClient);
  const mediaApi = () => createMediaApi();

  const [logoutPending, setLogoutPending] = createSignal(false);
  const [editorTarget, setEditorTarget] = createSignal<ProfileEditorTarget | null>(null);
  const [passwordOpen, setPasswordOpen] = createSignal(false);
  const [setPasswordDialogOpen, setSetPasswordDialogOpen] = createSignal(false);
  const [unlinkPending, setUnlinkPending] = createSignal(false);
  const [accountActionError, setAccountActionError] = createSignal<
    string | undefined
  >();

  const oauthAccountBanner = () => {
    const params = new URLSearchParams(location.search);
    if (params.get("google_linked") === "1")
      return "Google account linked to this profile.";
    return oauthErrorMessage(params.get("oauth_error"));
  };
  const [loadPending, setLoadPending] = createSignal(true);
  const [loadError, setLoadError] = createSignal<string | undefined>();

  const [about, setAbout] = createSignal({ displayName: "", bio: "", handle: "" });
  const [practiceVisibility, setPracticeVisibility] =
    createSignal<PracticeVisibility>("private");
  const [practiceGoal, setPracticeGoal] = createSignal<PracticeGoal>(null);
  const [publicWeb, setPublicWeb] = createSignal(false);
  const [copyLinkStatus, setCopyLinkStatus] = createSignal<string | undefined>();
  const [shareStatsSummary, setShareStatsSummary] = createSignal<string | undefined>();
  const [followersCount, setFollowersCount] = createSignal(0);
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
      setAbout({ displayName: profile.name, bio: profile.bio, handle: profile.handle });
      setPracticeVisibility(profile.practiceVisibility);
      setPracticeGoal(profile.practiceGoal);
      setPublicWeb(profile.publicWeb);
      setWork(profile.work);
      setEducation(profile.education);
      setAvatarUrl(profile.avatarUrl);
      syncSessionUser(profile.name, profile.handle);
      if (!isDiscoverOff()) {
        try {
          const followers = await profileApi().getFollowersCount();
          setFollowersCount(followers.count);
        } catch {
          setFollowersCount(0);
        }
      }
      if (profile.practiceVisibility !== "private" && !isDiscoverOff()) {
        try {
          const stats = await profileApi().getShareStats();
          const total = stats.profileViews + stats.topicCopies;
          setShareStatsSummary(
            total > 0
              ? discoverCopy("visibility.shareStats", {
                  views: stats.profileViews,
                  copies: stats.topicCopies,
                })
              : undefined,
          );
        } catch {
          setShareStatsSummary(undefined);
        }
      } else {
        setShareStatsSummary(undefined);
      }
    } catch (error) {
      setLoadError(applyProfileApiError(error).banner);
    } finally {
      setLoadPending(false);
    }
  }

  function syncSessionUser(name: string, handle: string) {
    const sessionUser = auth.user();
    if (!sessionUser) return;
    if (sessionUser.name !== name || sessionUser.handle !== handle) {
      auth.establishSession({ ...sessionUser, name, handle });
    }
  }

  createEffect(
    () => auth.status(),
    (status) => {
      if (status === "authenticated") void refreshProfile();
    },
  );

  createEffect(
    () =>
      [location.pathname, location.search, auth.status(), loadPending()] as const,
    ([pathname, search, status, pending]) => {
      const params = new URLSearchParams(search);
      if (params.get("focus") !== "handle") return;
      if (status !== "authenticated" || pending) return;
      setEditorTarget({ kind: "handle-edit" });
      navigate(
        pathWithoutSearchKeys(pathname, search, ["focus"]),
        { replace: true },
      );
    },
  );

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
    setAbout({ displayName: profile.name, bio: profile.bio, handle: profile.handle });
    syncSessionUser(profile.name, profile.handle);
  }

  async function persistPracticeVisibility(input: {
    practiceVisibility: PracticeVisibility;
    practiceGoal: PracticeGoal;
    publicWeb: boolean;
  }) {
    const profile = await profileApi().patchProfile({
      practiceVisibility: input.practiceVisibility,
      practiceGoal: input.practiceGoal,
      publicWeb: input.publicWeb,
    });
    setPracticeVisibility(profile.practiceVisibility);
    setPracticeGoal(profile.practiceGoal);
    setPublicWeb(profile.publicWeb);
    if (profile.practiceVisibility !== "private") {
      trackDiscoverEvent("discover_share_visibility_save", "profile");
    }
  }

  async function persistHandle(handle: string) {
    const profile = await profileApi().patchProfile({ handle });
    setAbout((prev) => ({ ...prev, handle: profile.handle }));
    syncSessionUser(about().displayName, profile.handle);
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

  async function persistSetPassword(input: { newPassword: string }) {
    await auth.authApi.setPassword(input);
    await auth.reloadSession();
  }

  async function unlinkGoogle() {
    if (unlinkPending()) return;
    setUnlinkPending(true);
    setAccountActionError(undefined);
    try {
      await auth.authApi.unlinkGoogle();
      await auth.reloadSession();
    } catch (error) {
      setAccountActionError(applyProfileApiError(error).banner);
    } finally {
      setUnlinkPending(false);
    }
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
    <AppPageContainer>
      <Title>Profile — Practice</Title>
      <Show when={loadPending()}>
        <ProfilePageSkeleton />
      </Show>
      <Show when={!loadPending()}>
        <ProfilePageHeader />
      </Show>
      <Show when={loadError()}>
        <FormAlert class="mt-6" variant="error">
          {loadError()}
        </FormAlert>
      </Show>
      <Show when={!loadPending() && !loadError()}>
        <div class="mt-8 space-y-8">
          <ProfileAboutSection
            displayName={about().displayName}
            handle={about().handle || auth.user()?.handle || ""}
            bio={about().bio}
            email={auth.user()?.email}
            avatarUrl={avatarUrl()}
            avatarInitials={aboutInitials()}
            onEdit={() => setEditorTarget({ kind: "about-edit" })}
            onEditHandle={() => setEditorTarget({ kind: "handle-edit" })}
            onEditPhoto={() => setEditorTarget({ kind: "avatar-edit" })}
          />
          <Show when={!isDiscoverOff()}>
            <ProfilePracticeVisibilityPanel
              handle={about().handle || auth.user()?.handle || ""}
              practiceVisibility={practiceVisibility()}
              practiceGoal={practiceGoal()}
              publicWeb={publicWeb()}
              shareStatsSummary={shareStatsSummary()}
              followersCount={followersCount()}
              onSave={persistPracticeVisibility}
              onEditHandle={() => setEditorTarget({ kind: "handle-edit" })}
              copyLinkStatus={copyLinkStatus()}
              onViewAsOthers={() => {
                const h = about().handle || auth.user()?.handle;
                if (h) navigate(peopleProfilePath(h));
              }}
              onCopyLink={async () => {
                const h = about().handle || auth.user()?.handle;
                if (!h) return;
                const usePublic =
                  publicWeb() && practiceVisibility() !== "private";
                const url = usePublic
                  ? absolutePublicPeopleProfileUrl(h)
                  : absolutePeopleProfileUrl(h);
                const copied = await copyTextToClipboard(url);
                setCopyLinkStatus(
                  copied ? discoverCopy("toast.linkCopied") : url,
                );
              }}
            />
          </Show>
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
          <ProfileConnectedAccountsPanel
            account={auth.account}
            unlinkPending={unlinkPending()}
            oauthBanner={oauthAccountBanner()}
            onUnlink={() => void unlinkGoogle()}
            onSetPassword={() => setSetPasswordDialogOpen(true)}
          />
          <Show when={accountActionError()}>
            <FormAlert variant="error">{accountActionError()}</FormAlert>
          </Show>
          <ProfileAccountPanel
            logoutPending={logoutPending()}
            revocationUnconfirmed={auth.revocationUnconfirmed()}
            onLogout={() => void onLogout()}
            onRetryLogout={() => void auth.retryLogout()}
            onChangePassword={
              auth.account()?.hasPassword ? () => setPasswordOpen(true) : undefined
            }
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
      <ProfileHandleEditorDialog
        open={editorTarget()?.kind === "handle-edit"}
        currentHandle={about().handle || auth.user()?.handle || ""}
        onClose={closeEditor}
        onSave={persistHandle}
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
      <ProfileSetPasswordDialog
        open={setPasswordDialogOpen()}
        onClose={() => setSetPasswordDialogOpen(false)}
        onSave={persistSetPassword}
      />
    </AppPageContainer>
  );
}