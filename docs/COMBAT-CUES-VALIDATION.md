# First Contact combat cues — 2026-09-15

## Scope

Inherits `b36cb650fd9742e29430c2366a6ab108105d9fb2` from the default `ship/living-covenant`. Clean worktree, no open PR, no newer deployment or active concurrent changes were found. `improve/deadline-covenant-feedback` is already an ancestor; recording, ending localization and revision impact remain intact.

One pure cue selector now prioritizes lasers over onboarding, low hull and nova. Desktop and touch instructions respect dash/parry cooldowns. At two hull or less, guidance offers a ready nova, a ready parry, or movement. All cue copy has Japanese translations. Canvas intent text uses the same dash readiness and sits below the boss, avoiding its HP bar. Critical touch colors apply only to First Contact. No simulation balance, AI provider, consent/signature, six-sector or budget configuration changed.

## Verification

- Affected Node suite: 19/19. Final full suite: 316/316 on Node v24.19.0; syntax: 58 files; build succeeded. Vercel uses the existing Node 22 runtime and built all 12 functions successfully.
- New tests cover priority, active laser vs intent, exact cooldown/energy boundaries, critical hull, absent/broken sanctuary, nonmutation, and EN/JA coverage of all returned cue strings.
- Preview `dpl_HJYBb6s7jpdHHDhDh1He7VdzCBuH`: actual browser, explicitly synthetic frozen combat fixture. All six scenes inspected at 390×844 and 320×568 iframe sizes. No body or hint horizontal overflow. Found and corrected desktop warning/HP-bar overlap.
- Final preview `dpl_EXjLs9wNnvDCtJbTVaqGgXb5eTKL`: READY. Actual browser screenshot verifies the Japanese laser warning below the boss, clear of the HP bar at 1280×800. Rechecked low-hull cooldown guidance at 320×568 in Japanese and English.
- These fixtures exercise presentation in a real browser but are NOT physical-phone, human-play, live-AI or real combat recordings. No paid model/microphone calls were made in this iteration. Existing recording samples remain roughly 10–15fps, not a verified 60fps.

Hosted build SHA256: `0f97c15e956084c04e6090a0c7d09c814248de3f92173cb50ba95369e48d73bb` (638415 bytes). Offline build: `71e0d29e9df56acf3cc46af680724ca172938c4a3eb6e82bd612ba0476682df7` (638365 bytes).

Production verification and source commit are recorded in the latest DELIVERY/WORKLOG entry after release. The preview fixture is excluded from the production manifest. Rollback target: `dpl_jjZJRD4fv99WWvDwxGTmYS2b4SHu`; preserve existing quotas, environment and Redis data.

## Remaining

Check initial voice/text consent/fallback clarity and submission readiness next. Do not redo the completed cue or recording slice. Existing [submission copy](SUBMISSION-EN.md), [recording workflow](FINAL-RECORDING.md), game https://nemesis-pact-live.vercel.app/ and existing movie viewer https://www.circle-hydrangea.net/nemesis-pact-live/ remain the handoff materials. No form submission or legal attestation was performed.
