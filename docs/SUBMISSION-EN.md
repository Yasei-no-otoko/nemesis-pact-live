# Submission answers — NEMESIS PACT v1.1.0

Copy only each paragraph body, excluding headings and word counts. Every answer is 200 whitespace-separated English words, within the form maximum. Personal fields are saved only in the ignored local submission kit.

## Project description

NEMESIS PACT is a browser roguelite arena shooter where negotiating with an enemy changes the rules you must survive. It is built for players who enjoy bullet hell, build choices, and discovering unexpected strategies, with a short First Contact encounter that lets judges experience the central idea quickly.

Speak to THE NOTARY in English or Japanese, interrupt its reply, correct your request, inspect the revised Living Covenant, and explicitly sign. Ask for a sanctuary, slower bullets, or stronger reflections, then accept a concrete price such as weaker shots or hostile reinforcements. The signed clauses immediately shape real combat. One amendment during the encounter preserves player health, boss damage, and elapsed time.

Beyond First Contact, the six sector campaign offers three airframes, branching routes, upgrades, relics, and distinct bosses. Its AI Director proposes validated enemy formations that players compare and approve before launching.

Two dimensional combat is presented through a custom WebGL2 and WebGPU renderer without Three.js, with procedural geometry and synthesized music. Keyboard and touch controls, captions, readable contract previews, and explicit LOCAL RULES fallback make the game playable without a microphone or API access. The production game, source, and an actual human gameplay video are publicly accessible for review.

Word count: 200.

## Judging criteria 1 (30%) - Meaningful use of OpenAI tools

GPT-Live-1 makes spoken negotiation a playable control surface. Over the Live API and WebRTC, players speak to THE NOTARY, interrupt its answer, and revise their terms in English or Japanese. Client delegation sends the negotiated intent to GPT-5.6 Luna through Vercel AI Gateway Responses. Typed requests enter the same contract pipeline.

Luna proposes funded combinations of authored clauses: bullet sanctuaries, slower hostile fire, stronger reflections, and explicit costs. Validation rejects unsupported mechanics. Only the player's Sign action applies the displayed contract; generated speech cannot grant powers or silently change combat. Revision tracking invalidates superseded proposals, including results arriving after a spoken correction. A subsequent signed amendment preserves health, boss damage, and elapsed time.

The campaign Director also uses Luna to select bounded formations. Players compare actual scheduled enemies and arrival intervals before approving the change.

Codex supported implementation, debugging, tests, deployment, and browser verification. OpenAI image generation produced concept boards that informed procedural visuals and interface refinement. Real production API evidence and human gameplay demonstrate the integration. The meaningful contribution is a continuous loop from natural language intention to understandable, consequential combat rules, while deterministic simulation keeps reflex play responsive and explicit LOCAL RULES preserves access when AI is unavailable.

Word count: 200.

## Judging criteria 2 (25%) - Originality

NEMESIS PACT turns a boss encounter into a negotiated ruleset. The opponent is an adversary and the counterparty to a Living Covenant. Conversation creates choices the player must execute: protecting one flank may introduce hostile reinforcements, while stronger reflected damage can require weaker ordinary shots. The enemy's offer becomes a strategic build decision with consequences.

Its distinctive interaction is revision under pressure. A player can interrupt the speaking rival, change left to right, review the corrected clauses, and sign. During battle, a second negotiation changes tactics without erasing accumulated damage or elapsed time. The resulting story emerges from conversation and skilled play, rather than dialogue alone.

The system gives natural language flexibility a legible mechanical boundary. Every advantage and price is inspectable, unsupported promises are rejected, and the final encounter record reports actual sanctuary interceptions and reflected damage. Honoring or breaking the agreement changes the meaning of victory.

A separate AI Director extends player authorship into the roguelite campaign: request a preferred kind of pressure, compare seeded formations, and approve the next combat pattern. The combination connects conversational AI, negotiated commitments, and a precision two dimensional shooter through one coherent fantasy: write the terms, then prove you can survive them.

Word count: 200.

## Juding criteria 3 (25%) - Playability / Utility

The production HTTPS game is playable in a desktop or mobile browser. First Contact presents a loop: negotiate, inspect benefits and costs, sign, fight, renegotiate once, and defeat the boss. Automatic aim and fire in this mode let new players focus on movement, parrying, dashing, and understanding their contract.

Players can type or use GPT-Live-1 voice. Captions, output volume, mute, scrollable transcripts, and a separate consent dialog make negotiation accessible. Microphone refusal, connection failure, or exhausted API allowance produces an explicit LOCAL RULES alternative. Offline play remains functional rather than ending at an error screen.

The full campaign adds six sectors, six bosses, three airframes, route choices, upgrades, relics, and an AI Director. Its preview shows actual enemy composition and arrival spacing before explicit approval. Keyboard controls and portrait touch controls support play contexts; mobile review tabs and persistent action buttons keep decisions reachable.

Human iPhone 16 Pro Max footage demonstrates interruption, corrected OpenAI contracts, touch combat, renegotiation, and victory. Windows Vivaldi voice success is separately reported. Automated Edge checks cover desktop and phone layouts, with emulation clearly distinguished from physical devices. The publicly viewable 59 second demonstration and downloadable source make the submitted experience easy for judges to inspect.

Word count: 200.

## Judging criteria 4 (20%) - Execution and craft

The game combines deterministic two dimensional combat with a custom WebGL2 and WebGPU renderer, without Three.js or a game framework. Procedural geometry, shaders, and synthesized Web Audio deliver the client in under 450 KB of self contained HTML before compression, with no imported models, font downloads, or sampled soundtrack assets.

OpenAI generated concept boards guided iterative visual refinement: the geometric Notary, color hierarchy, sanctuaries, compact contract review, and engraved encounter records. Actual screenshots drove revisions across desktop and portrait layouts. Enemy bullets, magenta lasers, player attacks, and contract effects remain visually distinct, with adjustable effects and reduced motion support.

The implementation separates AI proposals from deterministic authority. Signed sessions, CSRF checks, durable Redis quotas, atomic budget reservations, concurrency limits, and a kill switch protect paid endpoints. Dedicated proposal ledgers reject stale and duplicate approvals. Voice shutdown and amendment continuity have production evidence.

Current verification includes 239 unit tests, real Redis atomic checks, browser interaction and rendering checks, and actual Luna Director inference followed by approved enemy spawning. GitHub commits, readable tags, deployment hashes, budgets, and rollback instructions preserve reviewability. The human submission video was edited in DaVinci Resolve to 59 seconds at 1080p60, retaining original voices and documenting capture limitations.

Word count: 200.

## Pre-existing code, open-source components, datasets, or third-party tools.

The starting material was the participant supplied NEMESIS PACT v0.5.0 source archive, including its existing shooter, campaign, procedural renderer, touch controls, and synthesized soundtrack. Its earlier version lineage and preserved source hashes are disclosed in PROVENANCE.md and SOURCES-AND-LICENSES.md. This submission adds verified live negotiation, contract safeguards, production deployment, interface refinement, and the AI Director. No new open source license has been assigned to project specific or supplied code.

The renderer incorporates Krzysztof Narkowicz's fitted ACES filmic curve under the documented CC0 option. The declared server runtime package, @vercel/functions 3.9.7, is Apache-2.0; dependency declarations remain in the lockfile. No Three.js, OpenAI SDK, external dataset, imported 3D model, font file, or sampled music is bundled in the game.

Development and verification used Node.js (MIT), Python (PSF-2.0), Playwright (Apache-2.0), Chromium (BSD-3-Clause with component notices), SwiftShader (Apache-2.0), Pillow (MIT-CMU), NumPy (BSD-3-Clause), and a GPL-2.0-or-later FFmpeg build. These tools are not redistributed in the game HTML.

Codex, OpenAI image generation, OpenAI APIs, Vercel, Upstash, GitHub, Microsoft Edge, and DaVinci Resolve are services or tools governed by their respective terms. Generated concept boards informed authored geometry and CSS; human gameplay footage retains original audio. Third party notices distinguish incorporated material from development tooling and preserve attribution.

Word count: 200.
