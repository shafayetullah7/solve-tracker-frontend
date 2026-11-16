import { useNavigate } from "@solidjs/router";
import { createSignal, Show } from "solid-js";
import { AuthLayout } from "../components/auth/AuthLayout";
import { Button } from "../components/ui/Button";
import { FormAlert } from "../components/ui/FormAlert";
import { FormField, formFieldControlAttrs } from "../components/ui/FormField";
import { applyAuthApiError } from "../lib/forms/apply-auth-api-error";
import { AUTH_NAME_HINT, AUTH_PASSWORD_HINT } from "../lib/forms/auth-field-copy";
import type { FieldErrors } from "../lib/forms/field-errors";
import { AUTH_CLIENT_BANNER, validateRegister } from "../lib/forms/validate-auth";
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
  const [retryAfter, setRetryAfter] = createSignal<string | undefined>();
  const [fieldErrors, setFieldErrors] = createSignal<FieldErrors>({});

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
    const clientErrors = validateRegister({
      name: name(),
      email: email(),
      password: password(),
    });
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
      const applied = applyAuthApiError(error);
      setFieldErrors(applied.fieldErrors);
      setFormError(applied.banner);
      setRetryAfter(applied.retryAfter);
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
      <form class="space-y-4" novalidate onSubmit={onSubmit}>
        <FormField
          id="register-name"
          label="Name"
          hint={AUTH_NAME_HINT}
          error={fieldErrors().name}
        >
          <input
            class="ui-field"
            autocomplete="name"
            {...formFieldControlAttrs({
              id: "register-name",
              hint: AUTH_NAME_HINT,
              error: fieldErrors().name,
            })}
            value={name()}
            onInput={(event) => {
              setName(event.currentTarget.value);
              patchFieldErrors("name");
            }}
          />
        </FormField>
        <FormField id="register-email" label="Email" error={fieldErrors().email}>
          <input
            class="ui-field"
            type="email"
            autocomplete="email"
            {...formFieldControlAttrs({
              id: "register-email",
              error: fieldErrors().email,
            })}
            value={email()}
            onInput={(event) => {
              setEmail(event.currentTarget.value);
              patchFieldErrors("email");
            }}
          />
        </FormField>
        <FormField
          id="register-password"
          label="Password"
          hint={AUTH_PASSWORD_HINT}
          error={fieldErrors().password}
        >
          <input
            class="ui-field"
            type="password"
            autocomplete="new-password"
            {...formFieldControlAttrs({
              id: "register-password",
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
        <Show when={formError()}>
          <FormAlert variant="error" retryAfter={retryAfter()}>
            {formError()}
          </FormAlert>
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