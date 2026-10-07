# Demo seed maintenance

Task: pre-Phase 6 realistic demo dataset. The authoritative seed and account guide live in the sibling server repository at tools/seeds/demo and docs/demo-accounts.md. It covers all eight roles, all property types, scoped access, units/beds, private KYC and lease states through Phase 5. No client-only fake endpoint or mock business record is introduced.

Every task must update the maintenance record and keep the server seed/account guide aligned with the current feature set. Add demo scenarios when features change, preserve unrelated data and verify modified seeds are repeatable. Never commit credentials or real personal data; demo seeds are restricted to local development/test.

Validation: server lint, strict types, architecture and rules passed; client rule checks passed. Four real PostgreSQL/Redis HTTP tests prove concurrent repeatability, all-role login, property/own-only access, encrypted IDs/private downloads, production rejection and preservation of edited/unrelated records. The local API container was seeded; all eight local demo logins and the tenant private-document download returned 200. No email was sent. Credentials remain ignored in demo-accounts.local.md. The user explicitly authorized pushing the seed/rule commits. Project organization will follow on a separate branch.
