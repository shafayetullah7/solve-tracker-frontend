import { paths } from "../../router";

export function AuthNav() {
  return (
    <div class="flex items-center gap-2 sm:gap-3">
      <a class="ui-button" data-variant="secondary" href={paths.login()}>
        Sign in
      </a>
      <a class="ui-button" data-variant="primary" href={paths.register()}>
        Register
      </a>
    </div>
  );
}