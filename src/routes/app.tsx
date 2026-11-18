import type { ParentProps } from "solid-js";
import { AppShell } from "../components/app/AppShell";
import { RequireSession } from "../components/auth/RequireSession";
import { RouteBoundary } from "../components/ui/RouteBoundary";
import { PlatformCatalogProvider } from "../lib/platforms/platform-catalog-context";

export default function AppWorkspaceLayout(props: ParentProps) {
  return (
    <RequireSession>
      <PlatformCatalogProvider>
        <AppShell>
          <RouteBoundary nestedInAppShell>{props.children}</RouteBoundary>
        </AppShell>
      </PlatformCatalogProvider>
    </RequireSession>
  );
}