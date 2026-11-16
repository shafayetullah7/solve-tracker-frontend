import tailwindcss from "@tailwindcss/vite";
import { fileRoutes } from "filesystem-routing/vite";
import { defineConfig } from "vitest/config";
import solid from "@solidjs/vite-plugin";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";
import { createApiProxy } from "./config/api-proxy.ts";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export default defineConfig(({ command, mode, isPreview }) => ({
  // Turnkey client mode: no index.html and no mount file — the plugin generates
  // the entries around src/App.tsx (wrapped in src/Document.tsx) and `vite build`
  // prerenders the shell into a purely static dist/client.
  plugins: [
    // `extensions` makes @solidjs/vite-plugin also compile the `?pick=` route
    // modules the fileRoutes plugin emits (their ids end in a query string).
    solid({ start: true, extensions: [".jsx", ".tsx"], diagnostics: true }), // add `ssr: true` for streaming SSR
    fileRoutes({ types: true }),
    tailwindcss(),
  ],
  server: {
    port: 3001,
    strictPort: true,
    proxy:
      command === "serve" && !isPreview && mode !== "test"
        ? createApiProxy(loadEnv(mode, process.cwd(), "").API_PROXY_TARGET)
        : undefined,
  },
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./vitest-setup.ts"],
    exclude: ["**/node_modules/**", "e2e/**"],
    // if you have few tests, try commenting this
    // out to improve performance:
    isolate: false,
  },
  build: {
    target: "esnext",
    assetsInlineLimit: 0,
  },
  resolve: {
    alias: {
      "@platforms": path.join(repoRoot, "backend/src/shared"),
    },
  },
}));
