import { createSignal, Show } from "solid-js";
import { AuthLayout } from "../components/auth/AuthLayout";
import { Button } from "../components/ui/Button";
import { authFormMessage, mapAuthFieldErrors } from "../lib/auth/forms";
import { useAuth } from "../lib/auth/context";
import { ApiError } from "../lib/api/errors";
import { paths } from "../router";

export default function ForgotPassword() {
  const auth = useAuth();
  const [email, setEmail] = createSignal("");
  const [pending, setPending] = createSignal(false);
  const [accepted, setAccepted] = createSignal<string | undefined>();
  const [formError, setFormError] = createSignal<string | undefined>();
  const [fieldErrors, setFieldErrors] = createSignal<Record<string, string>>({});

  async function onSubmit(event: Event) {
    event.preventDefault();
    if (pending()) return;
    setPending(true);
    setFormError(undefined);
    setFieldErrors({});
    setAccepted(undefined);
    try {
      const response = await auth.authApi.forgotPassword({ email: email().trim() });
      setAccepted(response.message);
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
      title="Forgot password"
      description="Enter your email. We use the same response whether or not an account exists."
      pageTitle="Forgot password — Practice"
    >
      <form class="space-y-4" onSubmit={onSubmit}>
        <div>
          <label class="mb-2 block text-sm font-medium" for="forgot-email">
            Email
          </label>
          <input
            id="forgot-email"
            class="ui-field"
            type="email"
            autocomplete="email"
            value={email()}
            onInput={(event) => setEmail(event.currentTarget.value)}
            aria-invalid={fieldErrors().email ? "true" : undefined}
          />
        </div>
        <Show when={accepted()}>
          <p class="text-sm text-brand" role="status">
            {accepted()}
          </p>
        </Show>
        <Show when={formError()}>
          <p class="text-sm text-danger" role="alert">
            {formError()}
          </p>
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