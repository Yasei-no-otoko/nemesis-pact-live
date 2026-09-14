# NEMESIS PACT operations

Production: https://nemesis-pact-live.vercel.app. Scope: only project `prj_fB5yGJiIy6kdLg29FpHreHmCwMkc` in `wildmans-projects`. Do not change or stop other projects. The team remains Hobby. Node version is now explicitly 22.x in both the project settings and package engines; the current production deployment was built after that settings change.

## Current budget controls

| Provider | Total | Verification | Public | Judging | Route |
|---|---:|---:|---:|---:|---|
| Direct OpenAI | $10 | $3 | $5 | $2 | GPT-Live-1 voice only |
| Vercel AI Gateway | $20 | $1 | $14 | $5 | gpt-4.1-mini text only |

These are separately approved application caps. Actual configuration currently selects the **verification** pool for both providers while the human demo is being verified. After verification, set `OPENAI_BUDGET_POOL=public` and `GATEWAY_BUDGET_POOL=public` in this project's production environment, then deploy. Before judging, an operator can select `judging`; the public pool cannot consume the reserved judging allocation. Never increase a cap or buy additional credit as an automatic fallback.

The Gateway $20 cap suppresses new model use earlier than the requested $25 suppression threshold. The user-reported $30 grant's exact balance, expiry and key-specific billing remain unverified. The provided Codex Gateway setup page does not establish those details. Vercel infrastructure usage is separate: CLI 59.16 `usage --group-by project --format json` returned `Costs not found (404)` on 2026-09-14. Unknown is not zero. No paid plan, payment method, domain purchase, automatic top-up or paid database was added. Upstash is Free.

Shared Redis reservations use integer microdollars before upstream work. Voice reserves $0.05 per 45-second session; confirmed hangup retains that full amount because it does not establish final invoice usage. Text reserves a maximum before inference and settles trusted server-side token usage. Unknown usage is never refunded to zero. The ledger is conservative accounting, not an invoice guarantee.

Admission limits are 100 new sessions globally/hour and 20/IP/hour, 12 model calls per app session, 20 calls/IP/minute, 3 shared concurrent calls, 45 seconds per voice connection and 90 cumulative voice seconds per app session. Valid app cookies are reused; retries and reconnects do not erase ledger history. Session cookies expire after 900 seconds. No raw IP address is stored in the quota identity.

## Stop and recovery

The shared `nemesis:admission:kill` record closes new paid admission for this project across providers. It does not assert that an existing provider session has ended. Server watchdogs hang up voice after 45 seconds and retain unknown active locks; a kill does not refund money. Stop routes remain authenticated and available for cleanup. Never expose an admin/kill token to the browser.

For a routine offline deployment, set `AI_MODE=mock`, `OPENAI_KILL_SWITCH=true`, `GATEWAY_KILL_SWITCH=true`, and `OPENAI_VOICE_ENABLED=false` server-side, then deploy. The static LOCAL RULES game remains playable. Environment changes alone do not alter an already built deployment; preserve the durable kill state across rollbacks.

Before clearing an unknown-termination kill, independently confirm every affected provider session was terminated. Use the server-side official hangup operation with the original ownership record. Do not clear locks or refund ledger entries from client reports. Do not issue a blind `DEL` of kill, totals or active reservations.

## Rollback

Current production source: `3ff6fb06fd212cc50614a4b6dd67e52d5325bce6`, READY deployment `dpl_9VterKz8JkDeyjVGpdJrVqcm3e48`.

The prior READY deployment is `dpl_6oUWRqM5JCHUL9Eq7TS4czuBuc6p` (source `05e2d24`, before the voice response-body deadline fix). With the existing authenticated Vercel CLI and this project selected:

```sh
vercel rollback dpl_6oUWRqM5JCHUL9Eq7TS4czuBuc6p --yes
vercel rollback status nemesis-pact-live
```

Then verify the production alias, API gate and ledger. Rollback restores that deployment's code/environment, not prior Redis contents; do not wipe durable money or signature records. For UI-only diagnosis use the offline HTML or LOCAL RULES. Never promote a pre-quota build to restore paid service.

Secrets remain only in Git-ignored local environment files and sensitive server environment variables. Current exact-value scan found no configured secret in tracked files; that limited check is not a comprehensive security audit. Do not print keys, Redis tokens, cookies, full transcripts or raw provider payloads in operational logs.
