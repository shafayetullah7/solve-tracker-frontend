import { useNavigate } from "@solidjs/router";
import { onSettled } from "solid-js";
import { RequireSession } from "../components/auth/RequireSession";
import { paths } from "../router";

export default function AccountRedirect() {
  const navigate = useNavigate();

  onSettled(() => {
    navigate(paths.app.profile(), { replace: true });
  });

  return (
    <RequireSession>
      <main class="mx-auto max-w-2xl px-5 py-12 sm:px-8">
        <p class="text-muted" role="status">
          Redirecting to profile…
        </p>
      </main>
    </RequireSession>
  );
}