import { configureServerErrors } from "@solidjs/web";
import { logSsrRequestFailure } from "./lib/server/ssr-request-log";

configureServerErrors({
  onError(error, context) {
    if (context.handling !== "failed") return;
    if (context.kind !== "request" && context.kind !== "render") return;
    logSsrRequestFailure(error, context.event);
  },
});