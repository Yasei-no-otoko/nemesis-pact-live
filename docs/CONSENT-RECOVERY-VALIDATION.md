# Consent and local recovery — 2026-09-15

## Scope

Inherited default `ship/living-covenant` at `1a5146a72015629ff14840ceb83a3694ff088ed2`, clean worktree. No open PR or newer deployment; prior feedback branch already integrated. Previous recording, endings, revision impact and combat-cue releases are preserved.

Previously, pressing Get counteroffer before consent ended with an error instead of directing the player to the consent choice. It now opens the existing dialog, with localized guidance and an unchecked consent box, before constructing/sending this request. It neither consents nor signs for the player. A LOCAL RULES shortcut stays visible when OpenAI is selected, including with consent or an unavailable session. Choosing it remains an explicit action, revokes consent and invalidates pending proposals through the existing code. Provider labels remain truthful.

No provider, voice transport, server API, signatures, six-sector gameplay, recording or $10 direct/$20 Gateway cap changed.

## Verification

- 38 affected tests passed (new UI harness + covenant simulation + localization); 9 separate client/access regression tests passed. Final wording adjustment reran only the 5 new tests; all passed. Node v24.19.0. Syntax checked 58 files and build succeeded; no reason to repeat the previous 316-test full suite for this narrow UI change.
- Mock DOM/session tests cover no-consent early return, already-open dialog, signing/exit guards, successful/unavailable/disabled service states, local mode, and Japanese copy. Existing client tests cover no network without consent, truthful local fallback, cancellation and stale responses. These are mocks, not live AI evidence.
- Preview `dpl_59CztVwtjAhF8wweZNGcBvwgNXn6`: normal game controls inside 390×844 and 320×568 desktop iframes opened the Japanese consent dialog. Consent stayed false, Sign disabled, no horizontal page/dialog overflow. Choosing local retained the typed Japanese terms and returned an unsigned local proposal. No test-mode simulation state was used.
- Final preview `dpl_ADGDPsBRiuG1Um4UzmL6D6XNrauR` READY: final English consent guidance inspected in an actual desktop browser and screenshot. Closing without consent, explicitly choosing LOCAL RULES and explicitly signing reached combat. The layout fixture is only a viewport wrapper; physical-phone and human-play evidence is not claimed.
- No model request or microphone session was started during browser checks. No new video claim. Existing recording limitations remain unchanged.

Hosted SHA256 `01c3ead4762f0c97ae8b5602e06fe66cb6f6530bb69f7a91acbcb3982c611340` (639070 bytes); offline SHA256 `52c05dae35edaa0a9dc51e8b5e7717e6900ee93d8122b2256336b39c95402cbb` (639020 bytes).

Production ID/source commit and public verification are recorded after release in DELIVERY/WORKLOG. Rollback: `dpl_5aV9W1BJvxT8VG3kb5fweKMKpNnH`, preserving environment, credentials, Redis and quotas. Production excludes the preview layout fixture.

## Handoff

Next: final submission/readiness audit, not new features after 22:30. [Copy-ready submission answers](SUBMISSION-EN.md), [official form guide/link](SUBMISSION-FORM-GUIDE.md), [recording workflow](FINAL-RECORDING.md). Keep existing movie and live game available. No form or legal attestation was submitted.
