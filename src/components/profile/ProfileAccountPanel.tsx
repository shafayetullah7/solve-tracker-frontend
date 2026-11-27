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
  onDeleteAccount?: () => void;
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
      <Show when={props.onDeleteAccount}>
        <div class="mt-6 border-t border-line pt-5">
          <h3 class="text-label font-medium text-ink">Danger zone</h3>
          <p class="mt-2 text-sm text-muted">
            Permanently delete your account and all associated data. Exports do not include
            attempts or progress — download guides first if you need a copy.
          </p>
          <Button
            class="mt-4"
            variant="danger"
            onClick={() => props.onDeleteAccount?.()}
          >
            Delete account
          </Button>
        </div>
      </Show>
    </ProfileSectionShell>
  );
}