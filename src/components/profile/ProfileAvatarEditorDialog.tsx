import { createEffect, createSignal, Show } from "solid-js";
import { applyProfileApiError } from "../../lib/forms/apply-profile-api-error";
import { ProfileSaveError } from "../../lib/profile/profile-save-error";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { FormAlert } from "../ui/FormAlert";
import { Button } from "../ui/Button";
import { ProfileAvatarUploadField } from "./ProfileAvatarUploadField";
import { ProfileEditorDialog } from "./ProfileEditorDialog";
import { ProfileFormFooter } from "./ProfileFormFooter";

const TITLE_ID = "profile-avatar-editor-title";

export type ProfileAvatarSaveInput = {
  file: File | null;
  remove: boolean;
};

export type ProfileAvatarEditorDialogProps = {
  open: boolean;
  avatarUrl?: string;
  avatarInitials: string;
  onClose: () => void;
  onSave: (input: ProfileAvatarSaveInput) => Promise<void>;
};

export function ProfileAvatarEditorDialog(props: ProfileAvatarEditorDialogProps) {
  const [selectedFile, setSelectedFile] = createSignal<File | null>(null);
  const [previewUrl, setPreviewUrl] = createSignal<string | undefined>(undefined);
  const [removeRequested, setRemoveRequested] = createSignal(false);
  const [formError, setFormError] = createSignal<string | undefined>();
  const [pending, setPending] = createSignal(false);
  const [discardConfirmOpen, setDiscardConfirmOpen] = createSignal(false);

  let draftPreviewUrl: string | undefined;
  let seededForSession = false;

  function revokeDraftPreview() {
    if (draftPreviewUrl) {
      URL.revokeObjectURL(draftPreviewUrl);
      draftPreviewUrl = undefined;
    }
  }

  function setFilePreview(file: File) {
    revokeDraftPreview();
    draftPreviewUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setRemoveRequested(false);
    setPreviewUrl(draftPreviewUrl);
    setFormError(undefined);
  }

  createEffect(
    () => props.open,
    (open) => {
      if (!open) {
        seededForSession = false;
        revokeDraftPreview();
        setSelectedFile(null);
        setRemoveRequested(false);
        setPreviewUrl(undefined);
        setFormError(undefined);
        return;
      }
      if (!seededForSession && !pending()) {
        setPreviewUrl(props.avatarUrl);
        setSelectedFile(null);
        setRemoveRequested(false);
        setFormError(undefined);
        seededForSession = true;
      }
    },
  );

  const displayPreview = () => {
    if (removeRequested()) return undefined;
    return previewUrl() ?? props.avatarUrl;
  };

  const isDirty = () => selectedFile() !== null || removeRequested();

  const canRemove = () => Boolean(props.avatarUrl) && !removeRequested() && !selectedFile();

  function requestClose() {
    if (pending()) return;
    if (isDirty()) {
      setDiscardConfirmOpen(true);
      return;
    }
    props.onClose();
  }

  function confirmDiscard() {
    setDiscardConfirmOpen(false);
    revokeDraftPreview();
    props.onClose();
  }

  async function save(event: Event) {
    event.preventDefault();
    if (pending()) return;

    const file = selectedFile();
    const remove = removeRequested();

    if (!file && !remove) {
      setFormError("Choose an image or remove your current photo to save.");
      return;
    }
    if (remove && !props.avatarUrl && !previewUrl()) {
      setFormError("You do not have a photo to remove.");
      return;
    }

    setPending(true);
    setFormError(undefined);
    try {
      await props.onSave({ file, remove });
      props.onClose();
    } catch (error) {
      if (error instanceof ProfileSaveError) {
        setFormError(error.message);
      } else {
        setFormError(applyProfileApiError(error).banner);
      }
    } finally {
      setPending(false);
    }
  }

  const fieldDisabled = () => pending();

  return (
    <>
    <ProfileEditorDialog
      open={props.open}
      titleId={TITLE_ID}
      title="Change profile photo"
      description="Upload a new image or remove your current photo. Changes save when you confirm."
      size="lg"
      closeBlocked={pending() || discardConfirmOpen()}
      onClose={() => props.onClose()}
      onRequestClose={requestClose}
    >
      <form class="space-y-5" onSubmit={(event) => void save(event)} aria-busy={pending() ? "true" : undefined}>
        <div class="flex flex-col items-center gap-3">
          <p class="text-label font-medium text-ink">Preview</p>
          <Show
            when={displayPreview()}
            fallback={
              <span
                class="flex size-32 items-center justify-center rounded-full bg-brand-soft text-3xl font-semibold text-brand ring-2 ring-line"
                aria-label="Initials preview"
              >
                {props.avatarInitials}
              </span>
            }
          >
            <img
              class="size-32 rounded-full object-cover ring-2 ring-line"
              src={displayPreview()!}
              alt="Profile photo preview"
              width={128}
              height={128}
            />
          </Show>
          <Show when={removeRequested()}>
            <p class="text-caption text-muted" role="status">
              Photo will be removed after you save.
            </p>
          </Show>
          <Show when={selectedFile()}>
            <p class="text-caption text-muted" role="status">
              {selectedFile()?.name}
            </p>
          </Show>
        </div>

        <Show when={!removeRequested()}>
          <ProfileAvatarUploadField
            disabled={fieldDisabled()}
            onFile={setFilePreview}
            onError={(message) => setFormError(message)}
          />
        </Show>

        <Show when={canRemove()}>
          <Button
            type="button"
            variant="secondary"
            disabled={fieldDisabled()}
            onClick={() => {
              revokeDraftPreview();
              setSelectedFile(null);
              setRemoveRequested(true);
              setPreviewUrl(undefined);
              setFormError(undefined);
            }}
          >
            Remove current photo
          </Button>
        </Show>

        <Show when={removeRequested()}>
          <Button
            type="button"
            variant="secondary"
            disabled={fieldDisabled()}
            onClick={() => {
              setRemoveRequested(false);
              setPreviewUrl(props.avatarUrl);
            }}
          >
            Undo remove
          </Button>
        </Show>

        <Show when={formError()}>
          <FormAlert variant="error">{formError()}</FormAlert>
        </Show>

        <ProfileFormFooter
          submitLabel="Save photo"
          pendingLabel="Saving…"
          pending={pending()}
          onCancel={requestClose}
        />
      </form>
    </ProfileEditorDialog>
    <ConfirmDialog
      open={discardConfirmOpen()}
      titleId="profile-avatar-discard-title"
      title="Discard unsaved changes?"
      description="Your photo selection and any removals will not be saved."
      cancelLabel="Keep editing"
      confirmLabel="Discard"
      emphasizeCancel
      onConfirm={confirmDiscard}
      onCancel={() => setDiscardConfirmOpen(false)}
    />
    </>
  );
}