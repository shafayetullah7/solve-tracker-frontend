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

const TITLE_ID = "profile-set-password-title";
const NEW_PASSWORD_ID = "profile-set-new-password";

export type ProfileSetPasswordDialogProps = {
  open: boolean;
  onClose: () => void;
  onSave: (input: { newPassword: string }) => Promise<void>;
};

export function ProfileSetPasswordDialog(props: ProfileSetPasswordDialogProps) {
  const [newPassword, setNewPassword] = createSignal("");
  const [confirmPassword, setConfirmPassword] = createSignal("");
  const [formError, setFormError] = createSignal<string | undefined>();
  const [pending, setPending] = createSignal(false);
  const [discardConfirmOpen, setDiscardConfirmOpen] = createSignal(false);
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
    setNewPassword("");
    setConfirmPassword("");
    setFormError(undefined);
    setDiscardConfirmOpen(false);
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

  const isDirty = () => Boolean(newPassword() || confirmPassword());

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
    const next = newPassword();
    const confirm = confirmPassword();
    setNewPasswordError(undefined);
    setFormError(undefined);
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
      setFormError("Passwords do not match.");
      return;
    }
    setPending(true);
    try {
      await props.onSave({ newPassword: next });
      resetFields();
      props.onClose();
    } catch (error) {
      const { banner, fieldErrors } = applyProfileApiError(error);
      setFormError(banner);
      if (fieldErrors.newPassword) setNewPasswordError(fieldErrors.newPassword);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <ProfileEditorDialog
        open={props.open}
        titleId={TITLE_ID}
        title="Set a password"
        description="Add a password so you can sign in without Google and unlink Google from this account."
        closeBlocked={pending() || discardConfirmOpen()}
        onClose={() => props.onClose()}
        onRequestClose={requestClose}
      >
        <form
          class="space-y-4"
          onSubmit={(event) => void save(event)}
          aria-busy={pending() ? "true" : undefined}
        >
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
          <FormField id="profile-set-confirm-password" label="Confirm password">
            <PasswordInput
              id="profile-set-confirm-password"
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
            submitLabel="Set password"
            pendingLabel="Saving…"
            onCancel={requestClose}
          />
        </form>
      </ProfileEditorDialog>
      <ConfirmDialog
        open={discardConfirmOpen()}
        titleId="profile-set-password-discard-title"
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