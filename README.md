# RentMate web

The bilingual client implements authentication, registration, permission-gated navigation, onboarding, property management, organization settings and scoped team invitations.

Use Node 26.10.0 and Corepack Yarn 4.18.1. Read [AGENTS.md](AGENTS.md), [status](docs/ai/10-roadmap-and-status.md) and [Phase 3 report](docs/ai/18-phase3-report.md).

```powershell
npm install --global corepack@0.36.0
corepack enable
yarn install --immutable
yarn api:types
yarn dev
yarn verify
yarn rules:proof
```

Export server OpenAPI before generating types. NEXT_PUBLIC_API_URL defaults to http://localhost:3000 and is embedded at build time. The client binds loopback port 3001. Set the server CORS_ORIGIN to the client origin. Tenant routes use /tenant/* to avoid colliding with admin route-group paths.

Dockerfile builds Next standalone output, copies static/public assets and runs as node. docker compose up -d --build starts the client; CLIENT_EXPOSED_PORT changes its loopback host port. The workspace parent Compose file includes both repositories. Supply DB_PASSWORD locally for the database and align public API URL/CORS with any overridden ports.

Language selection persists only the non-sensitive NEXT_LOCALE preference. Themes persist rm_theme. Motion is lazy-loaded and reducedMotion=user; controls, labels, placeholders and errors use en/hi catalogs. Authenticated server grants govern access. Refresh uses the real session endpoint. The property switcher stores a non-authoritative preference that the server always validates.

On Windows set SWC_NATIVE_BINDING_CACHE to the protected RentMate-swc-native-cache directory under your user profile before build/dev/start. Do not disable native integrity checks. A packaged deployment runs .next/standalone/server.js with public and .next/static copied alongside it; yarn start is a local smoke command.

Vitest/RTL/MSW/jest-axe cover localization, shells, HTTP behavior, accessibility and reduced-motion policy. Hindi and browser visual/contrast review remain required before production. Audits currently block release on the upstream braces advisory in tooling dependencies; do not waive the audit gate.

Current dependency policy and compiler exceptions: [stable upgrade report](docs/ai/16-stable-upgrade-report.md). Refresh non-prerelease registry versions and rerun verification before each new phase. Keep older PostgreSQL volumes intact; a major upgrade needs a separate data migration.
