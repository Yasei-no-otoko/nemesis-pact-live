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

## Next candidates, ranked by player impact

- First Contact ending/retry: make the player's changed terms and resulting play style the memorable conclusion. Any comparison must use actual recorded effects, with no invented avoided damage or AI actions.
- Combat readability: verify laser warnings, parry feedback, low-health guidance, touch controls and critical text at small sizes. Keep guidance short and avoid covering bullets.
- Initial voice/text flow: reduce confusion when consent is not yet given, audio is unavailable, or a request falls back to local rules. Never label the fallback as live AI.
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
