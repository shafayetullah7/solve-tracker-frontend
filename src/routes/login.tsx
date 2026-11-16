import { useLocation, useNavigate } from "@solidjs/router";
import { createSignal, Show } from "solid-js";
import { AuthLayout } from "../components/auth/AuthLayout";
import { Button } from "../components/ui/Button";
import { FormAlert } from "../components/ui/FormAlert";
import { FormField, formFieldControlAttrs } from "../components/ui/FormField";
import { applyAuthApiError } from "../lib/forms/apply-auth-api-error";
import type { FieldErrors } from "../lib/forms/field-errors";
import { AUTH_CLIENT_BANNER, validateLogin } from "../lib/forms/validate-auth";
import { safeReturnPath } from "../lib/auth/forms";
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
  const [retryAfter, setRetryAfter] = createSignal<string | undefined>();
  const [fieldErrors, setFieldErrors] = createSignal<FieldErrors>({});

  const registered = () =>
    new URLSearchParams(location.search).get("registered") === "1";
  const returnPath = () =>
    safeReturnPath(new URLSearchParams(location.search).get("next"));

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
    const clientErrors = validateLogin({ email: email(), password: password() });
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setFormError(AUTH_CLIENT_BANNER);
      setRetryAfter(undefined);
      return;
    }
    setPending(true);
    setFormError(undefined);
    setRetryAfter(undefined);
    setFieldErrors({});
    try {
      await auth.login({ email: email().trim(), password: password() });
      navigate(returnPath() ?? paths.app());
    } catch (error) {
      const applied = applyAuthApiError(error);
      setFieldErrors(applied.fieldErrors);
      setFormError(applied.banner);
      setRetryAfter(applied.retryAfter);
    } finally {
      setPending(false);
    }
  }

  const emailError = () => fieldErrors().email;
  const passwordError = () => fieldErrors().password;

  return (
    <AuthLayout
      title="Sign in"
      description="Access your private practice library."
      pageTitle="Sign in — Practice"
    >
      <Show when={registered()}>
        <FormAlert variant="success" prominent class="mb-4">
          Account created. Sign in when you are ready.
        </FormAlert>
      </Show>
      <form class="space-y-4" novalidate onSubmit={onSubmit}>
        <FormField id="login-email" label="Email" error={emailError()}>
          <input
            class="ui-field"
            type="email"
            autocomplete="username"
            {...formFieldControlAttrs({
              id: "login-email",
              error: emailError(),
            })}
            value={email()}
            onInput={(event) => {
              setEmail(event.currentTarget.value);
              patchFieldErrors("email");
            }}
          />
        </FormField>
        <FormField id="login-password" label="Password" error={passwordError()}>
          <input
            class="ui-field"
            type="password"
            autocomplete="current-password"
            {...formFieldControlAttrs({
              id: "login-password",
              error: passwordError(),
            })}
            value={password()}
            onInput={(event) => {
              setPassword(event.currentTarget.value);
              patchFieldErrors("password");
            }}
          />
        </FormField>
        <Show when={formError()}>
          <FormAlert variant="error" retryAfter={retryAfter()}>
            {formError()}
          </FormAlert>
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