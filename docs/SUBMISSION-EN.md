# Project description

NEMESIS PACT is a short browser bullet hell where negotiation is the core mechanic. The player asks a rival for combat terms, reviews a bounded canonical contract, explicitly signs it, and then survives the rules they chose. First Contact makes the loop playable in minutes while the six-sector campaign remains available. A signed amendment can change the fight while preserving hull, boss health, elapsed time, and prior combat results. Local Rules keeps the game playable without a microphone or network.

# Meaningful use of OpenAI tools

The runtime separates a text contract provider from the GPT-Live-1 voice frontend. Server code treats model prose and speech as untrusted input, validates a strict contract schema, and lets only an explicit Sign action apply rules. The deployed path uses native HTTPS requests to `gpt-4.1-mini` through Vercel AI Gateway for text and `gpt-live-1` for voice. The user reported a first voice-originated contract change and boss defeat; voice captions and a signed contract were independently observed. Full interruption and corrected right-side renegotiation remain unverified.

# Originality

The Living Covenant design makes conversation mechanically legible: benefits and costs are authored clauses that map to bullet sanctuaries, bullet speed, reflection, gun strength, reinforcements, and boss pressure. The player can compare revisions and see signed revision, actual bullets erased, and actual reflected damage. The system rejects unsupported mechanics, stale proposals, duplicate events, and implicit speech signatures.

# Playability and utility

First Contact provides a direct first encounter with automatic aim and fire, readable contract review, explicit signature, and a compact combat loop. Keyboard, touch, local fallback, reduced-motion behavior, and synthesized Web Audio support access across common browser contexts. Production checks covered desktop browser flows and a real voice contract change; physical phone testing, full interruption, and complete public playthrough remain open verification items.

# Execution and craft

The implementation preserves the existing six-sector game and rendering architecture while adding a bounded proposal ledger, durable access controls, contract effects, voice lifecycle handling, and visual before/after state. The production deployment is `dpl_9VterKz8JkDeyjVGpdJrVqcm3e48`. The current evidence supports deployed text and one real voice contract change; it does not claim a finished one-minute public video or a fully verified interruption sequence.

# Sources and licenses

The v0.5.0 source is based on the supplied NEMESIS-PACT v0.5.0 source archive and preserves the existing project code and historical disclosures. Project-specific code receives no newly assigned open-source license here. The renderer credits Krzysztof Narkowicz's ACES filmic curve under the documented CC0 option. Runtime dependency inventory includes `@vercel/functions` 3.9.7 (Apache-2.0); development tools and their licenses are recorded separately. No external images, fonts, sampled music, datasets, or 3D models were added.
