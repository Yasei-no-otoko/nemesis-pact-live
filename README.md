# NEMESIS PACT — LIVING COVENANT

**v0.5.0 · playable code update to the supplied v0.4.1 · English UI / English or Japanese request text**

Ask the enemy for a different fight. Inspect the binding clauses. Sign. Survive the rules you chose. At eighteen seconds, renegotiate once without resetting the damage already dealt.

## Run it

Open `dist/NEMESIS-PACT.html`, then **Meet your nemesis**. This is a self-contained local-rule rehearsal; no account, API key or network request is needed. It is **not live AI inference**.

To serve the same game with its optional backend, use Node.js 22:

```sh
npm run build
npm start
```

Open the loopback URL printed by the server. No npm runtime dependency installation is needed. Do not serve the repository root with a generic file server after adding secrets. `tools/serve.js` serves only the built page and the two bounded API routes. Japanese instructions: **[README-JA.md](README-JA.md)**.

## What is new

| Area | v0.5.0 addition |
|---|---|
| Fast first play | First Contact: one boss, automatic aiming/firing, direct access from the title. Full six-sector campaign remains a separate button. |
| Contract composition | A bounded rule language combines left/center/right bullet sanctuaries, slower enemy bullets and amplified reflections with one explicit cost. Exactly 36 legal mechanical combinations, not unlimited generated mechanics. |
| Meaningful signature | A proposal is pure data. Only an explicit signature applies validated rules. Edited, stale and superseded proposals cannot silently change a fight. |
| Mid-fight negotiation | Automatic pause at 18 seconds, or R after 8 seconds. One signed replacement; cancel is free. Preserve hull, boss HP, time and existing damage. |
| Visible consequences | Show signed revision, actual bullets erased and actual reflected damage. Display boss telegraphs and sanctuary geometry. |
| Enemy memory | Keep bounded local counts of honored and broken signatures; no invented long-term conversation history. |
| Craft | New obsidian/brass First Contact arena, restrained ground lighting, clearer silhouettes, redesigned contract panel, before/after illustration, desktop and narrow-screen layouts. |
| Optional model path | A server-only Responses API adapter with strict structured output, validation, timeout and explicit local fallback. No microphone, voice transport or GPT-Live connection is shipped. |

### Controls in First Contact

Move with WASD or arrows; E parries; Space dashes; F uses Nova; Q breaks the pact; R requests parley; Esc pauses. Aim and fire are automatic in this mode. Touch controls expose movement and action buttons separately. Magenta lasers require evasion/dashing: sanctuaries stop bullets, not lasers or bodies.

The default example trades **left sanctuary + enemy bullet speed −28%** for **two additional turrets every 9 seconds, capped at four adds**. A replacement can trade weaker gun damage for **slower bullets + reflected damage ×1.8**. Model prose does not authorize any rule absent from the displayed clauses.

## AI status — read before presenting

**Implemented:** deterministic rule compiler and game effects; local rehearsal; private-pilot server adapter; server tests with injected upstream fixtures; provider/revision receipts; browser interactions.

**Not verified or completed:** a real OpenAI inference call with the user's key; production deployment; GPT-Live-1 session transport/voice; Safari/native WebGPU/physical-phone testing; human difficulty evaluation; published one-minute video; contest submission.

Track 1 requires generative AI in the runtime core loop. A locally scripted rehearsal does **not** demonstrate that requirement. The included application fields keep this qualification. Capture an actual successful model request → validated proposal → signature → changed combat loop before claiming live AI functionality.

## Private-pilot configuration

Copy `.env.example` to `.env`. Set `AI_MODE=live`, a server-side API key, an accessible **Responses text model supporting strict JSON Schema**, the exact `ALLOWED_ORIGIN`, and a random 32-byte hex `PILOT_ACCESS_TOKEN`. Start with:

```sh
node --env-file=.env tools/serve.js
```

In the hosted contract screen, expand **OpenAI pilot connection / privacy**, select the server provider, enter the **pilot code (not your API key)** and consent to sending the listed data. Only an actual valid upstream result is labelled `OPENAI`. Timeouts/invalid output display `LOCAL RULES`. The standalone file intentionally rejects server use.

The new gateway's 8/minute and `PILOT_MAX_CALLS` limits are **per process**, not durable user quotas or billing limits. The legacy intelligence route has separate limits. A private pilot is not production-ready authentication. Do not publish a shared unrestricted access code.

## Verification and source layout

`npm test` runs the current Node test suite. `npm run check` checks syntax. `npm run test:covenant` tests the new rules/gateway. `npm run test:covenant-browser` needs Python Playwright and Chromium; on Linux run it under `xvfb-run -a`. `npm run test:campaign` and `node tests/covenant-simulate.js` run legal-input, full-state heuristic simulations. `npm run test:server` tests loopback HTTP without calling OpenAI.

Current evidence: [docs/VALIDATION-0.5.0.md](docs/VALIDATION-0.5.0.md). Browser frames use actual WebGL2 via software ANGLE/SwiftShader; they are not physical-GPU performance measurements. Baseline evidence remains explicitly versioned `validation-0.4.1`.

`src/covenant.js` owns the validated rules and new encounter. `src/game.js` owns UI/signature boundaries. `server/covenant.mjs` owns the Responses adapter. `src/covenant.css` and the mode-scoped scenery/shader changes own the new presentation. `api/covenant.mjs` is the Vercel route wrapper.

See [docs/LIVING-COVENANT.md](docs/LIVING-COVENANT.md), [docs/GPT-LIVE-1-ASSESSMENT-JA.md](docs/GPT-LIVE-1-ASSESSMENT-JA.md), [docs/PROVENANCE.md](docs/PROVENANCE.md), and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). No open-source license has been newly granted for project-specific code.
