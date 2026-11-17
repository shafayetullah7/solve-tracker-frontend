import { Errored, Loading, type ParentProps } from "solid-js";
import { RouteErrorFallback } from "./RouteErrorFallback";
import { RouteLoadingScreen } from "./RouteLoadingScreen";

export type RouteBoundaryProps = ParentProps & {
  /** Inside [`AppShell`](../app/AppShell.tsx) — do not duplicate `#main-content`. */
  nestedInAppShell?: boolean;
};

/** Solid 2 route shell: `Errored` outside `Loading` (see FRONTEND_CONVENTIONS). */
export function RouteBoundary(props: RouteBoundaryProps) {
  const ownsMainLandmark = () => props.nestedInAppShell !== true;
  return (
    <Errored
      fallback={(err, reset) => (
        <RouteErrorFallback
          err={err}
          reset={reset}
          mainContent={ownsMainLandmark()}
        />
      )}
    >
      <Loading
        fallback={
          <RouteLoadingScreen mainContent={ownsMainLandmark() ? undefined : false} />
        }
      >
        {props.children}
      </Loading>
    </Errored>
  );
}