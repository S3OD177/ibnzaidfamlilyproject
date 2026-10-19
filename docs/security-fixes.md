# Privacy and session security fixes

## Behavior changes

- File downloads resolve member photo owners and enforce their current photo privacy and public-profile visibility. Owners and staff retain access; unrelated members cannot access an administration-only photo. If a file is shared by multiple profiles, all owners' restrictions apply.
- Session cookies are bound to an HMAC of the credential used at login. Database sessions are checked against the current password hash on every authenticated operation. Password recovery, account password changes, and administrator password resets therefore invalidate existing sessions without a database migration. Environment-admin password changes also invalidate its sessions.
- JSON backups include only the `site` and `about` settings. The authentication secret and future internal settings are excluded; password hashes and password-reset records remain excluded.
- File responses use `private, no-store`, including partial media responses and access denials. Next.js image optimization is disabled so its independent cache and unauthenticated image fetches cannot bypass these rules.

## Deployment notes

The cookie format changes, so existing users must sign in again after deployment. No schema migration is needed. Disabling image optimization and file caching increases bandwidth in exchange for checking permissions on each request.

Previously downloaded files and responses already cached under the old one-year policy cannot be recalled by new response headers. Purge managed caches on rollout where applicable; previously public images must be treated as already disclosed. Existing backups may contain the old signing secret; handle them as sensitive. These changes do not rotate deployed secrets or modify production data.

## Verification

`npm test` runs regression tests against real route and session/action implementations with mocked database and cookie boundaries. It covers anonymous/member/owner/staff photo access, privacy transitions, partial responses, password recovery and credential changes, legacy/tampered cookies, backup filtering, and optimizer configuration. These are not live Postgres or deployed-browser tests.

Additional checks: `npx tsc --noEmit --incremental false`, `npm run lint`, `npm run build`, and `node scripts/kinship-test.mjs`.
