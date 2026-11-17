import { Show } from "solid-js";
import { paths } from "../../router";
import { Button } from "../ui/Button";
import { ProfileSectionShell } from "./ProfileSectionShell";

export type ProfileAccountPanelProps = {
  logoutPending: boolean;
  revocationUnconfirmed: boolean;
  onLogout: () => void;
  onRetryLogout: () => void;
  onChangePassword?: () => void;
};

export function ProfileAccountPanel(props: ProfileAccountPanelProps) {
  return (
    <ProfileSectionShell
      title="Session"
      description="Sign out of Practice or update your password on this device."
      titleId="profile-account-heading"
    >
      <div class="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
        <Button
          variant="secondary"
          disabled={props.logoutPending}
          onClick={() => props.onLogout()}
        >
          {props.logoutPending ? "Signing out…" : "Sign out"}
        </Button>
        <Show when={props.onChangePassword}>
          <Button variant="secondary" onClick={() => props.onChangePassword?.()}>
            Change password
          </Button>
        </Show>
      </div>
      <p class="mt-4 text-sm text-muted">
        Don’t know your current password?{" "}
        <a
          class="text-ink underline-offset-4 hover:underline"
          href={paths["forgot-password"]()}
        >
          Reset via email
        </a>
      </p>
      <Show when={props.revocationUnconfirmed}>
        <p class="mt-4 text-sm text-warning" role="status">
          Sign-out may not have completed on the server.
        </p>
        <Button class="mt-2" variant="secondary" onClick={() => props.onRetryLogout()}>
          Retry sign-out
        </Button>
      </Show>
    </ProfileSectionShell>
  );
}