# Campaign AI Director — v1.1.0

Baseline: clean04551da795db16765b85ab6414c98b61c267ad85 on ship/living-covenant; prior production dpl_BQpYDUTtvPG15BgcahdQAmS4fGsC. The verifiedv0.5.0 provenance remains unchanged.

## Implementation

POST /api/director uses the existing short HttpOnly session, exact Origin/CSRF checks, approved Luna Responses configuration, shared durable Gateway text quota and atomic$0.01 reservation. Usage settles conservatively; unknown usage retains the reservation. No caps, keys, plans or purchases changed. /api/intelligence remains non-billable. Director has a separate Redis namespace; it cannot consume a Living Covenant signature.

Model output selects balanced/pursuit/crossfire plus bounded prose. It cannot generate enemy code, heal, grant items, sign pacts, change boss behavior or mutate combat. A matching digest/intent receipt is required for explicit Use this formation on an OpenAI proposal. Local fallback remains clearly labeled and validated. Request edits, suggestions, consent withdrawal and closing cancel pending proposals; later results cannot apply. Each reopened Director receives a new proposal identity.

Preview uses the same pure formationPlan as actual spawning. Selecting another preview route does not buy that route. Template persists until changed, affects only Expedition regular waves, and is not offered in boss-only Gauntlet or Classic. Route factors still change counts; maximum36, intervals1.05s/1.20s.

## Local verification

- Node22.23.2:239/239 tests,23813.8061ms;39 syntax files and build passed. Added10 focused tests;108 sector/route/template comparisons are inside one exhaustive test.
- Real Redis:3/3 tests,3304.5939ms; atomic double approval, stale results, and namespace isolation. Test keys are uniquely scoped and removed afterward; no model inference.
- Windows Edge153.0.4234.32, native WebGPU/compute, ordinary clock:1440x900,1280x720,430x932,320x568. Four proposal/edit/apply/wave-spawn checks, no page errors or external requests. Phone sizes are desktop emulation. Both desktop views have800px content and800px scrollHeight in the scaled game coordinate system.
- Existing offline campaign UI:3 sizes,18 sector render fixtures, zero page errors or network requests; software WebGL2/SwiftShader with controlled scenes, not an actual campaign victory.
- Supplied develop-web-game helper: movement/dash training screenshot and state inspected; WebGL2/PBR. Native composed screenshot adapter preserves the existing layered renderer.
- Initial tests exposed two version-label mismatches, then an insecure-document UUID API absence (fixed). An initial runtime assertion expected a turret still alive after mobile auto-fire; final evidence records real spawn callbacks, without changing combat or accelerating time.

## Production

App source `5de9378be8ed7387157510a9915af67417f06abd` is pushed. Final READY deployment `dpl_Ey6W5h1mdVdm1ExsdNbvLi7ibgRW` is aliased to https://nemesis-pact-live.vercel.app/. Hosted433935bytes, SHA256`cd96811f5fd1cd61081b3e66d0860cbe79d847261f837c3f3de783f68403a906`, exactly matches the built HTML. Headers and the legacy non-billable endpoint passed.

Two real Japanese Director requests through Luna completed at2446ms and2165ms. Both selected crossfire, received explicit matching approvals, preserved hull7/time0/credits50/pactnull, and launched the identical preview schedule. Actual spawning was observed at1.2583s and2.4583s (1.20s gap) on Windows Edge/WebGPU, ordinary clock, automatic inputs. No human test is claimed. No page errors; session/director/sign/cancel only, no microphone/API voice traffic.

The first real response revealed12px page overflow. Final CSS spacing and second real API test show scrollHeight=clientHeight=800; the action button is within the1440x900 viewport. Final screenshot inspected. The first production harness failed before any API call because a string predicate required unsafe-eval; changed predicates to functions while keeping CSP unchanged. Historical GPT-Live-1 and covenant evidence remains in V1.0.0-VALIDATION.md; this feature has not rerun voice or captured new human footage. The existing59s/1080p60 iPhone movie predates this Director.

## Budget and rollback

Before this feature: directOpenAI$2.600000/$10 and Gateway$0.036070/$20 at2026-09-15T02:18:20.527Z, active0, sharedkill null. These are conservative application accounting, not invoices. Vercel grant-specific balance/expiry and infrastructure cost remain unverified; no unconditional$30 guarantee.

Rollback this feature with `vercel rollback dpl_BQpYDUTtvPG15BgcahdQAmS4fGsC --yes --scope wildmans-projects`. Preserve Redis, budget totals, secrets and media. Reverting to tagv1.0.0 restores the previous source.


After both calls, ledger2026-09-15T02:36:46.368Z:directOpenAI$2.600000/$10 unchanged;Gateway$0.036538/$20, added$0.000468,active0,killnull. Per-call usage accounting250 and218microdollars.

Submission form read anonymously in native Edge on2026-09-15. Six English paragraphs (description, four criteria, existing code/licenses) are exactly200 whitespace-separated words each. Personal details are kept only in the ignored local kit. Form confirmation/submission is reserved to the representative and was not performed. See SUBMISSION-FORM-GUIDE.md.
