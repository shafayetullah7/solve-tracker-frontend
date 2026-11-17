import { createEffect, createSignal, Show } from "solid-js";
import { applyProfileApiError } from "../../lib/forms/apply-profile-api-error";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { FormAlert } from "../ui/FormAlert";
import { AUTH_PASSWORD_HINT } from "../../lib/forms/auth-field-copy";
import { validatePasswordLength } from "../../lib/forms/validate-auth";
import { FormField, formFieldControlAttrs } from "../ui/FormField";
import { PasswordInput } from "../ui/PasswordInput";
import {
  PasswordCodePointMeter,
  passwordMeterId,
} from "../ui/PasswordCodePointMeter";
import { ProfileEditorDialog } from "./ProfileEditorDialog";
import { ProfileFormFooter } from "./ProfileFormFooter";

const TITLE_ID = "profile-password-editor-title";
const NEW_PASSWORD_ID = "profile-new-password";

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
  const [newPasswordFocused, setNewPasswordFocused] = createSignal(false);
  const [newPasswordBlurred, setNewPasswordBlurred] = createSignal(false);
  const [saveAttempted, setSaveAttempted] = createSignal(false);
  const [newPasswordError, setNewPasswordError] = createSignal<string | undefined>();

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
    setNewPasswordFocused(false);
    setNewPasswordBlurred(false);
    setSaveAttempted(false);
    setNewPasswordError(undefined);
  }

  const meterVisible = () =>
    newPasswordFocused() ||
    newPassword().length > 0 ||
    saveAttempted() ||
    newPasswordBlurred();
  const passwordMeterDescribedBy = () =>
    meterVisible() ? [passwordMeterId(NEW_PASSWORD_ID)] : undefined;

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
    setSaveAttempted(true);
    const current = currentPassword();
    const next = newPassword();
    const confirm = confirmPassword();
    setNewPasswordError(undefined);
    setFormError(undefined);
    if (!current) {
      setFormError("Enter your current password.");
      return;
    }
    if (!next) {
      setNewPasswordError("Enter a new password.");
      return;
    }
    const lengthErr = validatePasswordLength(next);
    if (lengthErr) {
      setNewPasswordError(lengthErr);
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
          <PasswordInput
            id="profile-current-password"
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
        <FormField
          id={NEW_PASSWORD_ID}
          label="New password"
          hint={AUTH_PASSWORD_HINT}
          hintVisibility="sr-only"
          error={newPasswordError()}
        >
          <PasswordInput
            autocomplete="new-password"
            disabled={pending()}
            {...formFieldControlAttrs({
              id: NEW_PASSWORD_ID,
              hint: AUTH_PASSWORD_HINT,
              extraDescribedBy: passwordMeterDescribedBy(),
              error: newPasswordError(),
            })}
            value={newPassword()}
            onInput={(event) => {
              setNewPassword(event.currentTarget.value);
              setNewPasswordError(undefined);
              setFormError(undefined);
            }}
            onFocus={() => setNewPasswordFocused(true)}
            onBlur={() => {
              setNewPasswordFocused(false);
              setNewPasswordBlurred(true);
            }}
          />
          <PasswordCodePointMeter
            fieldId={NEW_PASSWORD_ID}
            value={newPassword()}
            visible={meterVisible()}
          />
        </FormField>
        <FormField id="profile-confirm-password" label="Confirm new password">
          <PasswordInput
            id="profile-confirm-password"
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