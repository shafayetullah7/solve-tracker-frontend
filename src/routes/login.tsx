import { useLocation, useNavigate } from "@solidjs/router";
import { createSignal, Show } from "solid-js";
import { AuthLayout } from "../components/auth/AuthLayout";
import { Button } from "../components/ui/Button";
import { FormAlert } from "../components/ui/FormAlert";
import { FormField, formFieldControlAttrs } from "../components/ui/FormField";
import { createFormState } from "../lib/forms/create-form-state";
import { focusFirstInvalid } from "../lib/forms/focus-first-invalid";
import { validateLogin } from "../lib/forms/validate-auth";
import { safeReturnPath } from "../lib/auth/forms";
import { useAuth } from "../lib/auth/context";
import { useRedirectIfAuthenticated } from "../lib/auth/guest-auth-page";
import { paths } from "../router";

export default function Login() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  useRedirectIfAuthenticated();
  const form = createFormState("auth");
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");

  const registered = () =>
    new URLSearchParams(location.search).get("registered") === "1";
  const returnPath = () =>
    safeReturnPath(new URLSearchParams(location.search).get("next"));

  async function onSubmit(event: Event) {
    event.preventDefault();
    if (form.pending()) return;
    const formEl = event.currentTarget as HTMLFormElement;
    const clientErrors = validateLogin({ email: email(), password: password() });
    if (Object.keys(clientErrors).length > 0) {
      form.applyClientErrors(clientErrors);
      focusFirstInvalid(formEl);
      return;
    }
    form.beginSubmit();
    form.setPending(true);
    try {
      await auth.login({ email: email().trim(), password: password() });
      navigate(returnPath() ?? paths.app());
    } catch (error) {
      form.applyApiError(error);
      focusFirstInvalid(formEl);
    } finally {
      form.setPending(false);
    }
  }

  const emailError = () => form.fieldErrors().email;
  const passwordError = () => form.fieldErrors().password;

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
              form.clearField("email");
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
              form.clearField("password");
            }}
          />
        </FormField>
        <Show when={form.formBanner()}>
          <FormAlert variant="error" retryAfter={form.retryAfter()}>
            {form.formBanner()}
          </FormAlert>
        </Show>
        <div class="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={form.pending()}>
            {form.pending() ? "Signing in…" : "Sign in"}
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