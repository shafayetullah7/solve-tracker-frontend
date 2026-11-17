import type { ParentProps } from "solid-js";
import { AppShell } from "../components/app/AppShell";
import { RequireSession } from "../components/auth/RequireSession";
import { RouteBoundary } from "../components/ui/RouteBoundary";

export default function AppWorkspaceLayout(props: ParentProps) {
  return (
    <RequireSession>
      <AppShell>
        <RouteBoundary nestedInAppShell>{props.children}</RouteBoundary>
      </AppShell>
    </RequireSession>
  );
}