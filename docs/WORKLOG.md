# Work log

## 2026-09-14 — source and service audit

- No ancestor AGENTS.md/CLAUDE.md or initial Git repository found. User-supplied AGENTS instructions apply.
- Initialized branch `ship/living-covenant`, preserved input under tag `baseline-v0.5.0-verified-source` (resolve tag for exact baseline commit).
- ZIP `C:/Users/wildman/Downloads/NEMESIS-PACT-3D-EN-v0.5.0-source.zip`: SHA256 `57055F84BC841940BCFC37D580C046656D1A5AE859466CDFBF61901690883DA2`. All 216 archived files are byte-identical to workspace. User GOAL.md is additional; preserved.
- GitHub authenticated as Yasei-no-otoko, candidate repo ADMIN. Current main `c252e3611412734db7ce2e12187c1e677e143ab9` has target v0.4.1, not the older 0.3.6.1 note in GOAL.md. Read-only comparison checkout in ignored `.work/upstream`.
- Vercel connected team `wildmans-projects` / `team_RTugcUd6bYZFpvi4A18M9SGY`, Hobby; only unrelated sake-ec exists. No project changed.
- No OPENAI_API_KEY in process/user/machine environment or usable workspace env file. Asked for secure key creation and explicit separate budget; pending.
- Vercel credits: user reports $30; type, balance, expiry, billing scope, current usage unknown. OpenAI credits/actual spend unknown; observed paid calls during this task: zero.
- System Node 25.2.1 and bundled Node 24.19.0; baseline QA will obtain/use Node 22, not silently treat other versions as matching production.
- Parallel tasks: official voice specification (read only), baseline QA. Primary agent owns provenance, deployment and common server control.

## Remaining gates

All GOAL.md completion boxes remain open at this audit. Next: baseline results; source comparison; durable quota implementation; authenticated deployment; real text contract / combat proof. Voice protocol, project access, microphone test and demo remain required.

## 2026-09-14 16:15 JST — bounded pipeline and first real inference

- Origin private repository: `Yasei-no-otoko/nemesis-pact-live`, branch `ship/living-covenant`; ADMIN/write access, SSH fetch/push verified. Upstream candidate preserved as `upstream`; `docs/UPSTREAM-COMPARISON.json` records the source differences.
- Current baseline: 164/164 unit tests on Node 22.23.2, 17 syntax checks, build 323999 bytes. See `validation-current/baseline/README.md`; baseline and current evidence are distinct.
- Created only `nemesis-pact-live` on Vercel. Project `prj_fB5yGJiIy6kdLg29FpHreHmCwMkc`, Hobby team. Existing sake-ec unchanged. No deployment yet at this entry. CLI authenticated; GitHub app auto-link lacked access but direct CLI deployment is available.
- User approved free Upstash integration terms. Created `nemesis-pact-quota`, Free, 500000 monthly commands, iad1, eviction OFF. Connected only this project. Durable Lua tests ran against actual Upstash; no OpenAI call in those tests.
- User entered their Vercel key through a one-shot loopback password form. Stored only in ignored local configuration. `/v1/credits` returned 200, balance=0,total_used=0. This team balance does not establish the reported key budget; expiry and exact grant accounting still unverified. No paid plan or credit purchase.
- REAL Gateway Responses inference: 200/completed, model `openai/gpt-4.1-mini`, 590 input +107 output tokens, 2892ms, valid right/slow/reinforcements contract. $0.01 atomically reserved; $0.000408 accounted from published prices (not settled invoice). See `validation-current/gateway/probe.json`. Not yet Vercel combat evidence.
- Secure OpenAI key creation approved, target names explicitly selected by user (Codex / Personal / Default Project) and resolved via connected Platform. Local confirmation tool initially returned not_approved; user subsequently explicitly approved `.env.local`. Key created via encrypted connector/local helper; raw key never printed. `/v1/models/gpt-live-1` returned 200. This is model access evidence, not Live integration completion.
- User separately approved OpenAI total $10: verification $3, public $5, judging $2, existing credits only. Earlier verified Personal billing balance $4149.86, auto reload OFF. Voice cost remains zero before actual sessions. Vercel Gateway target remains <=$20 with $25 suppression threshold and $5 reserve from user-reported $30.
- Implemented signed short-lived HttpOnly/Strict/Secure app sessions, Origin+CSRF, durable quota reservations/transitions, shared concurrency/IP/session admission, unknown-voice kill switch, server proposal intent/sign ledger, explicit Sign-only application, and GPT-Live WebRTC/client-delegation transport with 45-second server hangup watchdog. No provider duration parameter is invented. Vercel watchdog and actual voice teardown remain to verify in production; crashes/unknown provider usage are not a hard billing guarantee.
- Current unit suite passed 182 tests on Node 22.23.2 after updating legacy pilot expectations. Browser and final live checks are still in progress. New code is not claimed release-complete.

Remaining: production deploy/text Sign/combat, GPT-Live speech/delegation/interruptions/reconnect, watchdog actual behavior, full regression & mobile evidence, exact gateway key budget/expiry, actual 60-second demo & submission URLs, final cost reconciliation and rollback instructions.

## 2026-09-14 16:42 JST — production text vertical slice verified

- Production alias: https://nemesis-pact-live.vercel.app (HTTP 200 without login). Latest deployed source at this entry: `d726cae` / `milestone-02-production-text-pact`, deployment `dpl_Ek2emcHjqbXiFj7e2J3Ad4Qo8H3D`.
- Real production text flow completed using `openai/gpt-4.1-mini` through the supplied Vercel AI Gateway key: first left sanctuary + slow bullets + reinforcements -> Sign -> real combat; second right sanctuary + slow bullets + reinforcements -> Sign amendment. HP, boss HP and elapsed time preserved. Evidence: `validation-current/production-text/result.json`, five screenshots. Automated Edge 153.0.4234.32 on Windows, 1280x800, software WebGL2; normal keyboard/pointer and real clock, no model mocks or world mutation. Three bullets erased by the actual sanctuary at the combat screenshot. This is not human play or hardware FPS evidence.
- Production-only defects found and fixed: native fetch required Window binding; model prose exceeded text bounds, so the structured schema now includes maxLength; displayed rule arithmetic now comes from the deterministic validator rather than free-form model rationale.
- Actual GPT-Live WebRTC sessions returned session.started, input/output transcript events, client delegations, commentary acknowledgments and session.closed. Production hangup returned stopped=true and browser tracks ended/PeerConnection closed. Input so far is explicitly synthetic Windows TTS. Human microphone, reliable interruption/correction, mid-fight voice and submission demo remain UNVERIFIED.
- Three voice diagnostic sessions have each retained the conservative $0.05 reservation ($0.15 at this point, not invoice). All observed stop operations succeeded. A separate single-session server-watchdog test is being run with a maximum additional $0.05 reservation.
- Correction diagnostics exposed two distinct issues: late transcript fragments invalidated in-flight results; and initial correction words were absent from one synthetic transcript. A bounded queue now revises an existing client delegation (officially supported repeated results) after updated input, even if the model does not create a new delegation. Initial stale proposals remain unsigned and invalidated. Further real input verification is required.
- Voice/consent moved above contract entry. Mobile sticky actions no longer cover price content; 320/390/1280 viewport screenshots reviewed. Actual phone/Safari still unavailable/unverified.
- Demo capture helper is under implementation; it is not yet bundled or tested with an actual recording. No video URL exists yet. Keep all completion gates for human voice and deliverables open.

## 2026-09-14 17:00 JST — human voice feedback and recording fix

- User confirmed first real voice negotiation changed the contract and reported boss defeat. Follow-up clarified only the first voice negotiation was tried. Human interruption/correction and mid-fight voice amendment are still open gates. Chrome showed Japanese microphone transcription, Notary speech, accepted left/slow/reinforcement signature, 14 reflections and 3 bullets erased. Current readback was paused parley; no win export captured.
- First human demo did not save. `DemoRecorder` invoked native Window timers with the recorder object as receiver, producing `Illegal invocation`. Bound all native timers to their owner; real Edge MediaRecorder ran 60 seconds, saved 3019118-byte synthetic-capture WebM, decoded with audio, and reported zero browser errors. Synthetic recorder test is not submission footage.
- Session timeout now covers a stalled JSON body and ignores late completion. Runtime voice receipts now distinguish actual session-started/delegation/proposal/voice signature events from text-only inference. Removed stale `not-integrated` report and pilot setup instructions.
- Current unit suite: 193 passed / 0 failed; 33 syntax files; Node 22.23.2; build 359179 bytes. Preparing deployment from the next commit. Last deployed source before this update: `bbdb9063369f87566554fd36d7e8855ea38ba120`, deployment `dpl_6aSgTYqLumExothLnSQ4SrrF4wbZ`.
- Shared budget at 07:52:33 UTC: direct OpenAI $0.300000 / $10, Gateway $0.006210 / $20 conservative accounting; active 0, no kill. Still verification pools. User's supplied Gateway documentation establishes setup only; exact key grant balance/expiry remains unknown.

## 2026-09-14 17:05 JST — shared-network admission adjustment

- Recorder/evidence fix is deployed from `a7fee49`, READY `dpl_G3jkPr35YkXNGseeWV3JRBmktJUs`. Fresh production session returned actual HTTP 429 / SESSION_QUOTA. Durable read showed 10 session issues on this shared test/user IP, TTL 1378 seconds. The completed human session had expired; existing valid cookies are already reused.
- Raised per-IP session issuance from 10/hour to 20/hour to accommodate testing and shared-network play. Global 100/hour, money caps, 3 active calls, per-minute limits, per-session call/voice limits and kill gates remain. No production counters were erased or refunded. Actual isolated Upstash Lua test: 24 parallel requests, exactly 20 admitted, 4 denied; global 100 cap also enforced; zero model calls.

## 2026-09-14 17:13 JST — submission candidate and pending human evidence

- Current production is `3ce691a1e2b168e82556ef4c37edd1c3aec835d6`, READY `dpl_3RWHtoCVi8K7D8d2c9X7fU8X1LFu`. Anonymous HTTPS returns 200; hosted SHA256 `254f970c13ecb49b01d676bee2b24d57a5cc3e7df8a3cd095f1ca42a5f89126c` exactly matches local generated HTML, 359229 bytes. CSP is a meta policy, not an HTTP CSP header.
- Fresh human retry Chrome tab opened and consented under existing authorization. After admission adjustment it displays OpenAI text ready and Start voice enabled. Requested actual left-to-right interruption, Sign, 8-second combat, R, fresh voice amendment and 60-second recording. No response/recording file yet at this entry; do not substitute recorder fixture for human footage.
- Added six English submission fields, 57–83 words each, and current source/license inventory. Historical baseline documentation preserved with an explicit historical banner. Private source repository publication approval requested after exact-secret scan: 304 tracked files, 9 configured secret values checked, zero findings. This is a limited check, not a complete security audit.
- Vercel team still Hobby. CLI usage lookup returned Costs not found (404); infra consumption remains unknown. Project Node setting was 24.x while package engines already specify 22.x; changed only this project setting to 22.x and verified. Takes effect on next deployment. No paid upgrade or additional purchase.
- Required pending: real human interruption/right correction, mid-fight voice amendment, human video file and English subtitles/public URL; source-publication choice. Physical phone/Safari/GPU FPS and exact grant metadata remain unverified. Public/judging pool activation instructions are in OPERATIONS.md; current deployment still uses verification.


## 2026-09-14 17:30:39 JST — current regression and hardware evidence

- Fixed expired app authorization at new voice start; stop/sign/cancel keep the original owner. LOCAL RULES now follows the last named direction and recognizes Japanese “結界はなし”. These source changes are awaiting the next deployment at this entry.
- Node 22.23.2: 197/197 unit tests, 33 syntax files, offline build 359615 bytes. Current covenant simulation completed all 12 scenarios. Server smoke passed nine checks after correcting an obsolete assertion about the intentionally local legacy route; initial failure is retained. Historical baseline reports were preserved byte for byte.
- Actual isolated Upstash handler integration passed: eight simultaneous Sign requests produced exactly one canonical revision and seven conflicts; wrong digest/owner, cancellation and late completion were rejected. No production keys modified and zero real model calls. Voice admission matrices rejected invalid authorization and failed closed on budget/store errors before any upstream call.
- Actual RX 6900 XT hardware in automated headless Edge 153.0.4234.32: WebGL2 59.99fps, WebGPU 60.11fps at 1280x800, emulated 390x844 portrait WebGPU 59.93fps, each measured for ten seconds. Startup 2016–2235ms, no browser errors or API requests. These are frame-cadence samples, not physical-phone, sustained-performance or human-play measurements. Three screenshots show the arena, boss, ship, bullets and sanctuary.
- Shared budget at 08:28:36 UTC unchanged: direct OpenAI $0.300000 / $10, Gateway $0.006210 / $20 conservative accounting; active 0, kill null. Verification pools still selected. Human retry tab remains idle; no demo WebM found in Downloads. Human correction/parley and video/publication gates remain open.


## 2026-09-14 17:35:15 JST — deployment verified

- Source `05e2d2405559bd595da89cd068dd4b0589694be1` pushed to origin `ship/living-covenant`; production READY `dpl_6oUWRqM5JCHUL9Eq7TS4czuBuc6p`, https://nemesis-pact-live-d769y9yxg-wildmans-projects.vercel.app. Production alias https://nemesis-pact-live.vercel.app returned HTTP 200 without login. Hosted 359665 bytes SHA256 `7c770d38afc467dd5659738e17d7ea33335f3e3d35d7d5f1cd849d420c9c58f6` exactly matches the source build. Hosted meta CSP permits same-origin connections/media; standalone meta CSP forbids them. Microphone is self-only. A valid legacy request returned explicit LOCAL RULES with no model call.
- Post-deploy automated Edge test passed the Japanese local correction and no-sanctuary amendment through normal input/Sign/R controls. Unsigned proposal left the fight unchanged; signed revision 2 preserved hull and combat time and incremented exactly one amendment. Zero API requests/page errors. Evidence in validation-current/production-local. This is fallback regression, not live-voice proof.
- Refreshed the idle human retry tab to this release and prepared First Contact under existing consent approval. No microphone/recording was started by automation. Still awaiting actual interruption/correction, mid-fight voice amendment and saved human footage; private repository publication approval also pending. No public video URL yet.


## 2026-09-14 17:41:58 JST — voice response-body timeout fixed

- Completion review found the voice-start deadline ended when HTTP headers arrived, before JSON body receipt. A stalled body could leave startup and its acquired audio stream active. Kept the 15-second deadline through body parsing with Promise.race, and hang up a session that arrives after the request was superseded/timed out. This does not assume browser cancellation stopped provider work; the server watchdog remains authoritative.
- Node 22.23.2: 198 tests passed, zero failed/skipped, 20566ms including a real 15-second stalled-body test. Syntax 33 files; offline build 360066 bytes.
- Actual native Edge audio MediaStream and RTCPeerConnection in a loopback browser fixture: after 15042ms track was ended, peer closed, request abort signalled, and late session was sent to the stop route. LOCAL RULES fallback signed and entered combat; zero page errors. The audio source was silent synthetic media and all API responses were fixtures, not human microphone or real-model proof.
- No new human interaction or saved WebM/MP4 was found at turn start. Required interruption/correction, mid-fight voice, final subtitled video and source access choice remain pending; these are not made complete by the new failure regression.


## 2026-09-14T08:45:00.237Z — voice deadline release verified

- Source `3ff6fb06fd212cc50614a4b6dd67e52d5325bce6` is READY production `dpl_9VterKz8JkDeyjVGpdJrVqcm3e48`, https://nemesis-pact-live-c8hgz1tgz-wildmans-projects.vercel.app. Anonymous HTTPS returned 200; hosted 360116 bytes SHA256 `4a6dfd2775bcdedd9e3d591b78d5940e2bbbc11a7250b575c9d870583f19f85c` exactly matches the build. Header/meta/offline policies and local-only legacy response remain verified.
- Ledger at 2026-09-14T08:43:01.312Z: direct OpenAI $0.300000/$10, Gateway $0.006210/$20; active 0, no kill. No real-model calls were added by this turn. Invoice/infra/grant metadata limitations remain.
- Added requirement-by-requirement COMPLETION-AUDIT.md. Required human Live correction/amendment, actual 60-second subtitled footage/viewing URL and source-access choice remain incomplete. Prior turn was progress (deployment); this turn is progress (stalled-body fix and native cleanup evidence), not proof that the human gates were met.
- Corrected this agent's three recent narrative timestamps to the corresponding observed artifact/command times; no source, Git dates or historical baseline evidence was altered.


2026-09-14T08:47:15.452Z — BLOCKED handoff, not complete. Latest saved candidate before this handoff is 9290440; production source 3ff6fb0 / dpl_9VterKz8JkDeyjVGpdJrVqcm3e48. Fresh browser/Downloads/GitHub check found no human retry or video and source remains private. The same human microphone/video/access blocker persisted across at least three consecutive goal turns while independent fixes were completed. No new model calls or deployment in this audit. Ready to resume from the preserved recording tab after actual human evidence and access choice arrive. See validation-current/handoff-audit.json.


## 2026-09-14T13:13:12.707053+00:00 — user-reported voice replay failure

- Production voice starts at 12:52 succeeded and stopped. Subsequent starts returned HTTP 429. The durable app-session counter had 90 reserved voice seconds after two connections (initial revision 0, then revision 1). Budget was not exhausted: direct OpenAI $0.40/$10, Gateway $0.007069/$20, active 0. The generic UI had discarded the quota error reason.
- Implemented the GOAL's 90-second per-play allowance using app session + validated runId, preserving aggregate session usage, the 12-call session cap, IP issuance/request rates, global/pool money, shared concurrency and locks. No cookie rotation or accounting reset. Failed unstarted reservations release their own run usage; started calls remain conservatively accounted.
- Safe known error codes now explain retry, exhausted fight allowance, busy connection and LOCAL RULES options. Unknown upstream text is not displayed.
- Node 22.23.2: 200/200 tests, 33 syntax checks, 20601.6749ms; offline 361518 bytes, hosted 361568 bytes. Actual isolated Redis test proved two starts per fight, third rejection, a new fight admitted on the same app session, shared concurrency lock and retained 12-call cap. Production migration atomically MAX-merged all existing voice-record allocations into the new counters without clearing totals or locks. See voice-replay/redis.json and migration.json.
- Found actual human recording in Downloads: 21028329 bytes, SHA256 7e6bd1d0dec5d2876d5b3d644b5586d2074e0f1503faaf9394bb4ec33b68642e. Full FFmpeg decode succeeded (1747 frames; 59.93 seconds; VP9/Opus). At 30s it shows actual left-sanctuary voice proposal; at 43s signed combat with 2 bullets erased; at 53s mid-fight voice asks to change right. Final amendment and interruption need closer footage review. Raw recording stays ignored/local; no viewing URL yet.
- Next: deploy the fix and run a maximum-three-session real Live connection/replay regression with silent native media, explicitly separate from the human negotiation footage. Overall GOAL remains incomplete.


## 2026-09-14T13:21:07.888843+00:00 — production replay exposed close/hangup race

- Source 67241be deployed READY as dpl_B7Ea7WHE2bAfjb9pHNgG5TExWVMq. Exact anonymous production hash matched. First actual silent-media replay attempt reached GPT-Live session.started, but stop returned uncertain; further calls were prevented by the durable kill. Failure is retained in voice-replay/production-first-attempt.json.
- Official session lifecycle guide confirms that both session.close and REST hangup end the session. Our client sent close before REST, so fast finalization could remove the session before the server checked it. The actual provider returned HTTP 404, invalid_request_error/session_id_not_found. Local confirmation responses took about six seconds, exceeding the old three-second server stop deadline.
- Normal stop now requests REST hangup first while stopping the microphone immediately, then drains the data channel briefly. Server/client stop deadlines are eight/twelve seconds within the 15-second function duration; 45-second watchdog remains.
- A provider absence error is accepted only for a server-owned previously created session and the identical creation credential fingerprint. Generic 404, another error code, changed credential, unknown ID, transport failure and 5xx still retain the reservation. This is an operational inference of session absence, not a documented final usage receipt. Full $0.05 accounting is retained. No browser claim authorizes a refund or releases a lease.
- Reconciled only the failed probe after exact equality of saved production and local creation credential; provider absence was reconfirmed, full money remained, active count became zero, and kill was kept until corrected deployment. See stop-reconciliation.json.
- Unit suite 202/202, 33 syntax files, 20509.3682ms, followed by syntax/build after extending stop deadlines. Offline HTML 361694 bytes. New negative tests cover changed key and non-specific 404; client test verifies no close is sent before confirmed REST termination.
- Reference checked 2026-09-14: https://developers.openai.com/api/docs/guides/live-conversations and https://developers.openai.com/api/reference/cli/resources/live/subresources/sessions/methods/hangup . No provider documentation is claimed to guarantee final usage from HTTP 404.
