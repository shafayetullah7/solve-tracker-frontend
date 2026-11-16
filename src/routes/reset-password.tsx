import { useNavigate } from "@solidjs/router";
import { createSignal, onSettled, Show } from "solid-js";
import { AuthLayout } from "../components/auth/AuthLayout";
import { Button } from "../components/ui/Button";
import { FormAlert } from "../components/ui/FormAlert";
import { FormField, formFieldControlAttrs } from "../components/ui/FormField";
import { applyAuthApiError } from "../lib/forms/apply-auth-api-error";
import { AUTH_PASSWORD_HINT } from "../lib/forms/auth-field-copy";
import type { FieldErrors } from "../lib/forms/field-errors";
import { AUTH_CLIENT_BANNER, validateReset } from "../lib/forms/validate-auth";
import { parseResetTokenFromHash } from "../lib/auth/forms";
import { useAuth } from "../lib/auth/context";
import { paths } from "../router";

export default function ResetPassword() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [token, setToken] = createSignal<string | undefined>();
  const [password, setPassword] = createSignal("");
  const [confirm, setConfirm] = createSignal("");
  const [pending, setPending] = createSignal(false);
  const [formError, setFormError] = createSignal<string | undefined>();
  const [retryAfter, setRetryAfter] = createSignal<string | undefined>();
  const [fieldErrors, setFieldErrors] = createSignal<FieldErrors>({});
  const [localError, setLocalError] = createSignal<string | undefined>();

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

  function patchFieldErrors(key: string) {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function onSubmit(event: Event) {
    event.preventDefault();
    if (pending()) return;
    const resetToken = token();
    if (!resetToken) {
      setLocalError("Open the password reset link from your email to continue.");
      setFieldErrors({});
      setFormError(undefined);
      return;
    }
    const clientErrors = validateReset({
      password: password(),
      confirm: confirm(),
    });
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setFormError(AUTH_CLIENT_BANNER);
      setLocalError(undefined);
      setRetryAfter(undefined);
      return;
    }
    setPending(true);
    setFormError(undefined);
    setLocalError(undefined);
    setRetryAfter(undefined);
    setFieldErrors({});
    const nextPassword = password();
    try {
      await auth.coordinator.runWithSessionLock(() =>
        auth.authApi.resetPassword({ token: resetToken, password: nextPassword }),
      );
      auth.clearSession();
      auth.notifyPeersLoggedOut();
      navigate(paths.login());
    } catch (error) {
      const applied = applyAuthApiError(error);
      setFieldErrors(applied.fieldErrors);
      setFormError(applied.banner);
      setRetryAfter(applied.retryAfter);
    } finally {
      setPending(false);
    }
  }

  const confirmError = () => fieldErrors().confirm;

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
            id="reset-password"
            label="New password"
            hint={AUTH_PASSWORD_HINT}
            error={fieldErrors().password}
          >
            <input
              class="ui-field"
              type="password"
              autocomplete="new-password"
              {...formFieldControlAttrs({
                id: "reset-password",
                hint: AUTH_PASSWORD_HINT,
                error: fieldErrors().password,
              })}
              value={password()}
              onInput={(event) => {
                setPassword(event.currentTarget.value);
                patchFieldErrors("password");
              }}
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
                patchFieldErrors("confirm");
              }}
            />
          </FormField>
          <Show when={localError()}>
            <FormAlert variant="error">{localError()}</FormAlert>
          </Show>
          <Show when={formError()}>
            <FormAlert variant="error" retryAfter={retryAfter()}>
              {formError()}
            </FormAlert>
          </Show>
          <Button type="submit" disabled={pending()}>
            {pending() ? "Saving…" : "Update password"}
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