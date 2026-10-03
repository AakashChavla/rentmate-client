# RentMate web

Phase 0 provides a minimal Next.js 14 App Router page with English/Hindi, Tailwind/shadcn tokens, lazy reduced-motion animations, nonce CSP and injectable application services. Business features and authentication are future phases.

Use Node 20.20.2 and Corepack Yarn 1.22.22. Read [AGENTS.md](AGENTS.md) and [status](docs/ai/10-roadmap-and-status.md).

```powershell
corepack enable
yarn install --frozen-lockfile
yarn dev
```

The client binds 127.0.0.1:3001. NEXT_PUBLIC_API_URL defaults to http://localhost:3000; see .env.example. Switch languages from the page. The preference cookie carries no authentication token.

```text
yarn verify:quick
yarn rules:proof
yarn i18n:types
yarn api:types
yarn gen module
yarn gen integration
yarn gen processor
yarn build
yarn start
```

Always export the server OpenAPI before generating client types. Generated contracts currently contain only the health endpoint. yarn verify executes the same Phase 0 checks as verify:quick.

On Windows, SWC may reject writable cache ancestors. Create a private directory directly under your user profile, grant only your user, SYSTEM and Administrators inherited full control, then set `$env:SWC_NATIVE_BINDING_CACHE = Join-Path $env:USERPROFILE 'RentMate-swc-native-cache'` before build/dev/start. The verified cache already exists on this machine. Do not disable native integrity checks.

Quick verification passed locally. Dependency audits remain failing; Next.js 14 has critical advisories requiring a newer major version, and braces has an unpatched tooling advisory. Release is blocked. Remote CI/security scanners and Docker/Postgres/Redis were not verified. See [the full report](docs/ai/14-phase0-report.md).
