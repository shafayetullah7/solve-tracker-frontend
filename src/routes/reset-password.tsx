import { useNavigate } from "@solidjs/router";
import { createSignal, onSettled, Show } from "solid-js";
import { AuthLayout } from "../components/auth/AuthLayout";
import { Button } from "../components/ui/Button";
import { FormAlert } from "../components/ui/FormAlert";
import { FormField, formFieldControlAttrs } from "../components/ui/FormField";
import {
  PasswordCodePointMeter,
  passwordMeterId,
} from "../components/ui/PasswordCodePointMeter";
import { createFormState } from "../lib/forms/create-form-state";
import { focusFirstInvalid } from "../lib/forms/focus-first-invalid";
import { AUTH_PASSWORD_HINT } from "../lib/forms/auth-field-copy";
import { validateReset } from "../lib/forms/validate-auth";
import { parseResetTokenFromHash } from "../lib/auth/forms";
import { useAuth } from "../lib/auth/context";
import { paths } from "../router";

const RESET_PASSWORD_ID = "reset-password";

export default function ResetPassword() {
  const auth = useAuth();
  const navigate = useNavigate();
  const form = createFormState("auth");
  const [token, setToken] = createSignal<string | undefined>();
  const [password, setPassword] = createSignal("");
  const [confirm, setConfirm] = createSignal("");
  const [localError, setLocalError] = createSignal<string | undefined>();
  const [passwordBlurred, setPasswordBlurred] = createSignal(false);

  onSettled(() => {
    if (typeof window === "undefined") return;
    const parsed = parseResetTokenFromHash(window.location.hash);
    if (parsed) {
      setToken(parsed);
      const url = new URL(window.location.href);
      url.hash = "";
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  });

  const meterVisible = () => form.submitAttempted() || passwordBlurred();
  const passwordMeterDescribedBy = () =>
    meterVisible() ? [passwordMeterId(RESET_PASSWORD_ID)] : undefined;

  async function onSubmit(event: Event) {
    event.preventDefault();
    if (form.pending()) return;
    const formEl = event.currentTarget as HTMLFormElement;
    const resetToken = token();
    if (!resetToken) {
      setLocalError("Open the password reset link from your email to continue.");
      form.resetErrors();
      return;
    }
    const clientErrors = validateReset({
      password: password(),
      confirm: confirm(),
    });
    if (Object.keys(clientErrors).length > 0) {
      form.applyClientErrors(clientErrors);
      setLocalError(undefined);
      focusFirstInvalid(formEl);
      return;
    }
    form.beginSubmit();
    setLocalError(undefined);
    form.setPending(true);
    const nextPassword = password();
    try {
      await auth.coordinator.runWithSessionLock(() =>
        auth.authApi.resetPassword({ token: resetToken, password: nextPassword }),
      );
      auth.clearSession();
      auth.notifyPeersLoggedOut();
      navigate(paths.login());
    } catch (error) {
      form.applyApiError(error);
      focusFirstInvalid(formEl);
    } finally {
      form.setPending(false);
    }
  }

  const confirmError = () => form.fieldErrors().confirm;

  return (
    <AuthLayout
      title="Choose a new password"
      description="This page works only from your reset email link."
      pageTitle="Reset password — Practice"
    >
      <Show
        when={token()}
        fallback={
          <p class="text-sm text-muted">
            Open the reset link from your email. If you already submitted the form, you
            may need to request a new link.
          </p>
        }
      >
        <form class="space-y-4" novalidate onSubmit={onSubmit}>
          <FormField
            id={RESET_PASSWORD_ID}
            label="New password"
            hint={AUTH_PASSWORD_HINT}
            error={form.fieldErrors().password}
          >
            <input
              class="ui-field"
              type="password"
              autocomplete="new-password"
              {...formFieldControlAttrs({
                id: RESET_PASSWORD_ID,
                hint: AUTH_PASSWORD_HINT,
                extraDescribedBy: passwordMeterDescribedBy(),
                error: form.fieldErrors().password,
              })}
              value={password()}
              onInput={(event) => {
                setPassword(event.currentTarget.value);
                form.clearField("password");
              }}
              onBlur={() => setPasswordBlurred(true)}
            />
            <PasswordCodePointMeter
              fieldId={RESET_PASSWORD_ID}
              value={password()}
              visible={meterVisible()}
            />
          </FormField>
          <FormField
            id="reset-confirm"
            label="Confirm password"
            error={confirmError()}
          >
            <input
              class="ui-field"
              type="password"
              autocomplete="new-password"
              {...formFieldControlAttrs({
                id: "reset-confirm",
                error: confirmError(),
              })}
              value={confirm()}
              onInput={(event) => {
                setConfirm(event.currentTarget.value);
                form.clearField("confirm");
              }}
            />
          </FormField>
          <Show when={localError()}>
            <FormAlert variant="error">{localError()}</FormAlert>
          </Show>
          <Show when={form.formBanner()}>
            <FormAlert variant="error" retryAfter={form.retryAfter()}>
              {form.formBanner()}
            </FormAlert>
          </Show>
          <Button type="submit" disabled={form.pending()}>
            {form.pending() ? "Saving…" : "Update password"}
          </Button>
        </form>
      </Show>
      <p class="mt-6 text-sm">
        <a class="text-brand underline-offset-4 hover:underline" href={paths["forgot-password"]()}>
          Request a new reset link
        </a>
      </p>
    </AuthLayout>
  );
}