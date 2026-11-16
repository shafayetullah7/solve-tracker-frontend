import type { ParentProps } from "solid-js";
import { AppShell } from "../components/app/AppShell";
import { RequireSession } from "../components/auth/RequireSession";

export default function AppWorkspaceLayout(props: ParentProps) {
  return (
    <RequireSession>
      <AppShell>{props.children}</AppShell>
    </RequireSession>
  );
}