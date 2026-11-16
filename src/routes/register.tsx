import { useNavigate } from "@solidjs/router";
import { createSignal, Show } from "solid-js";
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
import { AUTH_NAME_HINT, AUTH_PASSWORD_HINT } from "../lib/forms/auth-field-copy";
import { validateRegister } from "../lib/forms/validate-auth";
import { useAuth } from "../lib/auth/context";
import { useRedirectIfAuthenticated } from "../lib/auth/guest-auth-page";
import { paths } from "../router";

const REGISTER_PASSWORD_ID = "register-password";

export default function Register() {
  const auth = useAuth();
  const navigate = useNavigate();
  useRedirectIfAuthenticated();
  const form = createFormState("auth");
  const [name, setName] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [passwordBlurred, setPasswordBlurred] = createSignal(false);

  const meterVisible = () => form.submitAttempted() || passwordBlurred();
  const passwordMeterDescribedBy = () =>
    meterVisible() ? [passwordMeterId(REGISTER_PASSWORD_ID)] : undefined;

  async function onSubmit(event: Event) {
    event.preventDefault();
    if (form.pending()) return;
    const formEl = event.currentTarget as HTMLFormElement;
    const clientErrors = validateRegister({
      name: name(),
      email: email(),
      password: password(),
    });
    if (Object.keys(clientErrors).length > 0) {
      form.applyClientErrors(clientErrors);
      focusFirstInvalid(formEl);
      return;
    }
    form.beginSubmit();
    form.setPending(true);
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
      form.applyApiError(error);
      focusFirstInvalid(formEl);
    } finally {
      form.setPending(false);
    }
  }

  return (
    <AuthLayout
      title="Create account"
      description="Name, email, and password. Email is not verified in this preview."
      pageTitle="Register — Practice"
    >
      <form class="space-y-4" novalidate onSubmit={onSubmit}>
        <FormField
          id="register-name"
          label="Name"
          hint={AUTH_NAME_HINT}
          error={form.fieldErrors().name}
        >
          <input
            class="ui-field"
            autocomplete="name"
            {...formFieldControlAttrs({
              id: "register-name",
              hint: AUTH_NAME_HINT,
              error: form.fieldErrors().name,
            })}
            value={name()}
            onInput={(event) => {
              setName(event.currentTarget.value);
              form.clearField("name");
            }}
          />
        </FormField>
        <FormField id="register-email" label="Email" error={form.fieldErrors().email}>
          <input
            class="ui-field"
            type="email"
            autocomplete="email"
            {...formFieldControlAttrs({
              id: "register-email",
              error: form.fieldErrors().email,
            })}
            value={email()}
            onInput={(event) => {
              setEmail(event.currentTarget.value);
              form.clearField("email");
            }}
          />
        </FormField>
        <FormField
          id={REGISTER_PASSWORD_ID}
          label="Password"
          hint={AUTH_PASSWORD_HINT}
          error={form.fieldErrors().password}
        >
          <input
            class="ui-field"
            type="password"
            autocomplete="new-password"
            {...formFieldControlAttrs({
              id: REGISTER_PASSWORD_ID,
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
            fieldId={REGISTER_PASSWORD_ID}
            value={password()}
            visible={meterVisible()}
          />
        </FormField>
        <Show when={form.formBanner()}>
          <FormAlert variant="error" retryAfter={form.retryAfter()}>
            {form.formBanner()}
          </FormAlert>
        </Show>
        <div class="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={form.pending()}>
            {form.pending() ? "Creating…" : "Create account"}
          </Button>
          <a class="text-sm text-muted underline-offset-4 hover:underline" href={paths.login()}>
            Sign in instead
          </a>
        </div>
      </form>
    </AuthLayout>
  );
}