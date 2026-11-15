import { useNavigate } from "@solidjs/router";
import { createSignal, Show } from "solid-js";
import { AuthLayout } from "../components/auth/AuthLayout";
import { Button } from "../components/ui/Button";
import { ApiError } from "../lib/api/errors";
import { authFormMessage, mapAuthFieldErrors } from "../lib/auth/forms";
import { useAuth } from "../lib/auth/context";
import { useRedirectIfAuthenticated } from "../lib/auth/guest-auth-page";
import { paths } from "../router";

export default function Register() {
  const auth = useAuth();
  const navigate = useNavigate();
  useRedirectIfAuthenticated();
  const [name, setName] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [pending, setPending] = createSignal(false);
  const [formError, setFormError] = createSignal<string | undefined>();
  const [fieldErrors, setFieldErrors] = createSignal<Record<string, string>>({});

  async function onSubmit(event: Event) {
    event.preventDefault();
    if (pending()) return;
    setPending(true);
    setFormError(undefined);
    setFieldErrors({});
    const pwd = password();
    try {
      await auth.authApi.register({
        name: name().trim(),
        email: email().trim(),
        password: pwd,
      });
      setPassword("");
      navigate(`${paths.login()}?registered=1`);
    } catch (error) {
      setPassword("");
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
      title="Create account"
      description="Name, email, and password. Email is not verified in this preview."
      pageTitle="Register — Practice"
    >
      <form class="space-y-4" onSubmit={onSubmit}>
        <div>
          <label class="mb-2 block text-sm font-medium" for="register-name">
            Name
          </label>
          <input
            id="register-name"
            class="ui-field"
            autocomplete="name"
            value={name()}
            onInput={(event) => setName(event.currentTarget.value)}
            aria-invalid={fieldErrors().name ? "true" : undefined}
            aria-describedby="register-name-hint register-name-error"
          />
          <p id="register-name-hint" class="mt-2 text-sm text-muted">
            1–100 characters after trimming.
          </p>
          <Show when={fieldErrors().name}>
            <p id="register-name-error" class="mt-2 text-sm text-danger">
              {fieldErrors().name}
            </p>
          </Show>
        </div>
        <div>
          <label class="mb-2 block text-sm font-medium" for="register-email">
            Email
          </label>
          <input
            id="register-email"
            class="ui-field"
            type="email"
            autocomplete="email"
            value={email()}
            onInput={(event) => setEmail(event.currentTarget.value)}
            aria-invalid={fieldErrors().email ? "true" : undefined}
            aria-describedby="register-email-error"
          />
          <Show when={fieldErrors().email}>
            <p id="register-email-error" class="mt-2 text-sm text-danger">
              {fieldErrors().email}
            </p>
          </Show>
        </div>
        <div>
          <label class="mb-2 block text-sm font-medium" for="register-password">
            Password
          </label>
          <input
            id="register-password"
            class="ui-field"
            type="password"
            autocomplete="new-password"
            value={password()}
            onInput={(event) => setPassword(event.currentTarget.value)}
            aria-invalid={fieldErrors().password ? "true" : undefined}
            aria-describedby="register-password-hint register-password-error"
          />
          <p id="register-password-hint" class="mt-2 text-sm text-muted">
            15–128 characters.
          </p>
          <Show when={fieldErrors().password}>
            <p id="register-password-error" class="mt-2 text-sm text-danger">
              {fieldErrors().password}
            </p>
          </Show>
        </div>
        <Show when={formError()}>
          <p class="text-sm text-danger" role="alert">
            {formError()}
          </p>
        </Show>
        <div class="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={pending()}>
            {pending() ? "Creating…" : "Create account"}
          </Button>
          <a class="text-sm text-muted underline-offset-4 hover:underline" href={paths.login()}>
            Sign in instead
          </a>
        </div>
      </form>
    </AuthLayout>
  );
}