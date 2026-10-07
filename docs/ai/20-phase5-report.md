# Phase 5 — tenant onboarding and lease workflows

Implemented on phase/5-tenants-leases from Phase 4. The server OpenAPI contract was exported first and generated client DTOs drive the injected TenantsApi/LeasesApi adapters. No push.

## User flows

The admin tenant list uses the property switcher as a filter, cursor pagination, search/status filters and permission-hidden creation. Onboarding progresses through details, document upload and review. Uploads validate size/type before sending, display accessible progress, retain failures for retry, support drag/drop and revoke browser preview URLs. The XHR upload adapter carries locale/request ID and credentials, bounds requests and coordinates one refresh retry. Staff can verify/reject documents and tenants with reasons and invite the tenant through the existing invitation flow. Server authorization remains authoritative.

Lease creation reuses the Phase 4 unit grid and bed choices, validates real date ranges and decimal money strings, and checks availability before submission. Conflicts use the localized LEASE_OVERLAP error. Detail/history display dates, money and all six statuses with text/icons and the current timeline step. Staff actions record deposit references, renew to a successor and confirm termination through the shared accessible dialog. Tenant My lease is read-only; Profile permits the limited server-supported profile fields and own document uploads. Sensitive ID values are password inputs and responses show masked IDs only.

Pages remain thin. Feature UI imports public feature contracts, while root provider composition imports API adapters directly to avoid cycles through component barrels. The shared rental query builder lives in the API library. Components use bounded hooks/views, existing design/motion tokens and reduced-motion context. English/Hindi catalogs are typed and have matching placeholders/usage. Hindi is assistant-authored and needs human review.

## Verification

Full yarn verify passed: lint, strict TypeScript, dependency architecture, rules/localization gates, 66 tests in 21 files and the production build. Custom gate proofs rejected all configured temporary violations and removed their fixtures. New UI tests cover upload MIME/size errors and retry/progress, exact lease date/money validation, wizard conflict mapping, accessible timeline statuses and permission-hidden staff/portal actions. Existing property/unit/auth tests remain part of the full suite. The final OpenAPI export/type generation and TypeScript check passed. Local client http://127.0.0.1:3001 runs alongside API http://127.0.0.1:3000; public login, API readiness and docs returned 200.

The latest direct dependency check retained the exact stable pins documented in [stable upgrade report](16-stable-upgrade-report.md); the TypeScript compatibility exception remains. No client dependency was added. External S3 delivery, a production scanner, remote security CI and browser visual review are not claimed as verified. Prior tooling audit blockers remain release blockers.

## Phase 6 prerequisites

Define invoice periods, proration, GST/tax, credits, payment allocation and deposit accounting before implementing billing UI. A recorded deposit currently activates a lease; it is not a payment ledger. Keep monetary API values as decimal strings. Reuse PROPERTY permission checks and tenant ownership for invoices/payments, not switcher cookies. Add only generated endpoints after the next server contract export. Decide timezone-specific billing dates and durable financial event delivery.
