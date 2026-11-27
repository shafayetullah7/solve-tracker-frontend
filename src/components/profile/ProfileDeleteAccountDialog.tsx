import { createEffect, createSignal, Show } from "solid-js";
import { applyProfileApiError } from "../../lib/forms/apply-profile-api-error";
import { AUTH_PASSWORD_HINT } from "../../lib/forms/auth-field-copy";
import { FormAlert } from "../ui/FormAlert";
import { FormField } from "../ui/FormField";
import { PasswordInput } from "../ui/PasswordInput";
import { ProfileEditorDialog } from "./ProfileEditorDialog";
import { ProfileFormFooter } from "./ProfileFormFooter";

const TITLE_ID = "profile-delete-account-title";
const CONFIRM_PHRASE = "DELETE";

export type ProfileDeleteAccountDialogProps = {
  open: boolean;
  onClose: () => void;
  onDelete: (input: { password: string; confirmation: string }) => Promise<void>;
};

export function ProfileDeleteAccountDialog(props: ProfileDeleteAccountDialogProps) {
  const [password, setPassword] = createSignal("");
  const [confirmation, setConfirmation] = createSignal("");
  const [formError, setFormError] = createSignal<string | undefined>();
  const [pending, setPending] = createSignal(false);

  createEffect(
    () => props.open,
    (open) => {
      if (open) resetFields();
    },
  );

  function resetFields() {
    setPassword("");
    setConfirmation("");
    setFormError(undefined);
  }

  const canSubmit = () =>
    password().length > 0 && confirmation() === CONFIRM_PHRASE && !pending();

  async function submit(event: Event) {
    event.preventDefault();
    if (!canSubmit()) return;
    setPending(true);
    setFormError(undefined);
    try {
      await props.onDelete({ password: password(), confirmation: confirmation() });
      resetFields();
      props.onClose();
    } catch (error) {
      const { banner, fieldErrors } = applyProfileApiError(error);
      setFormError(banner ?? fieldErrors.password ?? fieldErrors.confirmation);
    } finally {
      setPending(false);
    }
  }

  return (
    <ProfileEditorDialog
      open={props.open}
      titleId={TITLE_ID}
      title="Delete account"
      description="This permanently removes your profile, guides, library, and progress. This cannot be undone."
      onClose={() => {
        if (pending()) return;
        resetFields();
        props.onClose();
      }}
      closeBlocked={pending()}
    >
      <form class="space-y-4" onSubmit={(event) => void submit(event)}>
        <Show when={formError()}>
          <FormAlert variant="error">{formError()}</FormAlert>
        </Show>
        <FormField
          id="profile-delete-password"
          label="Current password"
          hint={AUTH_PASSWORD_HINT}
        >
          <PasswordInput
            id="profile-delete-password"
            value={password()}
            autocomplete="current-password"
            disabled={pending()}
            onInput={(event) => setPassword(event.currentTarget.value)}
          />
        </FormField>
        <FormField
          id="profile-delete-confirm"
          label="Type DELETE to confirm"
          hint="Required to prevent accidental deletion."
        >
          <input
            id="profile-delete-confirm"
            class="ui-input w-full"
            value={confirmation()}
            autocomplete="off"
            disabled={pending()}
            onInput={(event) => setConfirmation(event.currentTarget.value)}
          />
        </FormField>
        <ProfileFormFooter
          submitLabel={pending() ? "Deleting…" : "Delete account permanently"}
          submitDisabled={!canSubmit()}
          pending={pending()}
          pendingLabel="Deleting…"
          onCancel={() => {
            if (pending()) return;
            resetFields();
            props.onClose();
          }}
        />
      </form>
    </ProfileEditorDialog>
  );
}

export function deleteAccountConfirmEnabled(confirmation: string): boolean {
  return confirmation === CONFIRM_PHRASE;
}