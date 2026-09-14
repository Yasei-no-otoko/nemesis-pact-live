# NEMESIS PACT — Living Covenant

Negotiate the rules. Fight your deal.

[Play on production HTTPS](https://nemesis-pact-live.vercel.app) · [Watch the59-second1080p60 demo](https://www.circle-hydrangea.net/nemesis-pact-live/) · [Current validation](docs/VALIDATION-CURRENT.md) · [Japanese guide](README-JA.md)

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

## Verified delivery and evidence

Actual production GPT-Live-1 and GPT-5.6 Luna tests cover correction during output, canonical proposals, both signatures, actual changed combat, preserved health/time, and terminated sessions. Synthetic test speech is labeled separately from human recordings. The latest physical iPhone16ProMax human source now shows both voices, left-to-right correction, OPENAI right Sign, sanctuary combat, spoken removal, OPENAI Sign2 and boss defeat. Safari is visible in the broadcast selector; its version is unknown. Earlier human Chrome/Vivaldi and iPhone LOCAL RULES failure evidence retain their original labels.

The optional `?demo=1` recorder runs until **Stop & save**, requests60fps and directly combines game, active microphone and remote voice audio.229 Node22 tests and34 syntax checks/build pass; native Edge tagged-tone audio plus production save/restart tests passed without paid model calls. Voice session/budget limits are independent of recording length.

The phone recording is edited in native DaVinci Resolve to **59 seconds /1920x1080 /fixed60fps**,8 chronological cuts, original linked sound and English captions. All3540 frames decode; native Edge plays through to ended. Raw capture averaged34.499 delivered fps; conversion adds no missing motion and does not measure game FPS. See [current human evidence](docs/validation-current/phone-long/README.md) and [recording/editing](docs/FINAL-RECORDING.md). The prior desktop59s60fps edit remains available locally.

On the RX6900XT host, separate10-second automated Edge samples measured59.99fps WebGL2 and60.11fps WebGPU at1280x800; emulated390x844 portrait measured59.93fps. These are not physical-phone performance measurements. Android/macOS and sustained mobile FPS remain unverified.

The [final human demo](https://www.circle-hydrangea.net/nemesis-pact-live/) and [MP4/SRT/source ZIP release](https://github.com/Yasei-no-otoko/nemesis-pact-live/releases/tag/milestone-16-iphone-demo-audio) are public. This existing repository was made public at the user's request after scanning reachable Git history for configured credentials. Anonymous native Edge played the remote video through59.008s at normal speed; the public source ZIP downloaded with matching SHA256. Current production, conservative budgets and rollback are recorded in [delivery](docs/DELIVERY.md).
