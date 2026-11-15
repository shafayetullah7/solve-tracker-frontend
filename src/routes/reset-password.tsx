import { useNavigate } from "@solidjs/router";
import { createSignal, onSettled, Show } from "solid-js";
import { AuthLayout } from "../components/auth/AuthLayout";
import { Button } from "../components/ui/Button";
import { ApiError } from "../lib/api/errors";
import {
  authFormMessage,
  mapAuthFieldErrors,
  parseResetTokenFromHash,
} from "../lib/auth/forms";
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
  const [fieldErrors, setFieldErrors] = createSignal<Record<string, string>>({});
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

  async function onSubmit(event: Event) {
    event.preventDefault();
    if (pending()) return;
    const resetToken = token();
    if (!resetToken) {
      setLocalError("Open the password reset link from your email to continue.");
      return;
    }
    if (password() !== confirm()) {
      setLocalError("Passwords do not match.");
      return;
    }
    setPending(true);
    setFormError(undefined);
    setLocalError(undefined);
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
      if (error instanceof ApiError && error.details)
        setFieldErrors(mapAuthFieldErrors(error.details));
      setFormError(authFormMessage(error).message);
    } finally {
      setPending(false);
    }
  }

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
        <form class="space-y-4" onSubmit={onSubmit}>
          <div>
            <label class="mb-2 block text-sm font-medium" for="reset-password">
              New password
            </label>
            <input
              id="reset-password"
              class="ui-field"
              type="password"
              autocomplete="new-password"
              value={password()}
              onInput={(event) => setPassword(event.currentTarget.value)}
              aria-invalid={fieldErrors().password ? "true" : undefined}
              aria-describedby="reset-password-hint reset-password-error"
            />
            <p id="reset-password-hint" class="mt-2 text-sm text-muted">15–128 characters.</p>
            <Show when={fieldErrors().password}>
              <p id="reset-password-error" class="mt-2 text-sm text-danger">
                {fieldErrors().password}
              </p>
            </Show>
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium" for="reset-confirm">
              Confirm password
            </label>
            <input
              id="reset-confirm"
              class="ui-field"
              type="password"
              autocomplete="new-password"
              value={confirm()}
              onInput={(event) => setConfirm(event.currentTarget.value)}
            />
          </div>
          <Show when={localError()}>
            <p class="text-sm text-danger" role="alert">
              {localError()}
            </p>
          </Show>
          <Show when={formError()}>
            <p class="text-sm text-danger" role="alert">
              {formError()}
            </p>
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