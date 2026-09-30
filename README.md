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

- Admin: `/admin/dashboard`, `/admin/properties`, `/admin/tenants`, `/admin/billing/invoices`, `/admin/billing/payments`, `/admin/complaints`, `/admin/visitors`, `/admin/reports`, `/admin/settings/organization`, `/admin/settings/users`, `/admin/settings/roles`, `/admin/profile`
- Tenant: `/tenant/dashboard`, `/tenant/my-lease`, `/tenant/payments`, `/tenant/complaints`, `/tenant/visitors`, `/tenant/profile`
- Auth: `/login`, `/login/otp`, `/verify-otp`, `/forgot-password`

## Authentication

Sign-in is cookie based. The browser never reads `rm_access` or `rm_refresh`, and this app does not write tokens to `localStorage`, `sessionStorage`, or a JavaScript-readable cookie.

1. `POST /auth/login` (or OTP verify / password flows) sets httpOnly cookies on the API origin: `rm_access`, `rm_refresh` (path limited to refresh), and `rm_session=1`.
2. Every API call uses `credentials: 'include'`.
3. `GET /auth/me` loads the signed-in user into TanStack Query (`['me']`).
4. A 401 on a normal request triggers one shared `POST /auth/refresh`, then a single retry. Login, refresh, OTP, and password routes do not refresh.
5. If refresh fails, the query cache is cleared, one "Session expired" toast is shown, and the browser goes to `/login?next=<path>`.
6. `POST /auth/logout` clears the cookies and this app's query cache.

`src/middleware.ts` treats `rm_session` as "maybe logged in" only. Missing cookie on `/admin` or `/tenant` redirects to `/login?next=`. A cookie on `/login` or `/verify-otp` sends the browser to `/admin/dashboard`; the client `AuthGuard` then sends TENANT-only users to `/tenant/dashboard`. The API is the authority for permissions.

In production the server `COOKIE_DOMAIN` must be a shared parent (for example `.rentmate.com`) so middleware on the app host can see `rm_session`. On localhost, ports 3000 and 3001 are the same site.

### Demo accounts

From the server seed (`SEED_DEMO_PASSWORD`, default `DemoUser12345`):

| Email | Role | Lands on |
| --- | --- | --- |
| `demo@rentmate.local` | Organization owner | `/admin/dashboard` |
| `tenant@rentmate.local` | Tenant | `/tenant/dashboard` |

Other seeded users share the same password: `property-manager@`, `accountant@`, `receptionist@`, `maintenance@`, and `security@rentmate.local`.

OTP and password-reset codes are printed in the server log when `AUTH_DEV_LOG_OTP=true`.

### Regenerate API types

With `rentmate-server` running (`yarn migration:run && yarn seed && yarn start:dev`):

```bash
yarn api:types
```

That reads `http://localhost:3000/api/docs-json` (or `API_OPENAPI_URL`) and rewrites `src/lib/api/schema.d.ts`. Commit that file when the contract changes.

A few generated schemas do not match the live JSON: user list `data` is an array, role and permission list DTOs are empty records, and user roles on `GET /users` omit assignment ids. The client narrows those at runtime. Removing a role needs an assignment id, which `POST /users/:id/roles` returns; roles that arrived only from the list cannot be removed until the server includes the id.

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

1. In `rentmate-server`, run `yarn migration:run && yarn seed && yarn start:dev` so the API listens on port 3000.
2. Point this app at it with the env values above and run `yarn dev` (port 3001).
3. Sign in as `demo@rentmate.local` / `DemoUser12345` and open `/admin/settings/users`. Sign in as `tenant@rentmate.local` with the same password and confirm the resident home.
4. Confirm the admin dashboard health card. `useHealth` calls `GET {NEXT_PUBLIC_API_ORIGIN}/health/ready`, which sits outside `/api/v1`.
5. When the server API changes, run `yarn api:types` and commit `src/lib/api/schema.d.ts`.

### Cookies and domains

The API sets `rm_access`, `rm_refresh`, and `rm_session`. This client only looks for `rm_session` in middleware and never reads the token cookies. Requests use `credentials: 'include'`.

- Production: set `COOKIE_DOMAIN` to a shared parent such as `.rentmate.com` so `app.rentmate.com` and `api.rentmate.com` both receive the cookies.
- Local development: `localhost:3000` and `localhost:3001` are the same site, so the cookie is visible to middleware and to `fetch`.

`src/middleware.ts` only checks that `rm_session` exists. Role routing happens in the client layouts after `GET /auth/me`.

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
