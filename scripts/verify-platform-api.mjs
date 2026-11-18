#!/usr/bin/env node
/**
 * PLATFORM-API A6: backend catalog ↔ GET /platforms OpenAPI contract ↔ frontend CATALOG_SLUGS.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(here, "..");
const backendRoot = path.resolve(frontendRoot, "../solve-tracker-backend");
const backendCatalog = path.resolve(
  backendRoot,
  "src/shared/platform-catalog.ts",
);
const openApiPath = path.resolve(backendRoot, "openapi.json");
const backendDts = path.resolve(
  frontendRoot,
  "src/lib/api/generated/backend.d.ts",
);
const frontendSlugs = path.resolve(
  frontendRoot,
  "src/lib/platforms/platform-slugs.ts",
);
const canonical = path.resolve(
  frontendRoot,
  "src/lib/platforms/catalog-canonical.ts",
);

function sortedUnique(values) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function symmetricDiff(a, b) {
  const setB = new Set(b);
  const setA = new Set(a);
  return [
    ...a.filter((s) => !setB.has(s)),
    ...b.filter((s) => !setA.has(s)),
  ];
}

function setsEqual(a, b, labelA, labelB) {
  if (a.length !== b.length) {
    return `${labelA} has ${a.length} slugs, ${labelB} has ${b.length} (diff: ${symmetricDiff(a, b).join(", ")})`;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return `slug mismatch at ${i}: ${labelA}=${a[i]} ${labelB}=${b[i]}`;
    }
  }
  return undefined;
}

function parseOpenApiSlugEnum(openapi) {
  const slugSchema =
    openapi?.paths?.["/platforms"]?.get?.responses?.["200"]?.content?.[
      "application/json"
    ]?.schema?.properties?.items?.items?.properties?.slug;
  if (!slugSchema?.enum?.length) {
    throw new Error("Could not parse slug enum from openapi.json GET /platforms");
  }
  return sortedUnique(slugSchema.enum.map(String));
}

function parseGeneratedSlugEnum(dtsText) {
  const anchor = dtsText.indexOf("PlatformsController_list:");
  if (anchor < 0) throw new Error("PlatformsController_list not found in backend.d.ts");
  const slice = dtsText.slice(anchor, anchor + 2500);
  const slugMatch = slice.match(/slug:\s*([^;\n]+);/);
  if (!slugMatch) throw new Error("Could not parse platform slug enum from backend.d.ts");
  const slugs = [...slugMatch[1].matchAll(/"([a-z0-9_]+)"/g)].map((m) => m[1]);
  if (slugs.length < 1) throw new Error("No slugs parsed from generated types");
  return sortedUnique(slugs);
}

function catalogAsListItems(catalog) {
  return catalog.map((entry) => ({
    slug: entry.slug,
    name: entry.name,
    baseUrl: entry.baseUrl,
    urlHosts: [...entry.urlHosts],
  }));
}

const openapiMtime = fs.statSync(openApiPath).mtimeMs;
const catalogMtime = fs.statSync(backendCatalog).mtimeMs;
if (openapiMtime < catalogMtime) {
  console.warn(
    "warn: openapi.json is older than platform-catalog.ts — run `pnpm --dir ../solve-tracker-backend api:export` and commit the snapshot",
  );
}

const openapi = JSON.parse(fs.readFileSync(openApiPath, "utf8"));
const openapiSlugs = parseOpenApiSlugEnum(openapi);
const dtsSlugs = parseGeneratedSlugEnum(fs.readFileSync(backendDts, "utf8"));

const { assertCatalogsMatch } = await import(pathToFileURL(canonical));
const { PLATFORM_CATALOG: backend } = await import(pathToFileURL(backendCatalog));
const backendSlugs = sortedUnique(backend.map((entry) => entry.slug));

const { CATALOG_SLUGS } = await import(pathToFileURL(frontendSlugs));
const frontendSlugList = sortedUnique([...CATALOG_SLUGS]);

const problems = [
  setsEqual(backendSlugs, openapiSlugs, "backend catalog", "openapi.json enum"),
  setsEqual(
    backendSlugs,
    dtsSlugs,
    "backend catalog",
    "generated backend.d.ts",
  ),
  setsEqual(frontendSlugList, backendSlugs, "frontend CATALOG_SLUGS", "backend catalog"),
].filter(Boolean);

try {
  const listItems = catalogAsListItems(backend);
  assertCatalogsMatch(backend, listItems, {
    left: "PLATFORM_CATALOG",
    right: "GET /platforms list shape",
  });
} catch (error) {
  problems.push(`list shape: ${error instanceof Error ? error.message : error}`);
}

if (problems.length > 0) {
  console.error("fail platform API contract check:\n");
  for (const line of problems) console.error(" -", line);
  console.error(
    "\nFix: edit solve-tracker-backend/src/shared/platform-catalog.ts → pnpm --dir ../solve-tracker-backend api:export → pnpm api:generate → sync CATALOG_SLUGS in platform-slugs.ts → pnpm verify:platform-api",
  );
  process.exit(1);
}

console.log(
  `ok platform API contract (${backendSlugs.length} slugs: catalog ↔ openapi.json ↔ backend.d.ts ↔ CATALOG_SLUGS; list shape matches PlatformsService)`,
);