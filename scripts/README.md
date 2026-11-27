# Frontend scripts

`package.json` keeps **dev tooling** (`dev`, `build`, `check`, `test`, `lint`, `api:check`). SSR, deploy, and contract verifiers are run directly:

```bash
# from solve-tracker-frontend/
node scripts/verify-deploy.mjs          # production SSR smoke (server must be running)
node scripts/verify-ssr-2.mjs           # auth SSR / cache checks
node scripts/verify-phase-4.7.mjs       # auth gate: static + API races (backend :3000, dev :3001)
node scripts/verify-platform-api.mjs    # catalog ↔ openapi ↔ CATALOG_SLUGS
node scripts/verify-repo-paths.mjs      # route path conventions
```

Full catalog drift check before release:

```bash
pnpm --dir ../solve-tracker-backend api:check && pnpm api:check && node scripts/verify-platform-api.mjs
```

Do not add new `verify:*` entries to `package.json`; add or extend scripts here and document them in this file.