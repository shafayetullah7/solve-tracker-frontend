import { createEffect, createSignal, Show } from "solid-js";
import { applyProfileApiError } from "../../lib/forms/apply-profile-api-error";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { FormAlert } from "../ui/FormAlert";
import { FormField } from "../ui/FormField";
import { ProfileEditorDialog } from "./ProfileEditorDialog";
import { ProfileFormFooter } from "./ProfileFormFooter";

const TITLE_ID = "profile-password-editor-title";

export type ProfilePasswordEditorDialogProps = {
  open: boolean;
  onClose: () => void;
  onSave: (input: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<void>;
};

export function ProfilePasswordEditorDialog(props: ProfilePasswordEditorDialogProps) {
  const [currentPassword, setCurrentPassword] = createSignal("");
  const [newPassword, setNewPassword] = createSignal("");
  const [confirmPassword, setConfirmPassword] = createSignal("");
  const [formError, setFormError] = createSignal<string | undefined>();
  const [pending, setPending] = createSignal(false);
  const [discardConfirmOpen, setDiscardConfirmOpen] = createSignal(false);
  const [currentTouched, setCurrentTouched] = createSignal(false);

  createEffect(
    () => props.open,
    (open) => {
      if (open) resetFields();
    },
  );

  function resetFields() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setFormError(undefined);
    setDiscardConfirmOpen(false);
    setCurrentTouched(false);
  }

  const isDirty = () =>
    Boolean(
      newPassword() ||
        confirmPassword() ||
        (currentTouched() && currentPassword()),
    );

  function requestClose() {
    if (pending()) return;
    if (isDirty()) {
      setDiscardConfirmOpen(true);
      return;
    }
    resetFields();
    props.onClose();
  }

  function confirmDiscard() {
    setDiscardConfirmOpen(false);
    resetFields();
    props.onClose();
  }

  async function save(event: Event) {
    event.preventDefault();
    if (pending()) return;
    const current = currentPassword();
    const next = newPassword();
    const confirm = confirmPassword();
    if (!current) {
      setFormError("Enter your current password.");
      return;
    }
    if (!next) {
      setFormError("Enter a new password.");
      return;
    }
    if (next !== confirm) {
      setFormError("New passwords do not match.");
      return;
    }
    setPending(true);
    setFormError(undefined);
    try {
      await props.onSave({ currentPassword: current, newPassword: next });
      resetFields();
      props.onClose();
    } catch (error) {
      setFormError(applyProfileApiError(error).banner);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
    <ProfileEditorDialog
      open={props.open}
      titleId={TITLE_ID}
      title="Change password"
      description="You will be signed out on all devices after your password changes."
      closeBlocked={pending() || discardConfirmOpen()}
      onClose={() => props.onClose()}
      onRequestClose={requestClose}
    >
      <form
        class="space-y-4"
        onSubmit={(event) => void save(event)}
        aria-busy={pending() ? "true" : undefined}
      >
        <FormField id="profile-current-password" label="Current password">
          <input
            id="profile-current-password"
            class="ui-field"
            type="password"
            autocomplete="current-password"
            disabled={pending()}
            value={currentPassword()}
            onInput={(event) => {
              setCurrentTouched(true);
              setCurrentPassword(event.currentTarget.value);
              setFormError(undefined);
            }}
          />
        </FormField>
        <FormField id="profile-new-password" label="New password">
          <input
            id="profile-new-password"
            class="ui-field"
            type="password"
            autocomplete="new-password"
            disabled={pending()}
            value={newPassword()}
            onInput={(event) => {
              setNewPassword(event.currentTarget.value);
              setFormError(undefined);
            }}
          />
        </FormField>
        <FormField id="profile-confirm-password" label="Confirm new password">
          <input
            id="profile-confirm-password"
            class="ui-field"
            type="password"
            autocomplete="new-password"
            disabled={pending()}
            value={confirmPassword()}
            onInput={(event) => {
              setConfirmPassword(event.currentTarget.value);
              setFormError(undefined);
            }}
          />
        </FormField>
        <Show when={formError()}>
          <FormAlert variant="error">{formError()}</FormAlert>
        </Show>
        <ProfileFormFooter
          pending={pending()}
          submitLabel="Update password"
          pendingLabel="Updating…"
          onCancel={requestClose}
        />
      </form>
    </ProfileEditorDialog>
    <ConfirmDialog
      open={discardConfirmOpen()}
      titleId="profile-password-discard-title"
      title="Discard unsaved changes?"
      description="Your new password will not be saved."
      cancelLabel="Keep editing"
      confirmLabel="Discard"
      emphasizeCancel
      onConfirm={confirmDiscard}
      onCancel={() => setDiscardConfirmOpen(false)}
    />
    </>
  );
}