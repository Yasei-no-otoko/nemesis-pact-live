# Deadline goal — 2026-09-15, 23:59 Asia/Tokyo

User request: take over Codex's work on this repository and keep improving an AI-native game with Game of the Year-level ambition until the submission deadline. Award quality is an aspiration; the completion gates are a compelling, playable, demonstrably AI-driven encounter and a stable submission.

## Current direction

Make the sequence **negotiate → sign → see consequences → change the deal → resolve the fight** legible and satisfying. Preserve the existing Live voice/delegation/signature architecture, six-sector campaign, bilingual UI, actual demo recordings, and budget controls. Start from current `ship/living-covenant`, not the older v0.5.0 input mentioned in the historical GOAL.

Baseline inherited on this iteration: `7d9801b051dbf8ff837dcbdc270fb4c67f3567bb`. Production before this change: `dpl_DxteZ6M6R4gkuutd5STJTmVmH3BB`. The repository is Git-backed; commit and push the real work. Do not overwrite other Codex commits or force-push.

## Improvement loop

1. Read this file, the latest WORKLOG entry and DELIVERY. Fetch the remote and check for a concurrent active iteration before editing. Incorporate newer user work. Use an isolated branch for each coherent slice.
2. Inspect the player flow and pick the highest-impact remaining problem. Prefer a concrete improvement that can be implemented and verified in this iteration. Do not add a new model, service or framework just for novelty.
3. Implement, run affected tests, build, and inspect actual browser UI. Preserve explicit Sign, stale-response protections, privacy choices, termination and cost limits.
4. Publish a bounded preview to the **existing** Vercel project, inspect it, then publish the verified source to production. Keep test fixtures out of production. Record what was actually verified and what remains unverified.
5. Commit/push, record the deployment and rollback, update this queue, then stop the iteration so the next can resume from a clear checkpoint.

After **22:30 JST**, only submission blockers, regressions and essential clarity fixes. At **23:00 JST**, perform the final release/submission-readiness audit. Aim to finish any necessary code changes by **23:20 JST** and preserve a review window before **23:59 JST**. Do not label post-deadline work as contest-period work. Keep the submitted links available through September 17.

The official submission form and rights attestations remain the representative's final action; this request to improve the game is not authorization to submit legal confirmations. Prepare the actual links and final copy first.

## Latest checkpoint — consent and local recovery, 22:11 JST

Source `795e39efe609fe188646ed354268b560ea432486`, production READY `dpl_CPSZWuHrirUtLbpt2hwcArHYbtRU`, rollback `dpl_5aV9W1BJvxT8VG3kb5fweKMKpNnH`. Missing-consent Get counteroffer opens an unchecked consent/provider dialog before sending this request. The explicit LOCAL RULES shortcut remains visible for online users too. Tests47 plus final wording test5 passed, syntax58/build passed, normal browser flow and 390/320px iframe layouts checked. Public bytes match the hosted build, QA fixture404. Preserve all prior fixes. [Details](CONSENT-RECOVERY-VALIDATION.md).

Next run: final submission and readiness audit. After22:30 restrict work to submission blockers/regressions; finish needed code by23:20, no code publication after23:30. The representative still owns form submission and legal confirmations. No new movie, live-model or physical-phone proof from this slice.

## Previous checkpoint — combat danger cues, 21:17 JST

Source `aaebc53c3a11b69daf18475a198bb3c0289fdedb`, production READY `dpl_5aV9W1BJvxT8VG3kb5fweKMKpNnH`; rollback `dpl_jjZJRD4fv99WWvDwxGTmYS2b4SHu`. Laser priority, cooldown-aware dash/parry hints, low-hull guidance, Japanese combat copy and HP-bar overlap are fixed. Tests 316/316, syntax58/build passed; synthetic 390/320px browser fixtures plus normal public LOCAL RULES/sign/combat confirmed. Public bytes match build, QA fixture404. See [scope and limitations](COMBAT-CUES-VALIDATION.md). Preserve the recording/ending/revision fixes. Do not redo this slice. No AI or microphone call, quota change or form submission occurred.

## Previous checkpoint — revision impact and retry clarity, 18:24 JST

First Contact now breaks the signed record into revision-specific, recorded effects: bullets erased and reflected hit damage from one signature until the next. A breach snapshot prevents play after contract destruction from being credited to the void terms. The retry message and action make clear that the same battlefield restarts with an unsigned negotiation and still requires Sign. Source `2dbc106f82d230ef067004624277cd1eb32265dd`; production READY `dpl_jjZJRD4fv99WWvDwxGTmYS2b4SHu`; rollback `dpl_HMUQpEts6YvcHm8L9ZhCv6op1tDv`.

Full tests 310/310, syntax 58 and build passed. Browser verification covered an ordinary-control two-signature loss at 1280×800 and a labeled deterministic victory fixture at 390×844 / 320Õ68 with Japanese UI. No live AI, human play, physical phone or microphone claim comes from this iteration. Public bytes match the source build and the fixture is excluded. This outcome/retry slice is complete; do not redo it in the next loop.

## Latest checkpoint — direct game recording, 17:28 JST

The user-reported screen-share blocker is resolved by the default Game recording path at `/?demo=1`. Current source `dc63f6e3bd8c8d9903e366bbb6c5b03c151cbc83`; production READY `dpl_HMUQpEts6YvcHm8L9ZhCv6op1tDv`; rollback `dpl_AMSCqcVVnM9Ww9AgB9Yyy57awpTF`. Actual cloud WebM video/game-audio capture, decoding, HUD/text frames and a 320px iframe were checked. Keep the qualification: samples were roughly 10–15fps, UI decoration is simplified, and no real microphone/Live voice session was recorded. See latest DELIVERY/WORKLOG/FINAL-RECORDING; earlier ending translations and feedback improvements remain intact. Next improvement candidate is still First Contact outcome/retry clarity. Do not repeat this recording implementation as a new slice or claim these test clips replace the existing submission movie.

## Previous checkpoint — ending localization, 17:03 JST

The user-reported untranslated Pact Keeper ending is fixed, together with missing First Contact result text. Current source `fbb416bded2b3ff14eb9f4235ed8762830e5cb8f`, production READY `dpl_AMSCqcVVnM9Ww9AgB9Yyy57awpTF`. Seven synthetic ending displays passed at 390/320px widths, localization suite 7/7, and public bytes match the source build. Rollback `dpl_Euq2ap6rtxtiDDQ2Km9J9bk48Fah`. Earlier feedback branch is already an ancestor. This slice satisfies the 17:00 improvement run; do not redo it. See latest WORKLOG/DELIVERY for exact scope and hashes. The initial preview approval issue was resolved after public-source and destination checks; no deployment blocker remains.

## Next candidates, ranked by player impact

- Combat cue priority/cooldowns/low-hull/localization slice completed at 21:17. Remaining physical-phone readability or parry-feedback checks must be labeled separately from the completed synthetic layout checks.
- Initial missing-consent/local recovery slice completed22:11. Keep truthful fallback labels; only address a concrete remaining submission blocker or regression after22:30.
- End-to-end campaign regression and final submission wording. The current 59-second movie is a separately identified earlier checkpoint; do not claim it shows newly changed screens.

## Iteration 1 — implemented

- Recorded First Contact parley briefing: hull, boss health, actual intercepted bullets and reflected damage.
- Editable, authored tactical prompts selected from recorded outcomes. No extra inference calls and no auto-signing.
- Side-by-side amendment comparison, including removed benefits and the price. Same-rule signing explicitly warns that it still spends the one amendment.
- One-click LOCAL RULES counteroffer before consent, followed by the existing explicit Sign step.
- Japanese localization for the new flow and two previously untranslated authored parley lines.

See [iteration validation](DEADLINE-REVIEW-VALIDATION.md) and the latest WORKLOG entry for source/deployment details.

**Checkpoint at 16:20 JST:** source `33111c45cc56765605d4c2f31b8fc0d02d583f9b` is saved to the default branch and production `dpl_Euq2ap6rtxtiDDQ2Km9J9bk48Fah` is READY. The public response exactly matches the submitted source build. Iteration 1 is complete; the next loop should choose the next concrete improvement rather than redoing this slice. Six hourly resumes (17:00 through 22:00 JST) and a separate 23:00 final audit were successfully scheduled in the originating conversation.

Direct shell git push lacked credentials in this environment. The connected GitHub create-tree/create-commit/non-force update-ref path succeeded. Each created Git tree was checked against the local staged tree hash before moving the branch. Use the connected app for writes if direct push is unavailable; no credential extraction or authentication bypass is needed.

## Deployment and verification notes for resumption

Vercel team `team_RTugcUd6bYZFpvi4A18M9SGY`; existing project `prj_fB5yGJiIy6kdLg29FpHreHmCwMkc`, name `nemesis-pact-live`, Node 22. No Git integration was reported by the project list; a git push alone is not proof of deployment.

The connected `vercel_deploy_to_vercel` action accepts `name`, `project`, `teamId`, `target` (`preview` or `production`) and `files: [{file: relativePath, data: utf8Text}]`. Use current `index.html`, `package.json`, lockfile, `vercel.json`, and JS/MJS/CSS from `src`, `server`, `api`, `tools`. Never include secrets, docs, raw recordings, node_modules, or test fixtures in production. The existing build creates public/index.html and the offline HTML. Poll the returned deployment ID and verify that its project ID matches.

The cloud browser in this iteration could open HTTPS deployments but rejected loopback. The preview-only `tests/covenant-review-fixture.html` can be included as `public/covenant-review-qa.html` in a **preview only**, to inspect 1280×800, 390×844 and 320×568 iframe viewports using the existing opt-in test API. It advances ordinary deterministic simulation inputs; label this accurately, not as real-time human play or a physical phone test. Normal initial navigation/LOCAL RULES/signing was also checked through browser controls.

Use the connected Vercel temporary-share action for protected previews, never disable protection or publish the temporary token. The public production URL stays https://nemesis-pact-live.vercel.app/.

No live inference was needed for iteration 1. Existing application caps stay unchanged (direct OpenAI $10, Gateway $20); do not raise quotas, purchase credit, or claim that these caps prove invoice/grant balances. Retain the current ledger and reserved judging budget. Read FLIGHT-DEBRIEF and OPERATIONS before a paid integration check.
