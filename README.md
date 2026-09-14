# NEMESIS PACT — Living Covenant

Negotiate the rules. Fight your deal.

[Play on production HTTPS](https://nemesis-pact-live.vercel.app) · [Current validation](docs/VALIDATION-CURRENT.md) · [Japanese guide](README-JA.md)

Built from the verified v0.5.0 source ZIP. The framework-free game and six-sector campaign are preserved. First Contact is a short boss encounter: ask for a sanctuary, slower bullets or stronger reflections, accept a cost, review the clauses, and click **Sign**. At 8 seconds press **R** to renegotiate once; at 18 seconds parley opens automatically. Health, boss damage and elapsed combat time survive the amendment.

## Play

1. Choose **Negotiate the rules. Fight your deal.**
2. Use **LOCAL RULES** immediately, or consent to OpenAI processing. Type English/Japanese or click **Start voice** and allow the microphone.
3. Review the displayed advantages and price. An unsigned proposal changes nothing; only **Sign** applies it.
4. Move with WASD/arrows, parry with E, dash with Space. Aim/fire are automatic in First Contact. F uses Nova, Q breaks the pact, R opens parley, Esc pauses. Touch controls are available.

The sanctuary is a circle that erases hostile bullets. It does not block lasers or enemy bodies. Actual erased bullets and reflected damage appear in the HUD. Voice output is AI-generated. Captions, mute, volume and text entry remain available.

## Live architecture

Microphone → **GPT-Live-1** over the official Live API/WebRTC → client delegation → **GPT-5.6 Luna (gpt-5.6-luna)** via Vercel AI Gateway Responses → canonical validation → explicit Sign → deterministic combat.

Voice and text share the same proposal, validation, signature and battle code. Speech never signs. Request versions, proposal digests and a durable atomic signature ledger reject stale/duplicate applications. Reconnect starts a fresh bounded voice session; it does not silently restore or sign a proposal.

The server uses short-lived signed HttpOnly sessions, exact Origin/CSRF checks, shared Upstash quotas, atomic cost reservations, concurrency limits and kill switches. Each voice session is limited to 45 seconds with a server hangup watchdog. Unknown termination blocks new admission and retains reserved cost. The legacy intelligence route cannot make billable calls. See [operations](docs/OPERATIONS.md).

Direct OpenAI is separately capped at $10 ($3 verification, $5 public, $2 judging). Gateway is capped at $20 ($1 verification, $14 public, $5 judging). These are conservative application controls, not provider invoice guarantees. The user-reported Gateway grant is $30; its exact grant balance and expiry remain unverified. No paid plan or automatic purchase was enabled.

## Run locally

Use Node.js 22:

```sh
npm ci
npm run check
npm test
npm run build
npm start
```

The printed loopback URL serves the bundled game and bounded API routes. Defaults use local rules. Copy `.env.example` into a Git-ignored environment file only when configuring live server services. Keep all API and Redis keys server-side. Never serve the repository root with a generic file server after adding secrets.

`dist/NEMESIS-PACT.html` is the standalone offline build: open it directly, without accounts or network access. It cannot perform live inference. The hosted page is generated from `index.html` and `src/`; do not edit generated HTML alone.

## Evidence and remaining gates

Production real-model text → Sign → combat effects → signed amendment has passed in automated Edge on Windows. Real GPT-Live-1 production sessions have exchanged speech transcripts, delegations and canonical proposals. The human Chrome recording shows a mid-fight spoken right amendment, revision 2 and combat; separate iPhone 16 Pro Max footage shows interruption and correction, but its corrected Sign used LOCAL RULES. The user then reported that the corrected OPENAI proposal and Sign succeeded in Windows Vivaldi (the earlier human path used gpt-4.1-mini). The current GPT-Live-1 → GPT-5.6 Luna path also passed production interruption, corrected right Sign, combat and spoken amendment/Sign in automated Edge using synthetic audio. Both sessions stopped, two bullets were erased, and health/boss health/time were preserved. This supplements, rather than relabels, the earlier human evidence. Synthetic speech diagnostics are recorded separately, including a failed correction fixture. On the actual RX 6900 XT host, automated Edge measured 59.99fps WebGL2 and 60.11fps WebGPU at 1280x800 over separate 10-second samples. A 390x844 emulated portrait sample measured 59.93fps; it is not a physical phone result. Actual phone/browser coverage remains limited and Safari is unverified.

The optional `?demo=1` recorder saves locally until **Stop & save**, requests 60fps and has no fixed time cutoff. Capture through boss defeat, then edit to at most 60 seconds. The new 119.65-second human recording is now edited in native DaVinci Resolve to **59 seconds / 1920x1080 / fixed 60fps**, with original linked audio and English captions. It shows corrected OPENAI Luna right Sign, sanctuary combat, spoken amendment, Sign2 and boss defeat. All 3540 output frames decode correctly; the raw capture averaged 58.688fps. See [recording/editing instructions](docs/FINAL-RECORDING.md) and [current human evidence](docs/validation-current/human-long/README.md).

The local video still needs recorded Notary-audio confirmation and final human review. Approved public video hosting and source/judge access are pending; the repository remains private. Earlier incomplete desktop/iPhone clips and the fixed clause-withdrawal failure retain their original evidence labels. The manual recorder passed 223 unit tests plus local 65-second and production save/restart checks, with no model calls from those recorder fixtures.

[Source provenance](docs/PROVENANCE.md) · [Protocol evidence](docs/LIVE-PROTOCOL-EVIDENCE.md) · [Work log](docs/WORKLOG.md) · [Third-party notices](THIRD_PARTY_NOTICES.md). No new license is granted for project-specific code.
