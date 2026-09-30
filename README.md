# RentMate client

Web frontend for RentMate, a multi-tenant workspace for hotels, PGs/hostels, apartments, and rental flats. This repository is the Next.js app only. The API lives in `rentmate-server` (NestJS) at `http://localhost:3000/api/v1`.

## Setup

Requirements: Node.js 22, Yarn 1.

```bash
cp .env.example .env.local
yarn install
yarn dev
```

The dev server runs at [http://localhost:3001](http://localhost:3001). Start `rentmate-server` first if you want the dashboard API status to show ready.

## Scripts

| Script           | Purpose                                                               |
| ---------------- | --------------------------------------------------------------------- |
| `yarn dev`       | Next.js dev server on port 3001                                       |
| `yarn build`     | Production build (standalone output)                                  |
| `yarn start`     | Start the production server on port 3001                              |
| `yarn lint`      | ESLint                                                                |
| `yarn typecheck` | `tsc --noEmit`                                                        |
| `yarn test`      | Vitest                                                                |
| `yarn format`    | Prettier write                                                        |
| `yarn api:types` | Regenerate `src/lib/api/schema.d.ts` from the server OpenAPI document |

`yarn api:types` runs:

```bash
openapi-typescript ${API_OPENAPI_URL:-http://localhost:3000/api/docs-json} -o src/lib/api/schema.d.ts
```

The Node wrapper in `scripts/generate-api-types.mjs` uses that same URL default so the command works on Windows as well as macOS and Linux.

## Folder structure

```text
src/
  app/
    (auth)/                 sign-in, OTP, forgot password
    (admin)/admin/          operator portal (/admin/...)
    (tenant)/tenant/        resident portal (/tenant/...)
    layout.tsx, error.tsx, loading.tsx, not-found.tsx
  components/
    ui/                     shadcn/ui
    forms/                  React Hook Form field components
    layout/                 admin and tenant shells
    providers/              theme, query, auth
    shared/                 page header, table, badges, gates
  hooks/                    React Query and auth hooks
  lib/api/                  fetch client, query defaults, OpenAPI types
  env.ts                    Zod validation of environment variables
  middleware.ts             session-cookie gate for both portals
```

Route groups do not change the URL. Admin and tenant both need a dashboard, complaints, and visitors, so the URLs are prefixed:

- Admin: `/admin/dashboard`, `/admin/properties`, `/admin/tenants`, `/admin/billing/invoices`, `/admin/billing/payments`, `/admin/complaints`, `/admin/visitors`, `/admin/reports`, `/admin/settings/organization`, `/admin/settings/users`, `/admin/settings/roles`
- Tenant: `/tenant/dashboard`, `/tenant/my-lease`, `/tenant/payments`, `/tenant/complaints`, `/tenant/visitors`, `/tenant/profile`
- Auth: `/login`, `/verify-otp`, `/forgot-password`

Phase 1 pages are placeholders. The login screen validates email and password and does not call the API yet.

## Environment variables

Copy `.env.example` to `.env.local`. `src/env.ts` validates these at build and server startup.

| Variable                 | Example                               | Used for                                                     |
| ------------------------ | ------------------------------------- | ------------------------------------------------------------ |
| `NEXT_PUBLIC_API_URL`    | `http://localhost:3000/api/v1`        | REST base URL                                                |
| `NEXT_PUBLIC_API_ORIGIN` | `http://localhost:3000`               | Origin for routes outside `/api/v1`, such as `/health/ready` |
| `API_OPENAPI_URL`        | `http://localhost:3000/api/docs-json` | `yarn api:types` only                                        |
| `NEXT_PUBLIC_APP_NAME`   | `RentMate`                            | Document title and shell branding                            |

`NEXT_PUBLIC_*` values are inlined into the browser bundle at build time. Set them before `yarn build` or as Docker build args.

## Working with the server repo

1. Start `rentmate-server` so it listens on port 3000.
2. Point this app at it with the env values above.
3. Confirm the admin dashboard. `useHealth` calls `GET {NEXT_PUBLIC_API_ORIGIN}/health/ready`, which sits outside `/api/v1`. If the server is down, the card shows an unreachable state instead of crashing.
4. When the server API changes, regenerate types and commit the result:

   ```bash
   yarn api:types
   ```

   `src/lib/api/schema.d.ts` is committed. The copy in this repo is a placeholder until the first successful generation.

### Cookies and domains

The API sets the session cookie (`rm_session` in this client; keep the name aligned with the server). This app never writes tokens to `localStorage` or `sessionStorage`. Requests use `credentials: 'include'`.

- Production: the site and the API must share a parent domain, for example `app.rentmate.com` and `api.rentmate.com`, so a SameSite cookie is sent to both.
- Local development: `localhost:3000` and `localhost:3001` are the same site, so the cookie is visible to middleware and to `fetch`.

`src/middleware.ts` only checks that the cookie exists. Role-based redirects (admin vs tenant) are still a TODO.

## Docker

`Dockerfile` has a `dev` stage and a `production` stage. Production uses Next.js standalone output. `docker-compose.yml` runs the dev stage on port 3001.

```bash
docker compose up --build
```

The browser should call an API URL it can reach. The defaults use `http://localhost:3000`, which is correct when the server is published on the host and the user is browsing from that machine.

`host.docker.internal` is for traffic that starts inside the client container (server-side fetch, or `yarn api:types` run in the container) when `rentmate-server` is on the host or in another compose project. Compose sets `API_OPENAPI_URL` to `http://host.docker.internal:3000/api/docs-json` for that case. Do not point `NEXT_PUBLIC_API_URL` at `host.docker.internal` unless the browser can resolve that host.

To build the production image:

```bash
docker build --target production \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1 \
  --build-arg NEXT_PUBLIC_API_ORIGIN=http://localhost:3000 \
  --build-arg NEXT_PUBLIC_APP_NAME=RentMate \
  -t rentmate-client .
```

## Quality

ESLint, Prettier (with `prettier-plugin-tailwindcss`), strict TypeScript, Husky, and lint-staged are configured. CI (`.github/workflows/ci.yml`) installs, lints, typechecks, tests, and builds.
