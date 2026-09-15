# Adaptive campaign difficulty / v1.3.0

An optional checkbox in Expedition setup authorizes aggregate wave/sector analysis by `gpt-5.6-luna`. Results are captured before transition healing and resets. Waves 1 and2 send their own deltas; each boss clear sends all three encounters of that sector. The six fields are eliminations, reflected bullets, grazes, hull damage, elapsed seconds and remaining hull fraction. No microphone, screenshots or raw input stream is sent by this feature.

The model returns a skill band, ease/hold/raise, and concise English evidence. A validated result moves pressure by one step, clamped to -2..2. Each step adds8% to enemy bullet speed relative to selected difficulty and removes8% from regular formation arrival spacing. Counts and formation identities remain authored. Boss attacks keep their authored pattern and hull; only new enemy projectile speed is affected. Signed pact modifiers, upgrades, credits, health and elapsed combat time remain intact. Existing projectiles are not rewritten; the adjustment occurs between encounters.

The review displays actual aggregates, provider/model, rationale, before/after level and exact relative modifiers. Continue proceeds normally; Keep current pressure aborts/ignores the pending response. Disable AI stops future analysis and retains the current pressure. Unavailable service, invalid output, budget exhaustion or permission errors show LOCAL RULES and hold. Completed analyses remain in the local run report. No AI call occurs unless enabled for the run.

`/api/adaptive` uses the existing signed short app session, exact Origin, CSRF, free Redis, shared atomic budget reservations, text singleflight and kill switch. The only model is approved Luna. Strict sequence equals stage*3+wave+1,1..18. A Redis sequence+SHA256 request digest suppresses duplicate paid inference and stale completion. Unknown usage retains the full$0.01 reservation; normal token usage settles with conservative cache-write accounting. Caller cancellation prevents application; it does not assert backend inference billing stopped.

Shared paid request allowance is48 per app session (previously12), covering18 analyses,6 voices,6 contracts and corrections. IP20/minute, maximum3 concurrent requests and one active voice plus one text request per session remain. Direct OpenAI$10 and Gateway$20 global caps and their subpools remain unchanged. These are conservative application accounting limits, not an unconditional provider invoice or infrastructure guarantee.

## Demo autoplay

Expedition setup can enable a disclosed fixed steering policy. It aims, fires, predicts nearby bullets, avoids enemies/lasers and uses the existing parry, dash and Nova cooldowns. Route, upgrade, repair and relic actions spend ordinary earned resources. No simulation health, cooldown, enemy hull, damage, time, phase or victory override exists. Demo runs do not update personal scores or discoveries. Take control suspends the policy; the run remains marked as a demo.

The default demo preset is Story/Bastion. An optional pause at each pact lets a human or disclosed recording driver use real Live voice and explicitly click Sign. The autoplay policy itself never opens a microphone. Submission automation feeds original synthetic English player speech into the existing WebRTC microphone stream, including an interruption, and clicks the same validated Sign action. AI responses and combat are actual production behavior. The capture uses ordinary requestAnimationFrame, not accelerated test hooks.

## Current validation

279 unit tests passed,49 source syntax checks passed, and3 actual Redis scenarios covered digest binding, stale completion and the48-call boundary. Native Edge desktop and emulated phone layout checks passed at1440x900,1280x720,430x932 and320x568; these are not new physical phone tests. Three controlled Node simulations completed18 encounters/6 bosses with aggressive bounded pressure increases. Production now passes all18 encounters with6 actual Live voice pacts and18 Luna analyses. A native Resolve59s/1080p60 edit is complete; see ADAPTIVE-VALIDATION.md.


## Reproducing the automated recording

The owner can create original local speech fixtures with `pwsh -NoProfile -File tools/create-demo-speech.ps1` (Microsoft Zira Desktop). Install the documented test browser dependencies, set `NEMESIS_ALLOW_FULL_CAMPAIGN=1`, and run `python tests/production_full_campaign.py`. This explicitly opted-in test uses the production site and consumes the shared approved allowance: maximum6Livecalls and42Luna requests,$0.30direct and$0.42conservative Gateway reservations. It never supplies model outputs or mutates combat. The actual verified run used6voice/7proposal/18analysis requests. The normal game autoplay alone does not open a microphone or force paid analysis. Raw video and private voice IDs remain in ignored local folders.
