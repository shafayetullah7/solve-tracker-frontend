import { useLocation, useNavigate } from "@solidjs/router";
import { createSignal, Show } from "solid-js";
import { AuthLayout } from "../components/auth/AuthLayout";
import { Button } from "../components/ui/Button";
import { ApiError } from "../lib/api/errors";
import {
  authFormMessage,
  mapAuthFieldErrors,
  safeReturnPath,
} from "../lib/auth/forms";
import { useAuth } from "../lib/auth/context";
import { useRedirectIfAuthenticated } from "../lib/auth/guest-auth-page";
import { paths } from "../router";

export default function Login() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  useRedirectIfAuthenticated();
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [pending, setPending] = createSignal(false);
  const [formError, setFormError] = createSignal<string | undefined>();
  const [fieldErrors, setFieldErrors] = createSignal<Record<string, string>>({});

  const registered = () =>
    new URLSearchParams(location.search).get("registered") === "1";
  const returnPath = () =>
    safeReturnPath(new URLSearchParams(location.search).get("next"));

  async function onSubmit(event: Event) {
    event.preventDefault();
    if (pending()) return;
    setPending(true);
    setFormError(undefined);
    setFieldErrors({});
    try {
      await auth.login({ email: email().trim(), password: password() });
      navigate(returnPath() ?? paths.app());
    } catch (error) {
      if (error instanceof ApiError && error.details)
        setFieldErrors(mapAuthFieldErrors(error.details));
      const message = authFormMessage(error);
      setFormError(message.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthLayout
      title="Sign in"
      description="Access your private practice library."
      pageTitle="Sign in — Practice"
    >
      <Show when={registered()}>
        <p class="mb-4 rounded-lg bg-brand-soft p-3 text-sm text-brand" role="status">
          Account created. Sign in when you are ready.
        </p>
      </Show>
      <form class="space-y-4" onSubmit={onSubmit}>
        <div>
          <label class="mb-2 block text-sm font-medium" for="login-email">
            Email
          </label>
          <input
            id="login-email"
            class="ui-field"
            type="email"
            autocomplete="username"
            value={email()}
            onInput={(event) => setEmail(event.currentTarget.value)}
            aria-invalid={fieldErrors().email ? "true" : undefined}
            aria-describedby="login-email-error"
          />
          <Show when={fieldErrors().email}>
            <p id="login-email-error" class="mt-2 text-sm text-danger">
              {fieldErrors().email}
            </p>
          </Show>
        </div>
        <div>
          <label class="mb-2 block text-sm font-medium" for="login-password">
            Password
          </label>
          <input
            id="login-password"
            class="ui-field"
            type="password"
            autocomplete="current-password"
            value={password()}
            onInput={(event) => setPassword(event.currentTarget.value)}
          />
        </div>
        <Show when={formError()}>
          <p class="text-sm text-danger" role="alert">
            {formError()}
          </p>
        </Show>
        <div class="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={pending()}>
            {pending() ? "Signing in…" : "Sign in"}
          </Button>
          <a class="text-sm text-brand underline-offset-4 hover:underline" href={paths.register()}>
            Create account
          </a>
          <a
            class="text-sm text-muted underline-offset-4 hover:underline"
            href={paths["forgot-password"]()}
          >
            Forgot password?
          </a>
        </div>
      </form>
    </AuthLayout>
  );
}