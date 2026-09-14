# Durable access and budget control

`server/access.mjs` issues a random, short lived HMAC signed `nemesis_app_session` cookie. It is `HttpOnly`, `SameSite=Strict`, and `Secure` in production. Mutating requests must supply the exact configured `Origin` and the session derived CSRF value in `X-Nemesis-CSRF`. No legacy `PILOT_ACCESS_TOKEN` is read.

`server/quota.mjs` requires an injected durable store in every runtime. Production uses the HTTPS Redis REST adapter selected by `server/context.mjs`; there is no production in-memory fallback. Its Lua scripts reserve integer microdollars, enforce global, pool, kind, concurrency, session and IP limits atomically, and provide idempotent settlement/release. Unknown upstream outcomes must settle at the full reservation; callers must never refund an uncertain timeout. The positive quota settings remain mandatory, including `OPENAI_BUDGET_CAP_MICRODOLLARS`, kind and pool caps, concurrency, and rate windows.

## Production namespaces and kill control

Direct OpenAI uses the `nemesis:quota:` money and reservation namespace. The Vercel AI Gateway route uses `nemesis:gateway:` for its separate money and reservation ledger. Both routes share the admission namespace `nemesis:admission:`. The durable kill record checked by the reservation and session Lua scripts is therefore `nemesis:admission:kill`; `nemesis:quota:kill` is an obsolete name and is not the production kill key. The quota adapter's `kill` operation writes this shared record. It closes new paid admission across providers but does not claim that an existing provider session has ended or refund its reservation.

The legacy `/api/intelligence` bridge remains local-rules only, including when `AI_MODE=live` or API keys are present. It does not read `PILOT_ACCESS_TOKEN`, call OpenAI, or provide a direct upstream bypass. Root handlers map budget, concurrency, kill, and store failures to bounded errors while keeping LOCAL RULES available.

## Separate application caps and accounting

The production budgets are separate application caps, denominated in integer microdollars:

| Route | Total cap | Verification | Public | Judging | Use |
|---|---:|---:|---:|---:|---|
| Direct OpenAI | $10 | $3 | $5 | $2 | GPT-Live-1 voice |
| Vercel AI Gateway | $20 | $1 | $14 | $5 | GPT-5.6 Luna text |

These are independent ledgers and caps; the $10 and $20 values are not provider invoices and do not add up to an invoice or grant balance. The latest conservative ledger (`docs/validation-current/budget-ledger.json`, checked 2026-09-14T16:11:13.833Z) records $1.850000 direct OpenAI and $0.028541 Gateway, with zero active admissions and no kill flag. These are conservative reservation totals, not provider invoice amounts.

The approved public pool is active for the current production selectors. `docs/RELEASE-CANDIDATE.json` records both environment updates, Gateway public-pool verification, and a new direct-voice public session test. `docs/validation-current/public-pool.json` independently records one settled production Gateway call after activation: `479` microdollars charged to `pool:public`, with zero verification or judging delta. The later live ledger records the additional public totals above. The reported Vercel $30 grant's exact balance, expiry, and key-specific billing remain unverified; Vercel infrastructure usage also returned `Costs not found (404)`, so neither is treated as available invoice credit or a reason to raise a cap.

## Durable-store evidence

The Redis path is operationally verified. `docs/validation-current/proposals-redis.json` records two passing tests against the approved KV REST Redis service, including late-finish rejection, stale-intent invalidation, digest mismatch rejection, and one-shot concurrent duplicate signing. `docs/validation-current/voice-replay/redis.json` records passing isolated-key tests against actual Upstash Redis for voice reservations, shared locks, retained session history, release accounting, and the session call cap. These tests record no secrets and do not modify production counters.
