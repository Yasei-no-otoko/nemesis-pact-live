# Flight debrief — September 15, 2026

The campaign result screen now opens a dedicated flight review instead of the old prototype panel. It shows the actual finished run's counters, equipment and pact record alongside a concise five-part review. Both English and Japanese UI and generated review text are supported. Victory and defeat are valid outcomes; First Contact keeps its existing specialized result screen.

Choose **Flight debrief → GPT-5.6 Luna → consent → Analyze** (日本語: **フライトの振り返り → GPT-5.6 Lunaで振り返る**). The server sends only bounded aggregate counters, outcome, difficulty, demo status and canonical equipment/pact IDs to the model. Voice, transcripts, screenshots, seed, account details and the application's run ID are not model inputs. Autopilot runs are explicitly described as demonstrations rather than human skill. Counters cannot establish precise movement or the cause of a result; the UI explains this limitation.

The initial record always uses clearly labeled **LOCAL RULES**. Local results remain available on rejection, timeout, quota exhaustion or upstream failure. Analysis cannot change hull, score, equipment, signed contracts or difficulty. A completed OpenAI review is cached per world/language for the current page session; reopening it does not create a new billable request. Reloading the page does not preserve an unfinished run or this cache.

## Service and cost controls

- Actual requested contract/review model: `gpt-5.6-luna`, via the existing Vercel AI Gateway Responses endpoint. This feature does not open GPT-Live-1 or the microphone.
- Existing signed app sessions, Origin/CSRF validation, shared Redis admission, atomic budget reservations, session/IP/concurrency limits and kill switch also protect the debrief.
- Each review reserves $0.01 from the Gateway text budget. Valid usage settles the reservation; missing usage retains the conservative reservation. No approved budget was raised.
- Redis sequence/digest ownership prevents duplicate in-flight inference and returns cached completed responses. Client cancellation, leaving the screen, changing language/provider or revoking consent invalidates old output. Cancellation stops the browser request; it does not guarantee that already accepted upstream work is canceled or free. Server processing has a 12-second upstream deadline and accounts for incurred/unknown usage.
- `/api/debrief` rewrites to the protected operation in the existing `api/intelligence.mjs` entry point. The original legacy operation stays offline. This keeps the framework-free deployment at 12 functions on the existing Hobby plan; [Vercel's runtime documentation](https://vercel.com/docs/functions/runtimes) describes this limit. No plan change was required.

## Validation before deployment

Started from clean `92a7a109c4f9649a6866c1d4b2276c9f975d1604`, branch `ship/living-covenant`. The final local UI matrix covers 1440×900 English, 1280×720 Japanese, and 430×932 / 320×568 Japanese touch emulation. It checks explicit consent, display, immutable world/score, caching, back/Escape, budget-error fallback and cancellation. No horizontal overflow or page errors. These model responses are fixtures, explicitly recorded as `realModelCalls: false` in [local results](validation-debrief/local/result.json).

The fixture uses aggregate counters from the archived actual v1.3.0 automated six-sector campaign (6 bosses, 242 eliminations, 74 reflected bullets, 2 hull points lost, 6/6 pacts). Replaying its finished state into the new result UI is **not a newly played campaign**. Native Windows Edge uses software WebGL2/PBR; phone sizes are emulated, not new physical iPhone trials. The supplied develop-web-game browser helper also ran through the training screen with the existing native Edge adapter.

[Three real Redis checks](validation-debrief/redis.json) verify concurrent ownership, cached state and abort/retry on an isolated key; no paid inference is involved. Unit tests cover schema bounds, finished-world extraction, auth/kill/quota, duplicate requests, stale results, model metadata, timeout and deployment route admission. Production model verification follows below after deployment.

## Budget and rollback

[Before ledger](validation-debrief/budget-before.json): direct OpenAI $3.000000 / $10; Gateway $0.046504 / $20, active reservations 0. These are conservative application ledgers, not provider invoices. The original reported $30 grant's exact balance/expiry and Vercel infrastructure charges remain unverified. The fresh Vercel environment pull redacted sensitive caps; documented caps come from the prior approved runtime snapshot. Two planned production reviews reserve at most $0.02 without changing caps.

Rollback to READY `dpl_HinZheFR4AC4ezwYS47Y884pEJm8` (Japanese UI app `e91c7e3fb78a2393efe5d51d1b365c108047e127`) via Vercel rollback, or revert the debrief application commit and redeploy. Preserve Redis keys, credentials, budgets, user settings and existing submission media. The existing release film remains the immutable v1.3.0 campaign demonstration.
