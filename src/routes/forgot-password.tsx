import { createSignal, Show } from "solid-js";
import { AuthLayout } from "../components/auth/AuthLayout";
import { Button } from "../components/ui/Button";
import { FormAlert } from "../components/ui/FormAlert";
import { FormField, formFieldControlAttrs } from "../components/ui/FormField";
import { applyAuthApiError } from "../lib/forms/apply-auth-api-error";
import type { FieldErrors } from "../lib/forms/field-errors";
import { AUTH_CLIENT_BANNER, validateForgot } from "../lib/forms/validate-auth";
import { useAuth } from "../lib/auth/context";
import { paths } from "../router";

export default function ForgotPassword() {
  const auth = useAuth();
  const [email, setEmail] = createSignal("");
  const [pending, setPending] = createSignal(false);
  const [accepted, setAccepted] = createSignal<string | undefined>();
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
    const clientErrors = validateForgot({ email: email() });
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setFormError(AUTH_CLIENT_BANNER);
      setRetryAfter(undefined);
      setAccepted(undefined);
      return;
    }
    setPending(true);
    setFormError(undefined);
    setRetryAfter(undefined);
    setFieldErrors({});
    setAccepted(undefined);
    try {
      const response = await auth.authApi.forgotPassword({ email: email().trim() });
      setAccepted(response.message);
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
      title="Forgot password"
      description="Enter your email. We use the same response whether or not an account exists."
      pageTitle="Forgot password — Practice"
    >
      <form class="space-y-4" novalidate onSubmit={onSubmit}>
        <FormField id="forgot-email" label="Email" error={fieldErrors().email}>
          <input
            class="ui-field"
            type="email"
            autocomplete="email"
            {...formFieldControlAttrs({
              id: "forgot-email",
              error: fieldErrors().email,
            })}
            value={email()}
            onInput={(event) => {
              setEmail(event.currentTarget.value);
              patchFieldErrors("email");
            }}
          />
        </FormField>
        <Show when={accepted()}>
          <FormAlert variant="success">{accepted()}</FormAlert>
        </Show>
        <Show when={formError()}>
          <FormAlert variant="error" retryAfter={retryAfter()}>
            {formError()}
          </FormAlert>
        </Show>
        <div class="flex flex-wrap gap-3">
          <Button type="submit" disabled={pending()}>
            {pending() ? "Sending…" : "Send reset link"}
          </Button>
          <a class="text-sm text-muted underline-offset-4 hover:underline" href={paths.login()}>
            Back to sign in
          </a>
        </div>
      </form>
    </AuthLayout>
  );
}