import { configureClientErrors } from "solid-js";
import { installChunkLoadRecovery } from "./lib/app/chunk-load-recovery";

installChunkLoadRecovery();

// Errors an <Errored> boundary renders a fallback for never reach window.onerror.
configureClientErrors({
  onError(error, { ownerPath, boundaryPath }) {
    console.error("[solid] error caught by boundary", error, {
      ownerPath,
      boundaryPath,
    });
  },
});
