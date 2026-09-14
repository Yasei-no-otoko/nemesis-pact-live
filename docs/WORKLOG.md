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
