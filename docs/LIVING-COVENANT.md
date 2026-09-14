# Living Covenant v1 — executable contract design

## Intent

The distinctive act is a request becoming an enforceable combat rule, not a chatbot describing an unchanged shooter. A short one-boss encounter concentrates that act before the existing campaign. This build realizes the rules and a model adapter; its default provider is honestly authored local logic.

## Authority boundary

Player request → public aggregate snapshot → local or hosted proposal → strict server validation → strict client validation → readable clauses and cost → explicit signature with revision check → deterministic simulation. No generated JavaScript, arbitrary numbers, health resets, score grants or model-issued victory commands are accepted.

The generated `title`, `line` and `rationale` are flavor/information, not mechanics. UI escapes them or uses `textContent`. Only enum fields compile. A misleading spoken/flavor sentence never overrides the clauses. There are exactly **36 mechanically valid combinations**; the system does not promise unrestricted rule generation.

## Mechanical vocabulary

| Field | Permitted values | Effect / budget |
|---|---|---|
| zone | none, left, center, right | A non-none sanctuary costs 2. Circle at 25/50/75% arena width and 65% height; radius 86 arena units desktop or 68 portrait. Erases hostile bullets crossing it, not lasers or bodies. |
| speed | normal, slow | slow: hostile bullet velocity ×0.72; costs 1. |
| reflection | normal, charged | charged: reflected damage ×1.8; costs 1. |
| price | weaker_gun | Player gun damage ×0.65; pays 2. |
| price | reinforcements | 2 turrets per 9-second add timer, maximum 4 living adds; pays 3. |
| price | fragile | Incoming damage ×2; pays 3. |
| price | haste | Boss attack countdown progresses ×1.25; pays 2. |

Exactly one price. Benefits must total 1–3 and cannot exceed payment. Additional fields, unexpected prototypes, invalid revisions, unbounded strings and non-finite telemetry are rejected. Reinforcement timing follows the boss's combat update; ordinary phase/stun scheduling can delay it, rather than a promise of exact wall-clock arrivals.

## Proposal lifecycle

Initial phase `covenant` → valid signed rev1 → `combat`. At 18 simulated seconds, pause into `parley`. The player can request it with R after 8 seconds instead. A proposal alone does not advance or mutate simulation. Rev2 replaces rev1, consumes the only amendment and rescales already-flying hostile bullets by new/old speed. Player and enemy HP, elapsed time and accumulated damage remain. Cancel resumes rev1 and keeps the amendment. A broken pact cannot be amended. A stale reply is discarded after an edit, cancellation, new run, revision change or screen exit.

## Fair combat

First Contact uses fixed-step deterministic simulation beneath procedural 3D. It provides automatic aim/fire in the UI, 10 hull on standard, one Notary boss (3,600 HP), explicit ring/fan tells and longer laser tells. Boss phase changes clear hostile bullets. Winning requires killing the boss; there is no timed auto-win or unseen HP decay. The core engine's virtual bullet-protection hook retains the legacy behavior for other modes.

Actual erased-bullet and reflected-damage counters appear in combat. The before/after canvas on the contract screen is explicitly an **illustrative rule preview**, not recorded combat, a simulator replay, or AI-generated video.

## Runtime adapter and limits

The private-pilot gateway fixes the upstream to OpenAI Responses, sends bounded game context rather than screenshots, requests strict JSON Schema with `store:false`, caps output at 700 tokens and times out at 9 seconds. The client times out at 11 seconds. Provider labels distinguish actual valid upstream output from local fallback. A refusal, timeout, malformed output or unpaid power combination never silently applies rules.

Live origin/token checks, 8 requests/minute and a default 100-call per-process lifetime cap reduce accidental use. **They are not durable authentication, global spending limits or server-authoritative anti-cheat.** The old intelligence endpoint has its own gate. A public deployment needs shared durable quotas, platform-level cost controls and a kill switch. Receipts are browser-local debugging data, not signed proof of inference.

## Memory and privacy

Local memory is only bounded honored/broken counts. Aggregate elapsed time, parries, grazes, damage taken, shield count and reflected damage may be transmitted after consent. The request also contains the seed and previous contract. No microphone, camera, screen capture or personal account identifier is requested. Pilot codes are held only in memory. Do not place sensitive data in player-entered text. Generated output still needs normal product-level content review before unrestricted publication.
