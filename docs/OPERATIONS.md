# NEMESIS PACT operations

Production: https://nemesis-pact-live.vercel.app. Scope: only project `prj_fB5yGJiIy6kdLg29FpHreHmCwMkc` in `wildmans-projects`. Do not change or stop other projects. The team remains Hobby. Node version is now explicitly 22.x in both the project settings and package engines; the current production deployment was built after that settings change.

## Current budget controls

| Provider | Total | Verification | Public | Judging | Route |
|---|---:|---:|---:|---:|---|
| Direct OpenAI | $10 | $3 | $5 | $2 | GPT-Live-1 voice; bounded recorded-audio verification analyses |
| Vercel AI Gateway | $20 | $1 | $14 | $5 | GPT-5.6 Luna text only |

These are separately approved application caps. Production now selects the **public** pool for both providers: `OPENAI_BUDGET_POOL=public` and `GATEWAY_BUDGET_POOL=public`. Both project-scoped selector updates and redeployment were confirmed; one live Gateway request settled exclusively against its public pool. Existing verification totals remain intact. No new direct-voice public session was created for this pool check. Before judging, an operator can select `judging`; the public pool cannot consume the reserved judging allocation. Never increase a cap or buy additional credit as an automatic fallback.

The Gateway $20 cap suppresses new model use earlier than the requested $25 suppression threshold. The user-reported $30 grant's exact balance, expiry and key-specific billing remain unverified. The provided Codex Gateway setup page does not establish those details. Vercel infrastructure usage is separate: CLI 59.16 `usage --group-by project --format json` returned `Costs not found (404)` on 2026-09-14. Unknown is not zero. No paid plan, payment method, domain purchase, automatic top-up or paid database was added. Upstash is Free.

Shared Redis reservations use integer microdollars before upstream work. Voice reserves $0.05 per 45-second session; confirmed hangup retains that full amount because it does not establish final invoice usage. Text reserves a maximum before inference and settles trusted server-side token usage. Unknown usage is never refunded to zero. The ledger is conservative accounting, not an invoice guarantee.

Admission limits are 100 new sessions globally/hour and 20/IP/hour, 12 model calls per app session, 20 calls/IP/minute, 3 shared concurrent calls, 45 seconds per voice connection and 90 reserved voice seconds per fight (app session + runId). A new First Contact gets a new fight allowance while retaining the same authentication and its 12-call ceiling. Valid app cookies are reused; retries and reconnects do not erase ledger history. Session cookies expire after 900 seconds. No raw IP address is stored in the quota identity.

## Stop and recovery

The shared `nemesis:admission:kill` record closes new paid admission for this project across providers. It does not assert that an existing provider session has ended. Server watchdogs hang up voice after 45 seconds and retain unknown active locks; a kill does not refund money. Stop routes remain authenticated and available for cleanup. Never expose an admin/kill token to the browser.

For a routine offline deployment, set `AI_MODE=mock`, `OPENAI_KILL_SWITCH=true`, `GATEWAY_KILL_SWITCH=true`, and `OPENAI_VOICE_ENABLED=false` server-side, then deploy. The static LOCAL RULES game remains playable. Environment changes alone do not alter an already built deployment; preserve the durable kill state across rollbacks.

Before clearing an unknown-termination kill, independently confirm every affected provider session was terminated. Use the server-side official hangup operation with the original ownership record. Do not clear locks or refund ledger entries from client reports. Do not issue a blind `DEL` of kill, totals or active reservations.

## Rollback

Current production source: `896f0fe`, READY deployment `dpl_Hia1kgaAmhWXDe6L13pLRU8QxTjk`. This release changes only the local recorder: manual stop, elapsed time and1080p60 capture request. Voice remains GPT-Live-1, contracts GPT-5.6 Luna; model output format `living_covenant_rules_v3` is unchanged.

To restore the previous verified build, including its forced60-second recorder:

```sh
vercel rollback dpl_xk61akZJbnzGP83dt11iUbnb8MpT --yes
vercel rollback status nemesis-pact-live
```

Rollback source `c7f1f6d972c9f64047e3626c9f37f82d8f4ba47d` retains the voice amendment fixes, Luna, public pools and taller captions. Verify the alias and ledger after rollback. Do not wipe Redis money, session or signature records. Browser recording duration has no authority to extend the45-second paid voice connection or90 reserved voice seconds per fight.

Secrets remain only in Git-ignored local environment files and sensitive server environment variables. Current exact-value scan found no configured secret in tracked files; that limited check is not a comprehensive security audit. Do not print keys, Redis tokens, cookies, full transcripts or raw provider payloads in operational logs.

Luna uses standard/default tier, reasoning none, a 700-token output cap and 12-second timeout. Catalog rates and conservative cache-write handling are documented in MODEL-LUNA.md. The $0.01 reservation is unchanged; missing usage retains that amount. Historical gpt-4.1-mini media and validation remain labeled with their actual model.


Recorded-audio verification on2026-09-15 used one $0.05 atomic reservation in the approved $3 verification / $10 total direct OpenAI budget. The public direct-text cap remains0. A local-only $0.05 analysis allocation admitted one gpt-4o-transcribe-diarize call after the standard text cap rejected it; it is now fully retained/exhausted. No production environment, aggregate/pool cap or paid plan changed. Latest shared totals: OpenAI $2.000000, Gateway $0.030114, active0/killnull at2026-09-14T16:59:49.531Z; not invoices.
