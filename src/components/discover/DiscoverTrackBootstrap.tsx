import { createEffect, onSettled } from "solid-js";
import { useAuth } from "../../lib/auth/context";
import { isDiscoverFullEnabled } from "../../lib/discover/flag";
import { bindDiscoverTrackFlush, initDiscoverTrack } from "../../lib/discover/track";

export function DiscoverTrackBootstrap() {
  const auth = useAuth();

  createEffect(
    () => [auth.status(), isDiscoverFullEnabled()] as const,
    ([status, enabled]) => {
      if (status === "authenticated" && enabled) {
        initDiscoverTrack(auth.productClient);
      }
    },
  );

  onSettled(() => bindDiscoverTrackFlush());

  return null;
}