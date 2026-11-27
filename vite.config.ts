import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { fileRoutes } from "filesystem-routing/vite";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";
import solid from "@solidjs/vite-plugin";
import { validatePublicOrigin } from "./src/lib/site/validate-public-origin.ts";

const here = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode, command }) => {
  const loaded = loadEnv(mode, here, "");
  for (const [key, value] of Object.entries(loaded)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }

  if (command === "build" && !validatePublicOrigin(process.env.VITE_PUBLIC_SITE_URL)) {
    throw new Error("Set VITE_PUBLIC_SITE_URL to the public HTTPS origin (or local HTTP origin for smoke builds).");
  }

  return {
  // Start mode: streaming SSR + static client assets; production Node entry at
  // dist/server/node.js (`pnpm start`). API proxy: config/start-middleware.ts.
  plugins: [
    // `extensions` makes @solidjs/vite-plugin also compile the `?pick=` route
    // modules the fileRoutes plugin emits (their ids end in a query string).
    solid({
      start: {
        middleware: "./config/start-middleware.ts",
        serverSetup: "./src/server-setup.ts",
        clientSetup: "./src/client-setup.ts",
        nodeServer: true,
      },
      ssr: true,
      extensions: [".jsx", ".tsx"],
      diagnostics: true,
    }),
    fileRoutes({ types: true }),
    tailwindcss(),
  ],
  server: {
    port: 3001,
    strictPort: true,
    hmr: {
      overlay: false,
    },
  },
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./vitest-setup.ts"],
    exclude: ["**/node_modules/**", "e2e/**"],
  },
  build: {
    target: "esnext",
    assetsInlineLimit: 0,
  },
  };
});