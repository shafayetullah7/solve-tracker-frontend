import { useLocation, useNavigate } from "@solidjs/router";
import { createSignal, Show } from "solid-js";
import { AuthFormActions, authFormLinkClass } from "../components/auth/AuthFormActions";
import { AuthLayout } from "../components/auth/AuthLayout";
import { FormAlert } from "../components/ui/FormAlert";
import { FormField, formFieldControlAttrs } from "../components/ui/FormField";
import { PasswordInput } from "../components/ui/PasswordInput";
import {
  PasswordCodePointMeter,
  passwordMeterId,
} from "../components/ui/PasswordCodePointMeter";
import { createFormState } from "../lib/forms/create-form-state";
import { focusFirstInvalid } from "../lib/forms/focus-first-invalid";
import { HANDLE_FIELD_HINT } from "../lib/auth/user-handle";
import { AUTH_NAME_HINT, AUTH_PASSWORD_HINT } from "../lib/forms/auth-field-copy";
import { validateRegister } from "../lib/forms/validate-auth";
import { useAuth } from "../lib/auth/context";
import { useRedirectIfAuthenticated } from "../lib/auth/guest-auth-page";
import { safeReturnPath } from "../lib/auth/forms";
import { isGoogleOAuthEnabled } from "../lib/auth/google-oauth";
import { GOOGLE_PRACTICE_LOGOUT_NOTE } from "../lib/auth/oauth-error-copy";
import { AuthOAuthDivider } from "../components/auth/AuthOAuthDivider";
import { ContinueWithGoogle } from "../components/auth/ContinueWithGoogle";
import { paths } from "../router";

const REGISTER_PASSWORD_ID = "register-password";

export default function Register() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  useRedirectIfAuthenticated();
  const returnPath = () =>
    safeReturnPath(new URLSearchParams(location.search).get("next")) ?? "/app";
  const form = createFormState("auth");
  const [name, setName] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [handle, setHandle] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [passwordFocused, setPasswordFocused] = createSignal(false);
  const [passwordBlurred, setPasswordBlurred] = createSignal(false);

  const meterVisible = () =>
    passwordFocused() ||
    password().length > 0 ||
    form.submitAttempted() ||
    passwordBlurred();
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
      handle: handle(),
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
      const trimmedHandle = handle().trim();
      await auth.authApi.register({
        name: name().trim(),
        email: email().trim(),
        password: pwd,
        ...(trimmedHandle ? { handle: trimmedHandle } : {}),
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
      description="Access your private practice library."
      pageTitle="Register — Practice"
    >
      <form class="space-y-4" novalidate onSubmit={onSubmit}>
        <FormField
          id="register-name"
          label="Name"
          hint={AUTH_NAME_HINT}
          hintVisibility="sr-only"
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
          id="register-handle"
          label="Handle"
          hint={HANDLE_FIELD_HINT}
          error={form.fieldErrors().handle}
        >
          <input
            class="ui-field"
            autocomplete="off"
            spellcheck={false}
            {...formFieldControlAttrs({
              id: "register-handle",
              hint: HANDLE_FIELD_HINT,
              error: form.fieldErrors().handle,
            })}
            value={handle()}
            onInput={(event) => {
              setHandle(event.currentTarget.value);
              form.clearField("handle");
            }}
          />
        </FormField>
        <FormField
          id={REGISTER_PASSWORD_ID}
          label="Password"
          hint={AUTH_PASSWORD_HINT}
          hintVisibility="sr-only"
          error={form.fieldErrors().password}
        >
          <PasswordInput
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
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => {
              setPasswordFocused(false);
              setPasswordBlurred(true);
            }}
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
        <AuthFormActions
          pending={form.pending()}
          submitLabel="Create account"
          pendingLabel="Creating…"
        >
          <a class={authFormLinkClass("accent")} href={paths.login()}>
            Sign in instead
          </a>
        </AuthFormActions>
      </form>
      <Show when={isGoogleOAuthEnabled()}>
        <AuthOAuthDivider />
        <ContinueWithGoogle returnTo={returnPath()} />
        <p class="mt-3 text-center text-xs text-muted">{GOOGLE_PRACTICE_LOGOUT_NOTE}</p>
      </Show>
    </AuthLayout>
  );
}