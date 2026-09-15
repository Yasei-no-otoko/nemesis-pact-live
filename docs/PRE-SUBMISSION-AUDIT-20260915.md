# Pre-submission audit — September 15, 2026, 22:33–22:42 JST

## Outcome and preservation

No submission-blocking defect was found in the checks below. This is a documentation-only checkpoint, not a new game release. Final six-field copy is in [SUBMISSION-FINAL-20260915.md](SUBMISSION-FINAL-20260915.md). No form field, submission, rights confirmation, budget, service agreement, credential, or production alias was changed.

Read the current GOAL, DEADLINE-LOOP, WORKLOG, DELIVERY, SUBMISSION-EN and SUBMISSION-FORM-GUIDE. Fetched the default `ship/living-covenant`; clean local worktree fast-forwarded to **d650d3728a4d3c7655bfed7435c5ce5ad617198d**. The covenant-feedback branch is already an ancestor; no open PR was reported. The new media preparation commit is concurrent work, not an app rollback. Its scripts, Resolve project, viewer, release assets and gh-pages are untouched by this audit. At this checkpoint its own record says capture/edit/publication remain pending. Do not claim a refreshed film has shipped.

## Public game identity

- URL: https://nemesis-pact-live.vercel.app/
- Application source: **795e39efe609fe188646ed354268b560ea432486**.
- Vercel production: **dpl_CPSZWuHrirUtLbpt2hwcArHYbtRU**, rechecked **READY**, alias attached, 12 Node functions.
- Existing project: `prj_fB5yGJiIy6kdLg29FpHreHmCwMkc`.
- Immutable deployment: https://nemesis-pact-live-4o6s3zitb-wildmans-projects.vercel.app/
- Hosted HTML: **639070 bytes**, SHA256 **01c3ead4762f0c97ae8b5602e06fe66cb6f6530bb69f7a91acbcb3982c611340**.
- Offline build: **639020 bytes**, SHA256 **52c05dae35edaa0a9dc51e8b5e7717e6900ee93d8122b2256336b39c95402cbb** (previous release record).

Fresh anonymous HTTP download exactly matches the local hosted build. `git diff 795e39e HEAD -- src index.html api server package.json vercel.json` is empty at inherited d650d37. There is no reason to rebuild, rerun unchanged unit suites, or deploy identical application bytes for this documentation checkpoint. The consent release's 47 affected/client tests, final five copy tests, 58-file syntax check and build are **previous evidence**, not new test executions here.

## Actual anonymous browser checks

Used the provided cloud Chrome browser and ordinary visible controls, without site login, state injection, mocks, iframe simulation or a paid model call.

1. Public game title loads in Japanese. Clicked enemy negotiation. Sign was disabled before a proposal.
2. Clicked the explicit LOCAL RULES action. The page identified no AI inference, revision 1 unsigned, sanctuary/slower bullets plus reinforcement costs, including the laser/body exception.
3. Clicked Sign. Active combat displayed the signed sanctuary, Japanese controls and guidance.
4. Normal simulation reached its automatic parley. The actual result panel showed hull **8/10**, boss HP **52%**, **4 erased bullets**, reflected damage **0**. It remained paused at renegotiation; no new signature or request was forced. A later attempt to press the combat pause button found no match because the game had already entered this parley. This is a test timing issue, not a gameplay freeze.
5. Public repository opened without login; Public label, Sign in link, default branch and latest d650d37 commit were visible.
6. On https://www.circle-hydrangea.net/nemesis-pact-live/, clicked Watch 59s demo, then the native video play control. Read-only media observations progressed from **10.921127** to **50.294941** to **59.008 seconds**, at **playbackRate 1**; final **ended=true, paused=true, readyState=4**, no media error returned.

The returned game error-log sample contained only browser-extension metadata errors; it is not an exhaustive console-history assertion. A playback-quality accessor was not available through the browser inspection surface, so this audit makes no new decoded-frame/dropped-frame measurement or smoothness claim. Playback completion is directly observed; audio quality, human microphone use, physical phones, a full new campaign, and live GPT-Live-1/Luna behavior were not tested here. No new budget consumption by game AI was requested.

## Film provenance and separate refresh

The viewer still references the existing immutable release asset:

https://github.com/Yasei-no-otoko/nemesis-pact-live/releases/download/v1.3.0/NEMESIS-PACT-v1.3.0-59s-60fps-en-final.mp4

This earlier September 15 recording uses app **06275908ab07372c59f5bbcb2033c268322b6771**, not current 795e39e. Its recorded campaign uses fixed automated inputs and synthetic Windows Zira player speech with real GPT-Live-1 replies and Luna processing. Historical evidence reports six signed voice pacts, 18 Luna analyses, 18 encounters/six bosses, 242 kills and 74 parries. These are prior measured results, not this audit's LOCAL RULES session.

[ADAPTIVE-VALIDATION.md](ADAPTIVE-VALIDATION.md) records native Resolve editing, 59-second/3540-frame/1920×1080/60fps export, 59.008-second container and source capture averaging 58.6539 delivered fps. Its published asset hash is **d29667a3d254814a761217ec0319669c88cf1f14075c819f3ddb56f9732dbff1**, 108838606 bytes; this audit did not redownload and rehash the entire movie. Today's later ending, recording, outcome, combat cue and consent fixes are not claimed to appear in this film. Preserve the separate [media refresh](MEDIA-REFRESH-20260915.md); only replace these submission claims after its actual publication and validation.

## Form and final action

The [official form](https://docs.google.com/forms/d/e/1FAIpQLSdvUFtWLVKJOaZrvBN6gOHadhnzSf3SM9FjuE77QiTwiZL9Tw/viewform) was fetched anonymously on September 15. The fresh form content confirms **23:59 JST September 15**, one submission per team representative, required public/by-link video of at most one minute, six text fields each at most 200 words, and demo availability through September 17. This is a read-only HTTP inspection, not a browser submission rehearsal. The web-search fetch route failed; HTTP retrieval succeeded. No form values were entered.

The final copy distinguishes the inherited v0.5.0 engine from later implementation, names AI use, retains source/license disclosures, and separates actual local browser checks from historical Live evidence and pending media work. Word counts checked locally by whitespace splitting each of its six answer bodies: **139 / 160 / 141 / 149 / 151 / 144**, all below 200; headings and instructions are excluded. `git diff --check` passed. This documentation checkpoint is identified by the commit containing this file, avoiding a self-referential commit hash.

**Still required from the representative:** verify team/personal fields, confirm rights and official build-period eligibility, paste six answers and the three links, submit, and save the form's confirmation. Submission status is unconfirmed; public links alone are not an entry. Do not wait for an optional film refresh if it risks the deadline. Retain the currently verified film unless the replacement is actually ready.

## Cutoffs and rollback

No new features or application publication in this audit. Any independently identified blocking code fix must finish and be verified by **23:20 JST**; no additional code publication after **23:30 JST**. Keep links available through September 17.

If an app rollback is genuinely required, the previous verified deployment is **dpl_5aV9W1BJvxT8VG3kb5fweKMKpNnH**. Repoint only the existing project after checking the regression; preserve current environment, credentials, Redis and quota counters. No rollback was performed. Direct OpenAI **$10** and Gateway **$20** application caps remain unchanged; current invoices, grants and infrastructure balances were not reverified. This audit's documents can be reverted in a separate non-destructive commit without changing the application deployment or media assets.
