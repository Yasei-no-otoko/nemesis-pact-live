# NEMESIS PACT v1.3.0 — Living Covenant

Negotiate the rules. Fight your deal.

[Play on production HTTPS](https://nemesis-pact-live.vercel.app) · [Watch the59-second1080p60 demo](https://www.circle-hydrangea.net/nemesis-pact-live/) · [Current validation](docs/VALIDATION-CURRENT.md) · [Japanese guide](README-JA.md)

Built from the verified v0.5.0 source ZIP. The framework-free game and six-sector campaign are preserved. First Contact is a short boss encounter: ask for a sanctuary, slower bullets or stronger reflections, accept a cost, review the clauses, and click **Sign**. At 8 seconds press **R** to renegotiate once; at 18 seconds parley opens automatically. Health, boss damage and elapsed combat time survive the amendment.

The v1.0.0 finish adds a dedicated First Contact victory/defeat record: your final signed terms, sanctuary interceptions, reflected hit damage and remaining hull. Contextual combat guidance calls out lasers and ready Nova; Pause explains amendment availability and offers First Contact controls. [Concept and improvement loop](docs/V1.0.0-PLAN.md). The existing human59s/60fps movie shows an earlier verified build, not the refreshed artwork.

## Adaptive difficulty and demo autoplay

In **Full campaign → Expedition**, enable **AI adaptive difficulty** to let GPT-5.6 Luna assess actual wave and sector results. Pressure changes one bounded step between encounters, with visible rationale and a maximum16% speed/spacing adjustment. Hull, upgrades and signed pacts are preserved. LOCAL RULES holds pressure when AI is unavailable.

**Demo autoplay** uses ordinary controls and earned upgrades to play all six sectors. **Take control** pauses the policy; demo scores remain separate. Optional **Pause at pacts for live negotiation** lets you negotiate and sign each sector contract. [Actual full-run proof and59s film](docs/ADAPTIVE-VALIDATION.md).

## Voice contracts throughout the campaign

In any campaign sector, choose **Negotiate by voice / AI**, select OpenAI and give consent. Use **Start voice**, interrupt the rival to revise, or type English/Japanese. GPT-Live-1 delegates to GPT-5.6 Luna to select from that sector's three authored pacts. Review the benefit and price, then **Sign & enter combat**. The same simulation effects apply without resetting your run. Back cancels; LOCAL RULES works offline. [Validation and coverage](docs/CAMPAIGN-VALIDATION.md).

## AI campaign Director

In **Full campaign → Expedition → AI Director**, choose OpenAI, give consent, and describe your preferred formation in English or Japanese. GPT-5.6 Luna chooses a validated authored template. Compare the actual scheduled enemy counts and arrival spacing for each route, then click **Use this formation**. Only that action changes upcoming regular waves; boss attacks and pact rules remain separate. The selection persists until changed. LOCAL RULES is available offline or when service/budget limits are reached. [Validation and limits](docs/DIRECTOR-VALIDATION.md).

## Play

1. Choose **Make first contact**
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
