import { createEffect, createSignal, Show } from "solid-js";
import { applyProfileApiError } from "../../lib/forms/apply-profile-api-error";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { FormAlert } from "../ui/FormAlert";
import { FormField } from "../ui/FormField";
import { ProfileEditorDialog } from "./ProfileEditorDialog";
import { ProfileFormFooter } from "./ProfileFormFooter";

const BIO_MAX = 280;
const TITLE_ID = "profile-about-editor-title";

export type ProfileAboutEditorDialogProps = {
  open: boolean;
  displayName: string;
  bio: string;
  onClose: () => void;
  onSave: (values: { displayName: string; bio: string }) => Promise<void>;
};

export function ProfileAboutEditorDialog(props: ProfileAboutEditorDialogProps) {
  const [name, setName] = createSignal("");
  const [bio, setBio] = createSignal("");
  const [seedName, setSeedName] = createSignal("");
  const [seedBio, setSeedBio] = createSignal("");
  const [formError, setFormError] = createSignal<string | undefined>();
  const [pending, setPending] = createSignal(false);
  const [discardConfirmOpen, setDiscardConfirmOpen] = createSignal(false);

  let seededForSession = false;

  createEffect(
    () => props.open,
    (open) => {
      if (!open) {
        seededForSession = false;
        return;
      }
      if (!seededForSession && !pending()) {
        setName(props.displayName);
        setBio(props.bio);
        setSeedName(props.displayName);
        setSeedBio(props.bio);
        setFormError(undefined);
        seededForSession = true;
      }
    },
  );

  const isDirty = () => name() !== seedName() || bio() !== seedBio();

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
    props.onClose();
  }

  async function save(event: Event) {
    event.preventDefault();
    if (pending()) return;
    const trimmedName = name().trim();
    if (!trimmedName) {
      setFormError("Display name is required.");
      return;
    }
    if (bio().length > BIO_MAX) {
      setFormError(`Bio must be ${BIO_MAX} characters or fewer.`);
      return;
    }
    setPending(true);
    setFormError(undefined);
    try {
      await props.onSave({ displayName: trimmedName, bio: bio() });
      props.onClose();
    } catch (error) {
      setFormError(applyProfileApiError(error).banner);
    } finally {
      setPending(false);
    }
  }

  const bioCount = () => bio().length;
  const fieldDisabled = () => pending();

  return (
    <>
    <ProfileEditorDialog
      open={props.open}
      titleId={TITLE_ID}
      title="Edit about you"
      description="Changes are saved when you confirm. Profile APIs are still in preview."
      size="lg"
      closeBlocked={pending() || discardConfirmOpen()}
      onClose={() => props.onClose()}
      onRequestClose={requestClose}
    >
      <form class="space-y-4" onSubmit={(event) => void save(event)} aria-busy={pending() ? "true" : undefined}>
        <FormField id="profile-about-editor-name" label="Display name">
          <input
            id="profile-about-editor-name"
            class="ui-field"
            type="text"
            autocomplete="name"
            disabled={fieldDisabled()}
            value={name()}
            onInput={(event) => {
              setName(event.currentTarget.value);
              setFormError(undefined);
            }}
          />
        </FormField>
        <FormField id="profile-about-editor-bio" label="Bio">
          <textarea
            id="profile-about-editor-bio"
            class="ui-field min-h-40 w-full"
            maxlength={BIO_MAX}
            disabled={fieldDisabled()}
            value={bio()}
            onInput={(event) => {
              setBio(event.currentTarget.value);
              setFormError(undefined);
            }}
          />
          <p class="mt-2 text-caption text-muted tabular-nums">
            {bioCount()} / {BIO_MAX}
          </p>
        </FormField>
        <Show when={formError()}>
          <FormAlert variant="error">{formError()}</FormAlert>
        </Show>
        <ProfileFormFooter
          submitLabel="Save about you"
          pending={pending()}
          onCancel={requestClose}
        />
      </form>
    </ProfileEditorDialog>
    <ConfirmDialog
      open={discardConfirmOpen()}
      titleId="profile-about-discard-title"
      title="Discard unsaved changes?"
      description="Anything you entered in this form will be lost."
      cancelLabel="Keep editing"
      confirmLabel="Discard"
      emphasizeCancel
      onConfirm={confirmDiscard}
      onCancel={() => setDiscardConfirmOpen(false)}
    />
    </>
  );
}