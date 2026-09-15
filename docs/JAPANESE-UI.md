# English / Japanese UI — 2026-09-15

Initial source: d312b891e8e8eb1cf7d4489a2409c2f03927aa38 on ship/living-covenant, clean before this request. This addition extends GOAL.md's English UI requirement according to the user's explicit request; English remains available. The v0.5.0 import and existing game systems are preserved.

## Behavior

- On first visit, use the first supported browser preference in `navigator.languages` / `navigator.language`: Japanese or English, otherwise English. Modern UA strings do not reliably carry language, so the browser's actual preferred language is used.
- Title and Settings both expose English / 日本語. Manual choice wins over browser detection and persists separately as `nemesis.language.v1`. Blocked storage still permits a session-only switch.
- Translate authored menus, Settings, help/training, contracts, upgrades, routes, campaign/Director, HUD and result text. Local fonts only, no translation API, cookies or added external dependencies.
- Rule IDs, numeric values, seeds, run reports and explicit Sign remain canonical. Raw player text and Live transcripts are preserved. Model-generated free text retains the language actually returned by the provider; this UI change does not retranslate model output or restart voice sessions.
- New users get Auto Shot and Aim Assist on. Existing explicit `false` is preserved, including after reload. First Contact retains its existing automatic-fire controls.
- Japanese campaign suggestions and local Director requests select the same bounded authored catalog through Japanese keyword matching. LOCAL RULES remains identified, and proposal alone never applies a rule.

## Validation

Node 22.23.2: 286/286 tests passed (24577.0553 ms), 53 source syntax checks, standalone and hosted build passed. Unchanged core byte identity, existing API/security suites and offline CSP checks pass. The obsolete English-only text assertions were updated for this explicitly requested bilingual UI.

Actual Windows Edge 153.0.4234.32 browser: 1440×900,1280×720,430×932,320×568. Phone sizes are touch emulation, not new physical-device testing. Renderer WebGL2 / PBR via software ANGLE. `tests/i18n_browser_test.py` checks language auto-detection, reload persistence, both selectors, defaults, old off settings, storage failure, local contract proposal/Sign/combat, exact world continuity during language switches, normal campaign automatic shots, local campaign pact/Director and result UI. Result screen is a state fixture, not a claimed completed campaign. No page errors or `/api/` requests in these UI checks. Visible authored translation audit leaves only brand names and renderer/version strings in English.

The supplied web-game helper was also exercised with its established native Edge adapter and the original input payload. Its original single-canvas screenshot was black because the game composites GPU, overlay canvas and DOM HUD. A workspace-only adapter captures `#stage`; actual rendered training and input movement were visually inspected. No game behavior or global skill helper was modified for this capture.

Issues found and fixed: title footer hitbox overlap from the longer Japanese heading, regex callbacks expecting a match array, untranslated split heading nodes, Japanese LOCAL RULES keywords, and old English-only test expectations. The initial auto-shot check sampled before the existing 250 ms firing cooldown; corrected it to 700 ms. Final tested implementation retains that cooldown.

[Local browser evidence](validation-japanese/local/result.json) · [Unit summary](validation-japanese/unit-summary.txt). Production results appear below.

## Cost and rollback

No paid API calls were made by this UI validation. Approved caps remain direct OpenAI $10, Vercel AI Gateway target $20; new purchases or budget changes: none. Last measured shared ledger, 2026-09-15T04:37:44.012Z: direct $3, Gateway $0.042359, active 0. These are dated conservative reservations, not refreshed provider invoices. Exact Vercel grant balance/expiry and infrastructure consumption remain unknown.

Production predecessor: READY `dpl_f3q3Af5zwDQ2WvvhA4zuahkfhpCH`, application `06275908ab07372c59f5bbcb2033c268322b6771`. Roll back this UI release using `vercel rollback dpl_f3q3Af5zwDQ2WvvhA4zuahkfhpCH --yes --scope wildmans-projects`; preserve Redis, credentials, budget counters and saved settings. The separate gallery/video viewer and immutable v1.3.0 media release are unchanged.


## Production verified

[Play the bilingual game](https://nemesis-pact-live.vercel.app/). Application commit `e91c7e3fb78a2393efe5d51d1b365c108047e127` is pushed to the public default branch `ship/living-covenant`. READY deployment `dpl_HinZheFR4AC4ezwYS47Y884pEJm8`, immutable URL `https://nemesis-pact-live-77mfa8shu-wildmans-projects.vercel.app`. HTTP 200 returned exactly 580447 hosted bytes, SHA256 `405293ca30464bf34d6c3342b2d35e379a385f487ff3efd28dd04a106b97049b`, matching the locally built artifact on 2026-09-15T05:40:56.716Z.

The complete [production browser matrix](validation-japanese/production/result.json) passed on the same four desktop/touch-emulated sizes, plus normal campaign/defaults, local campaign Sign/Director and blocked-storage cases. The transcript detail test uses dictionary-shaped speech strings to verify that recorded words stay verbatim. Authored visible strings are Japanese; only brand and version/renderer identifiers remain English. No new physical-phone, live-microphone or model-inference trial is claimed for this UI-only release. Current voice and contract models remain GPT-Live-1 and GPT-5.6 Luna, with earlier real campaign evidence in [ADAPTIVE-VALIDATION.md](ADAPTIVE-VALIDATION.md).

The first UI deployment `dpl_CzKoKknMNwb5nRxr5CXX9ZqK8JgJ` also passed its browser matrix. A final presentation fix then protected full transcript text; the complete production matrix and 286 tests were repeated successfully. Both deploy identifiers are retained in [deployment.json](validation-japanese/deployment.json). Final evidence checkpoint: `milestone-29-japanese-ui`. No app bytes changed in the final documentation commit. The source ZIP and English video published under immutable v1.3.0 remain that earlier release; the repository default branch and live game contain this UI addition.
