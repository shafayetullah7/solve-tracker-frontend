import { createSignal, Show } from "solid-js";
import { AuthLayout } from "../components/auth/AuthLayout";
import { Button } from "../components/ui/Button";
import { FormAlert } from "../components/ui/FormAlert";
import { FormField, formFieldControlAttrs } from "../components/ui/FormField";
import { createFormState } from "../lib/forms/create-form-state";
import { focusFirstInvalid } from "../lib/forms/focus-first-invalid";
import { validateForgot } from "../lib/forms/validate-auth";
import { useAuth } from "../lib/auth/context";
import { paths } from "../router";

export default function ForgotPassword() {
  const auth = useAuth();
  const form = createFormState("auth");
  const [email, setEmail] = createSignal("");
  const [accepted, setAccepted] = createSignal<string | undefined>();

  async function onSubmit(event: Event) {
    event.preventDefault();
    if (form.pending()) return;
    const formEl = event.currentTarget as HTMLFormElement;
    const clientErrors = validateForgot({ email: email() });
    if (Object.keys(clientErrors).length > 0) {
      form.applyClientErrors(clientErrors);
      setAccepted(undefined);
      focusFirstInvalid(formEl);
      return;
    }
    form.beginSubmit();
    form.setPending(true);
    setAccepted(undefined);
    try {
      const response = await auth.authApi.forgotPassword({ email: email().trim() });
      setAccepted(response.message);
    } catch (error) {
      form.applyApiError(error);
      focusFirstInvalid(formEl);
    } finally {
      form.setPending(false);
    }
  }

  return (
    <AuthLayout
      title="Forgot password"
      description="Enter your email. We use the same response whether or not an account exists."
      pageTitle="Forgot password — Practice"
    >
      <form class="space-y-4" novalidate onSubmit={onSubmit}>
        <FormField id="forgot-email" label="Email" error={form.fieldErrors().email}>
          <input
            class="ui-field"
            type="email"
            autocomplete="email"
            {...formFieldControlAttrs({
              id: "forgot-email",
              error: form.fieldErrors().email,
            })}
            value={email()}
            onInput={(event) => {
              setEmail(event.currentTarget.value);
              form.clearField("email");
            }}
          />
        </FormField>
        <Show when={accepted()}>
          <FormAlert variant="success">{accepted()}</FormAlert>
        </Show>
        <Show when={form.formBanner()}>
          <FormAlert variant="error" retryAfter={form.retryAfter()}>
            {form.formBanner()}
          </FormAlert>
        </Show>
        <div class="flex flex-wrap gap-3">
          <Button type="submit" disabled={form.pending()}>
            {form.pending() ? "Sending…" : "Send reset link"}
          </Button>
          <a class="text-sm text-muted underline-offset-4 hover:underline" href={paths.login()}>
            Back to sign in
          </a>
        </div>
      </form>
    </AuthLayout>
  );
}