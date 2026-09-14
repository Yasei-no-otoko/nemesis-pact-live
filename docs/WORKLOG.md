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
