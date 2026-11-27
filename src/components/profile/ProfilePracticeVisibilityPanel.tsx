import { createMemo, createSignal, For, Show } from "solid-js";
import type { ProfileResponse } from "../../lib/api/modules/profile.api";
import { discoverCopy } from "../../lib/discover/copy";
import { isDiscoverOff, isDiscoverSharingEnabled } from "../../lib/discover/flag";
import { applyProfileApiError } from "../../lib/forms/apply-profile-api-error";
import { isSystemAssignedHandle, formatHandleLabel } from "../../lib/auth/user-handle";
import { Button } from "../ui/Button";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { FormAlert } from "../ui/FormAlert";
import { ProfileSectionShell } from "./ProfileSectionShell";

export type PracticeVisibility = ProfileResponse["practiceVisibility"];
export type PracticeGoal = ProfileResponse["practiceGoal"];

const VISIBILITY_OPTIONS: {
  value: PracticeVisibility;
  titleKey: "visibility.optionPrivateTitle" | "visibility.optionSummaryTitle" | "visibility.optionTopicsTitle";
  hintKey:
    | "visibility.optionPrivateHint"
    | "visibility.optionSummaryHint"
    | "visibility.optionTopicsHint";
}[] = [
  {
    value: "private",
    titleKey: "visibility.optionPrivateTitle",
    hintKey: "visibility.optionPrivateHint",
  },
  {
    value: "summary",
    titleKey: "visibility.optionSummaryTitle",
    hintKey: "visibility.optionSummaryHint",
  },
  {
    value: "topics",
    titleKey: "visibility.optionTopicsTitle",
    hintKey: "visibility.optionTopicsHint",
  },
];

const GOAL_OPTIONS: { value: NonNullable<PracticeGoal>; label: string }[] = [
  { value: "interview", label: "Interview prep" },
  { value: "contests", label: "Contests" },
  { value: "fundamentals", label: "Fundamentals" },
  { value: "coaching", label: "Coaching" },
];

export type ProfilePracticeVisibilityPanelProps = {
  handle: string;
  practiceVisibility: PracticeVisibility;
  practiceGoal: PracticeGoal;
  publicWeb: boolean;
  onSave: (input: {
    practiceVisibility: PracticeVisibility;
    practiceGoal: PracticeGoal;
    publicWeb: boolean;
  }) => Promise<void>;
  onEditHandle?: () => void;
  onViewAsOthers?: () => void;
  onCopyLink?: () => void;
  copyLinkStatus?: string;
  shareStatsSummary?: string;
  followersCount?: number;
};

export function ProfilePracticeVisibilityPanel(
  props: ProfilePracticeVisibilityPanelProps,
) {
  // Undefined means no local edit; null remains a valid practice goal.
  const [visibilityDraft, setVisibility] = createSignal<PracticeVisibility>();
  const [goalDraft, setGoal] = createSignal<PracticeGoal>();
  const [publicWebDraft, setPublicWeb] = createSignal<boolean>();
  const visibility = () => visibilityDraft() ?? props.practiceVisibility;
  const goal = () => {
    const draft = goalDraft();
    return draft === undefined ? props.practiceGoal : draft;
  };
  const publicWeb = () => publicWebDraft() ?? props.publicWeb;
  const [pending, setPending] = createSignal(false);
  const [banner, setBanner] = createSignal<string | undefined>();
  const [fieldErrors, setFieldErrors] = createSignal<
    Partial<Record<"practiceVisibility" | "practiceGoal", string>>
  >({});
  const [privateConfirmOpen, setPrivateConfirmOpen] = createSignal(false);

  const dirty = createMemo(
    () =>
      visibility() !== props.practiceVisibility ||
      goal() !== props.practiceGoal ||
      publicWeb() !== props.publicWeb,
  );

  const previewDisabled = createMemo(() => {
    if (isDiscoverOff()) return true;
    if (visibility() === "private" || props.practiceVisibility === "private") return true;
    return !isDiscoverSharingEnabled();
  });

  const previewTitle = createMemo(() => {
    if (visibility() === "private" || props.practiceVisibility === "private")
      return discoverCopy("visibility.viewAsOthersDisabledPrivate");
    if (isDiscoverOff()) return discoverCopy("visibility.previewLaunchHint");
    return undefined;
  });

  async function persistSave() {
    if (pending() || !dirty()) return;
    setPending(true);
    setBanner(undefined);
    setFieldErrors({});
    try {
      await props.onSave({
        practiceVisibility: visibility(),
        practiceGoal: goal(),
        publicWeb: visibility() !== "private" && publicWeb(),
      });
      setVisibility(undefined);
      setGoal(undefined);
      setPublicWeb(undefined);
    } catch (error) {
      const applied = applyProfileApiError(error);
      setBanner(applied.banner);
      setFieldErrors(applied.fieldErrors);
    } finally {
      setPending(false);
    }
  }

  function save() {
    const goingPrivate =
      visibility() === "private" && props.practiceVisibility !== "private";
    if (goingPrivate && (props.followersCount ?? 0) > 0) {
      setPrivateConfirmOpen(true);
      return;
    }
    void persistSave();
  }

  async function confirmPrivate() {
    setPrivateConfirmOpen(false);
    await persistSave();
  }

  return (
    <ProfileSectionShell
      title={discoverCopy("visibility.panelTitle")}
      description={discoverCopy("visibility.panelIntro")}
      titleId="profile-visibility-heading"
      toolbarHidden
    >
      <fieldset class="space-y-4" disabled={pending()}>
        <legend class="sr-only">{discoverCopy("visibility.panelTitle")}</legend>
        <For each={VISIBILITY_OPTIONS}>
          {(option) => (
            <label class="flex cursor-pointer gap-3 rounded-control border border-line px-4 py-3 has-checked:border-accent has-checked:bg-surface-muted/50">
              <input
                type="radio"
                name="practice-visibility"
                class="mt-1"
                checked={visibility() === option.value}
                onChange={() => {
                  setVisibility(option.value);
                  if (option.value === "private") setPublicWeb(false);
                }}
              />
              <span class="min-w-0">
                <span class="block text-sm font-medium text-ink">
                  {discoverCopy(option.titleKey)}
                </span>
                <span class="block text-sm text-muted">{discoverCopy(option.hintKey)}</span>
              </span>
            </label>
          )}
        </For>
      </fieldset>

      <Show when={visibility() !== "private" && !isDiscoverOff()}>
        <label class="mt-6 flex cursor-pointer gap-3 rounded-control border border-line px-4 py-3 has-checked:border-accent">
          <input
            type="checkbox"
            class="mt-1"
            checked={publicWeb()}
            disabled={pending() || visibility() === "private"}
            onChange={(e) => setPublicWeb(e.currentTarget.checked)}
          />
          <span class="min-w-0">
            <span class="block text-sm font-medium text-ink">
              {discoverCopy("visibility.publicWebTitle")}
            </span>
            <span class="block text-sm text-muted">
              {discoverCopy("visibility.publicWebHint")}
            </span>
          </span>
        </label>
      </Show>

      <div class="mt-6">
        <label class="mb-1 block text-sm font-medium text-ink" for="practice-goal">
          {discoverCopy("visibility.goalLabel")}
        </label>
        <select
          id="practice-goal"
          class="w-full max-w-md rounded-control border border-line bg-surface px-3 py-2 text-sm"
          disabled={pending()}
          value={goal() ?? ""}
          onChange={(event) => {
            const v = event.currentTarget.value;
            setGoal(v === "" ? null : (v as NonNullable<PracticeGoal>));
          }}
        >
          <option value="">{discoverCopy("visibility.goalNotSet")}</option>
          <For each={GOAL_OPTIONS}>
            {(opt) => <option value={opt.value}>{opt.label}</option>}
          </For>
        </select>
        <Show when={fieldErrors().practiceGoal}>
          <p class="mt-1 text-sm text-danger" role="alert">
            {fieldErrors().practiceGoal}
          </p>
        </Show>
      </div>

      <Show when={props.shareStatsSummary}>
        <p class="mt-6 text-sm text-muted" role="status">
          {props.shareStatsSummary}
        </p>
      </Show>

      <Show when={(props.followersCount ?? 0) > 0}>
        <p class="mt-4 text-sm text-muted" role="status">
          {discoverCopy("visibility.followersCount", {
            count: String(props.followersCount),
          })}
        </p>
      </Show>

      <p class="mt-6 text-sm text-muted" data-testid="never-shared-line">
        {discoverCopy("visibility.neverShared")}
      </p>

      <Show when={isSystemAssignedHandle(props.handle)}>
        <p class="mt-4 text-sm text-muted">
          {discoverCopy("visibility.systemHandleHint", { handle: props.handle })}
          <Show when={props.onEditHandle}>
            {" "}
            <button
              type="button"
              class="font-medium text-accent underline underline-offset-2"
              onClick={() => props.onEditHandle?.()}
            >
              Choose a handle
            </button>
          </Show>
        </p>
      </Show>

      <div class="mt-6 flex flex-wrap gap-2">
        <span title={previewTitle()}>
          <Button
            type="button"
            variant="secondary"
            disabled={previewDisabled()}
            onClick={() => props.onViewAsOthers?.()}
          >
            {discoverCopy("visibility.viewAsOthers")}
          </Button>
        </span>
        <span title={previewTitle()}>
          <Button
            type="button"
            variant="secondary"
            disabled={previewDisabled()}
            onClick={() => props.onCopyLink?.()}
          >
            {discoverCopy("visibility.copyLink")}
          </Button>
        </span>
        <Button
          type="button"
          class="ml-auto"
          disabled={!dirty() || pending()}
          onClick={() => save()}
        >
          {discoverCopy("visibility.save")}
        </Button>
      </div>

      <ConfirmDialog
        open={privateConfirmOpen()}
        titleId="visibility-private-followers-title"
        title={discoverCopy("visibility.optionPrivateTitle")}
        description={discoverCopy("visibility.confirmPrivateWithFollowers")}
        confirmLabel={discoverCopy("visibility.save")}
        pendingLabel={discoverCopy("visibility.save")}
        pending={pending()}
        onCancel={() => setPrivateConfirmOpen(false)}
        onConfirm={() => void confirmPrivate()}
      />

      <Show when={props.copyLinkStatus}>
        <p class="mt-4 text-sm text-muted" role="status" aria-live="polite">
          {props.copyLinkStatus}
        </p>
      </Show>

      <Show when={banner()}>
        <FormAlert class="mt-4" variant="error">
          {banner()}
        </FormAlert>
      </Show>

      <p class="mt-2 text-xs text-muted sr-only">
        Current handle {formatHandleLabel(props.handle)}
      </p>
    </ProfileSectionShell>
  );
}