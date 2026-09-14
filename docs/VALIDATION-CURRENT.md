# Current validation — 2026-09-14

This file separates current evidence from v0.5.0 baseline reports. Completion gates are still open.

| Check | Observed result | Evidence / limits |
|---|---|---|
| ZIP baseline | All 216 archive files identical on import; SHA256 recorded | `PROVENANCE.md`, `source-diff-manifest.json` |
| Initial tests | 164 / 164; 17 syntax checks; Node 22.23.2 | `validation-current/baseline/` |
| Current unit suite | 193 / 193; zero failed; 5605 ms | Node 22.23.2, 2026-09-14; injected upstream/media fixtures are not live proof |
| Current syntax/build | 33 files; standalone HTML 359179 bytes | Generated from source; hosted microphone policy checked independently |
| Production text | Real gpt-4.1-mini through Vercel AI Gateway; valid contract, Sign, combat, right-side amendment | `validation-current/production-text/result.json`; 2427/1955 ms model latency; startup 1766 ms; automated Windows Edge 153.0.4234.32, software WebGL2, 1280x800 |
| Combat continuity | HP, boss HP, elapsed time preserved on amendment; 3 bullets actually erased | Same production text report and screenshots; ordinary controls and real clock |
| Production Live transport | Actual gpt-live-1 sessions, speech transcripts, delegation, Responses proposal and server hangup | `production-voice-synthetic/`; synthetic Windows TTS, not human microphone. Latest correction fixture failed because initial right-correction words were not in the received transcript. Failure retained. |
| Human microphone | User reported first voice contract change and boss defeat | 2026-09-14 Chrome production. Observed UI: Japanese caption, AI voice speaking, signed left/slow/reinforcement contract, 14 reflections and 3 bullets erased. User clarified only first negotiation tested; interruption/parley remain unverified. Win result is user-reported, not captured in a run export. |
| Server duration enforcement | Stored provider record stopped for `server-duration-limit` after 45162 ms | `production-watchdog/result.json`; client stop disabled for the fixture. Provider final closed event not observed; durable hangup confirmed. |
| Responsive layouts | 1280x800, 390x844, 320x568 | `browser/`; emulated sizes on Windows, not phone hardware |
| Recorder | 60-second auto-stop, WebM saved, media decodes with audio; no browser errors | `demo-recorder/result.json`; synthetic canvas/audio fixture using real MediaRecorder. First human recording failed due native timer binding, fixed. This fixture is not the submission video. |

Direct OpenAI and Gateway budgets are separate. At 07:52:33 UTC the shared ledger held $0.300000 direct OpenAI and $0.006210 Gateway, with no active admission and no kill flag. These are conservative application accounting amounts, not provider invoices. Each stopped voice session retains $0.05 because hangup does not provide final billable usage. See `validation-current/budget-ledger.json`.

The user supplied [Vercel's Codex manual setup documentation](https://vercel.com/docs/ai-gateway/coding-agents/openai-codex#manual-setup). It establishes Gateway-key setup, not the grant's balance or expiry. Gateway credit endpoint returned team balance 0 while inference with the supplied grant key succeeded. Exact grant expiry/balance remain unverified. Hobby team and no added paid plan/payment method were observed.

Remaining required proof: human voice interruption and left-to-right correction; mid-fight voice amendment; final successful 60-second human footage with English subtitles and accessible URL; final release metadata. Physical phones, Safari, native WebGPU and hardware FPS are unverified. Software rendering was slower than real time; it does not demonstrate the desktop 60fps target. Form submission/legal agreement is reserved for the user.
