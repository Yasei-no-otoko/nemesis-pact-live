# Current validation — 2026-09-14

This file separates current evidence from v0.5.0 baseline reports. Completion gates are still open.

| Check | Observed result | Evidence / limits |
|---|---|---|
| ZIP baseline | All 216 archive files identical on import; SHA256 recorded | `PROVENANCE.md`, `source-diff-manifest.json` |
| Initial tests | 164 / 164; 17 syntax checks; Node 22.23.2 | `validation-current/baseline/` |
| Current unit suite | 198 / 198; zero failed; 20566 ms | Node 22.23.2, 2026-09-14; injected upstream/media fixtures are not live proof |
| Current syntax/build | 33 files; standalone HTML 360066 bytes | Generated from source; hosted microphone policy checked independently |
| Production text | Real gpt-4.1-mini through Vercel AI Gateway; valid contract, Sign, combat, right-side amendment | `validation-current/production-text/result.json`; 2427/1955 ms model latency; startup 1766 ms; automated Windows Edge 153.0.4234.32, software WebGL2, 1280x800 |
| Combat continuity | HP, boss HP, elapsed time preserved on amendment; 3 bullets actually erased | Same production text report and screenshots; ordinary controls and real clock |
| Production Live transport | Actual gpt-live-1 sessions, speech transcripts, delegation, Responses proposal and server hangup | `production-voice-synthetic/`; synthetic Windows TTS, not human microphone. Latest correction fixture failed because initial right-correction words were not in the received transcript. Failure retained. |
| Human microphone | User reported first voice contract change and boss defeat | 2026-09-14 Chrome production. Observed UI: Japanese caption, AI voice speaking, signed left/slow/reinforcement contract, 14 reflections and 3 bullets erased. User clarified only first negotiation tested; interruption/parley remain unverified. Win result is user-reported, not captured in a run export. |
| Server duration enforcement | Stored provider record stopped for `server-duration-limit` after 45162 ms | `production-watchdog/result.json`; client stop disabled for the fixture. Provider final closed event not observed; durable hangup confirmed. |
| Responsive layouts | 1280x800, 390x844, 320x568 | `browser/`; emulated sizes on Windows, not phone hardware |
| Failure browser | 5 / 5: manual text Sign does not claim voice; disconnect, 429, 503 fallbacks; microphone denial | `validation-current/failures/`; mocked network/media, zero model calls |
| Durable handler integration | Actual Redis: eight parallel Sign requests produce one revision, seven conflicts; other-owner/digest rejection, cancel and late-result invalidation | `handler-redis/result.json`; isolated test namespace, three fixture model responses, zero real model calls |
| Voice admission | Missing/invalid Origin, cookie, CSRF, expired identity and extra fields rejected; quota denial/store failure stop before upstream | `voice-admission/`; two matrix tests included in the 198; fixtures, not live API |
| Hardware rendering | RX 6900 XT / Edge 153: desktop WebGL2 59.99fps, WebGPU 60.11fps; emulated portrait WebGPU 59.93fps | `hardware-render/result.json`; three separate 10-second samples, actual renderer frame counts/rAF, headless automation; not phone hardware or GPU timestamp queries |
| Current production local regression | Japanese left-to-right correction, explicit no-sanctuary/slow/charged-reflection amendment, Sign revision 2 and continuity passed | `production-local/result.json`; Edge 153, hardware WebGPU, ordinary controls/clock, zero API requests or page errors |
| Current simulations / HTTP | Covenant 12/12 wins; server smoke 9 checks passed | `regression/`, `server-smoke.json`; deterministic pilot and local HTTP, zero model calls. Initial smoke assertion expected an error from intentionally local legacy route; corrected to assert the mock payload. Failure retained. |
| Voice startup body timeout | 15,042ms real-clock fixture: native audio track ended, native peer closed, late session hangup requested, LOCAL RULES Sign entered combat | `voice-body-timeout/result.json`; Edge 153 loopback, silent synthetic MediaStream, mocked HTTP responses, no human mic/model call. Startup deadline now covers the whole JSON body, including abort-ignoring transports. |
| Recorder | 60-second auto-stop, WebM saved, media decodes with audio; no browser errors | `demo-recorder/result.json`; synthetic canvas/audio fixture using real MediaRecorder. First human recording failed due native timer binding, fixed. This fixture is not the submission video. |

Direct OpenAI and Gateway budgets are separate. At 08:43:01 UTC the shared ledger held $0.300000 direct OpenAI and $0.006210 Gateway, with no active admission and no kill flag. These are conservative application accounting amounts, not provider invoices. Each stopped voice session retains $0.05 because hangup does not provide final billable usage. See `validation-current/budget-ledger.json`.

The user supplied [Vercel's Codex manual setup documentation](https://vercel.com/docs/ai-gateway/coding-agents/openai-codex#manual-setup). It establishes Gateway-key setup, not the grant's balance or expiry. Gateway credit endpoint returned team balance 0 while inference with the supplied grant key succeeded. Exact grant expiry/balance remain unverified. Hobby team and no added paid plan/payment method were observed.

Remaining required proof: human voice interruption and left-to-right correction; mid-fight voice amendment; final successful 60-second human footage with English subtitles and accessible URL; final release metadata. Physical phones and Safari remain unverified. Earlier software-rendered tests were slower than real time; the newer hardware measurements are separate short samples and do not establish sustained performance on other devices. Form submission/legal agreement is reserved for the user.
