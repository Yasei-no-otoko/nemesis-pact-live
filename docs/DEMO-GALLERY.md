# Demo page gallery — 2026-09-15

[Public page](https://www.circle-hydrangea.net/nemesis-pact-live/) now explains the game before a visitor starts playing: a final-boss hero image, the speak/sign/build/fight/review loop, upgraded normal waves, boss fights, the 59-second submission film, live contract and performance-review screens, and the two existing concept boards.

## Published material

- Actual upgraded normal waves: Sector 5 Wave 2 (475 s) and Sector 6 Wave 2 (566 s).
- Actual upgraded bosses: The Leviathan (398 s), The Weaver (501 s), The Unwritten (607 s; page hero).
- Actual campaign interfaces: GPT-Live-1 / GPT-5.6 Luna contract and Luna's 0 → +1 difficulty review.
- Existing generated concepts: v0.9.9 and v1.0.0 boards, each labeled as concept art and not gameplay.

All seven PC images come from the verified v1.3.0 production run with fixed demo autoplay and synthetic player speech. They are not represented as human operation. The earlier human iPhone film remains linked separately. The nine images preserve the original full frame and dimensions; lossless WebP encoding was decoded and compared byte-for-byte against source RGB pixels. No crop, color adjustment, retouching, compositing or extra bullets were applied. Total image payload: 5,715,922 bytes. Below-the-fold images load lazily; the video does not download until requested.

## Source and publication

- Canonical source: [site/demo/](../site/demo/README.md).
- Image timestamps, origin and SHA256 hashes: [gallery-provenance.json](../site/demo/gallery-provenance.json).
- Pages branch: `gh-pages`, commit `6a4cb612d3963215ea9b766edd993508e716f4c7`, pushed to `Yasei-no-otoko/nemesis-pact-live`.
- GitHub Pages build reported `built` for that commit at 2026-09-15 04:55:28 UTC.
- Development checkpoint: `ship/living-covenant`, tag `milestone-28-demo-gallery` (source and evidence committed together).
- Application source remains `06275908ab07372c59f5bbcb2033c268322b6771`; no game or API deployment was needed. The immutable v1.3.0 film and source ZIP are unchanged.

## Browser verification

Local and published pages passed in native Windows Edge 153.0.4234.32 at 1440×900, 1280×720, 768×1024, 430×932 and 320×568. Mobile widths are browser emulation, not a new physical-device trial. All nine images load with the correct dimensions, no horizontal overflow, working section anchors, a keyboard skip link and full-size image opening. The page and evidence disclosure also work with JavaScript disabled.

The public page starts the existing 1920×1080 video, reports its 59.008-second duration and no media error. The entire unchanged film was already verified in the v1.3.0 release audit; this update retested playback start. The archived iPhone page returns HTTP 200. All nine published image bodies return HTTP 200 and match the local SHA256 hashes. Browsing the page makes no game API requests and does not fetch the MP4 before playback.

The custom-domain edge adds a Cloudflare analytics beacon. The existing strict CSP blocks that injected script; the browser's console message is retained separately in the report. No allowance for third-party analytics was added. No application page errors or failed image responses occurred. The optional urllib probe received HTTP 403; actual browser navigation, media playback and browser-context image retrieval succeeded.

Initial verification adjustments were limited to the harness: the CLI exited with a Windows libuv assertion, so the established native Edge/Python Playwright route was used; the first local check caught the missing favicon, which was added; the public video wait was rewritten as a function to comply with CSP rather than evaluating a string. All final checks are preserved in [public result](validation-gallery/public-result.json) and [local result](validation-gallery/local-result.json).

Reviewed screenshots: [PC waves](validation-gallery/desktop-waves.png), [mobile waves](validation-gallery/mobile-waves.png), [concept boards](validation-gallery/concepts.png), [public video playback](validation-gallery/video-playing.png).

## Cost and rollback

This gallery update made zero paid model calls and no Vercel deployment. Last project ledger from the preceding completed release audit (2026-09-15 04:37:44 UTC): direct OpenAI $3/$10 and Gateway $0.042359/$20. Those are a dated snapshot, not a new account balance measurement.

To revert the viewer, run `git revert 6a4cb612d3963215ea9b766edd993508e716f4c7` on `gh-pages` and push `origin gh-pages`. This restores the preceding viewer without rewriting branch history or altering the production game, release assets, previous iPhone film or API quotas. No pending gallery work remains after the published checks.
