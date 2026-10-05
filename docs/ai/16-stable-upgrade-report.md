# Stable dependency baseline - 2026-10-05

The latest user request supersedes the old Phase 0/1 version pins. Both repositories use local chore/stable-upgrade branches. Architecture, tenant isolation, localization, motion and security gates remain binding. No next-phase business work was started.

## Runtime and tooling

- Node 26.10.0 is the latest non-prerelease Current release verified from [the official index](https://nodejs.org/dist/index.json). It is not LTS; the latest LTS was 24.21.0 at discovery. A portable Windows binary was SHA256-verified; .nvmrc, engines, Docker and CI use the new baseline.
- [PostgreSQL 18.6](https://www.postgresql.org/docs/release/) is the latest stable release; PostgreSQL 19 is beta and excluded. Compose uses a new postgres18-data volume at /var/lib/postgresql, preserving the old PostgreSQL 16 volume. Existing application data has not been migrated between majors.
- [Redis 8.10.2](https://github.com/redis/redis/releases/tag/8.10.2) is non-prerelease. Nginx is pinned to [stable 1.30.5](https://nginx.org/en/download.html).
- Yarn 4.18.1 and Corepack 0.36.0 replace Yarn Classic. Node 26 does not bundle Corepack: install it explicitly. Use yarn install --immutable, the node-modules linker and project-local caches; no native integrity checks are disabled.
- TypeScript 7.0.2 is the registry latest, but latest TypeScript ESLint requires <6.1, Nest Swagger accepts only 5/6, and ts-jest requires <7. Server uses the newest supported 6.0.3. Latest OpenAPI TypeScript additionally requires ^5.9, so client uses the newest compatible 5.9.3. These are explicit compatibility exceptions, not silent latest claims.

## Compatibility work

Nest 12 and TypeORM 1 use ESM. The production CommonJS output runs with Node 26 native ESM interop. Jest 30 uses a current SWC JavaScript transform and ts-jest for TypeScript, avoiding mixed-loader dependency cycles. Explicit Jest/Node types are configured. Windows tests need the existing private SWC_NATIVE_BINDING_CACHE.

The key-value adapter now uses the current official node-redis client, avoiding TypeORM's optional ioredis peer conflict while preserving the abstract port and atomic Lua counter. BullMQ remains behind its publishers/worker port.

Next 16 request headers/cookies are awaited; middleware was migrated to proxy.ts. Type checking first runs next typegen so clean checkouts generate route declarations; next-env.d.ts retains its framework-generated format. React 19 and Tailwind 4 use the automatic JSX runtime, @tailwindcss/postcss, CSS imports and the existing theme config. MSW 3 uses onUnhandledFrame; the credentials test inspects the actual fetch options because normalized mock requests report same-origin. Browser observer fakes implement scrollMargin. Gate proofs use dependency-cruiser 18's renamed executable.

## Verification

Both yarn verify commands passed: server 18 unit + 6 HTTP e2e + 3 real PostgreSQL 18/Redis 8 integration tests; client 13 tests and the Next 16 production build. Server compilation, OpenAPI export and generated client API types passed. The compiled Node 26 API returns 200 at /health/ready with both stores ready. Migration proof enabled pgcrypto and recorded one migration in the isolated fixture database.

Client gate proof: 31 temporary violations rejected. Both production Docker images built successfully. The server runs as UID 1000 and returns healthy readiness against the isolated PostgreSQL 18/Redis 8 fixture. Server gate proof: 42 temporary violations rejected; client gate proof: 31 rejected. Both fixture suites restore and remove their temporary files. The client production container runs as UID 1000 and serves both locales with correct HTML language and nonce CSP. Windows mapped-file write failures in proof restoration were resolved by atomic fixture writes; CLAUDE.md and catalogs were restored. The initial migration command was automatically rejected because its connection target was unspecified; the successful rerun explicitly targeted the isolated fixture at loopback port 25432.

Yarn audits now report one high braces advisory in each repository; server additionally reports a moderate deprecated glob 10 dependency. There are no critical findings in these audits, including no remaining Next 14 critical advisory. Counts are unique Yarn report entries, not the previous Yarn Classic dependency-path counts. Audits remain failing and release remains blocked. No advisory was suppressed. Remote CI, Gitleaks and CodeQL and browser visual/contrast QA remain unverified.

Logs and release metadata are in workspace .rentmate-tools/upgrade-*. Node 26, PostgreSQL 18.6 and Redis 8.10.2 were actually executed, not just relabeled. The separate rentmate-stable-check project uses fixture ports 25432/26379 and preserves existing volumes. Nothing was pushed, amended or rewritten.

## Exact dependency pins

| Package                   | Installed stable version | Registry latest at discovery |
| ------------------------- | ------------------------ | ---------------------------- |
| @eslint/compat            | 2.1.1                    | 2.1.1                        |
| @eslint/js                | 10.0.1                   | 10.0.1                       |
| @hookform/resolvers       | 5.9.1                    | 5.9.1                        |
| @radix-ui/react-slot      | 1.3.3                    | 1.3.3                        |
| @tailwindcss/postcss      | 4.3.3                    | 4.3.3                        |
| @tanstack/react-query     | 5.104.1                  | 5.104.1                      |
| @testing-library/dom      | 10.4.2                   | 10.4.2                       |
| @testing-library/jest-dom | 7.0.1                    | 7.0.1                        |
| @testing-library/react    | 16.3.3                   | 16.3.3                       |
| @types/jest-axe           | 3.5.9                    | 3.5.9                        |
| @types/node               | 26.6.4                   | 26.6.4                       |
| @types/react              | 19.3.0                   | 19.3.0                       |
| @types/react-dom          | 19.3.0                   | 19.3.0                       |
| class-variance-authority  | 0.7.1                    | 0.7.1                        |
| clsx                      | 2.1.1                    | 2.1.1                        |
| dependency-cruiser        | 18.5.0                   | 18.5.0                       |
| eslint                    | 10.12.0                  | 10.12.0                      |
| eslint-plugin-i18next     | 6.1.5                    | 6.1.5                        |
| husky                     | 9.1.7                    | 9.1.7                        |
| input-otp                 | 1.5.0                    | 1.5.0                        |
| jest-axe                  | 11.0.0                   | 11.0.0                       |
| jsdom                     | 30.1.2                   | 30.1.2                       |
| lint-staged               | 17.6.0                   | 17.6.0                       |
| lucide-react              | 1.52.0                   | 1.52.0                       |
| motion                    | 14.0.0                   | 14.0.0                       |
| msw                       | 3.0.2                    | 3.0.2                        |
| next                      | 16.3.8                   | 16.3.8                       |
| next-intl                 | 4.14.9                   | 4.14.9                       |
| next-themes               | 0.4.6                    | 0.4.6                        |
| openapi-typescript        | 7.13.0                   | 7.13.0                       |
| plop                      | 4.0.5                    | 4.0.5                        |
| postcss                   | 8.5.28                   | 8.5.28                       |
| prettier                  | 3.9.9                    | 3.9.9                        |
| radix-ui                  | 1.6.7                    | 1.6.7                        |
| react                     | 19.3.0                   | 19.3.0                       |
| react-dom                 | 19.3.0                   | 19.3.0                       |
| react-hook-form           | 7.89.0                   | 7.89.0                       |
| sonner                    | 2.0.8                    | 2.0.8                        |
| tailwind-merge            | 3.7.0                    | 3.7.0                        |
| tailwindcss               | 4.3.3                    | 4.3.3                        |
| tsx                       | 4.23.15                  | 4.23.15                      |
| typescript                | 5.9.3                    | 7.0.2                        |
| typescript-eslint         | 8.71.0                   | 8.71.0                       |
| vite                      | 8.3.2                    | 8.3.2                        |
| vitest                    | 5.0.3                    | 5.0.3                        |
| zod                       | 4.6.5                    | 4.6.5                        |
