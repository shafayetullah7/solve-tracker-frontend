#!/usr/bin/env node
/**
 * DATA-1 (Option B): frontend vs backend PLATFORM_CATALOG drift check (verify-only).
 */
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(here, "..");
const backendCatalog = path.resolve(
  frontendRoot,
  "../solve-tracker-backend/src/shared/platform-catalog.ts",
);
const frontendCatalog = path.resolve(
  frontendRoot,
  "src/lib/platforms/platform-catalog.ts",
);
const canonical = path.resolve(
  frontendRoot,
  "src/lib/platforms/catalog-canonical.ts",
);

const { assertCatalogsMatch } = await import(pathToFileURL(canonical));
const { PLATFORM_CATALOG: backend } = await import(
  pathToFileURL(backendCatalog)
);
const { PLATFORM_CATALOG: frontend } = await import(
  pathToFileURL(frontendCatalog)
);

try {
  assertCatalogsMatch(frontend, backend, {
    left: "frontend",
    right: "backend",
  });
  console.log(
    `ok platform catalog drift check (${frontend.length} entries, frontend ↔ backend)`,
  );
} catch (error) {
  console.error("fail platform catalog drift:", error);
  console.error(
    "Update both solve-tracker-frontend/src/lib/platforms/platform-catalog.ts and solve-tracker-backend/src/shared/platform-catalog.ts, then rerun pnpm verify:catalog.",
  );
  process.exit(1);
}