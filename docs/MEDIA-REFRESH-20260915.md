# English media refresh — September 15, 2026

## Target

Repeat the previous complete six-sector production campaign in English, edit a new 59-second film in native DaVinci Resolve, and replace the public viewer's gameplay screenshots and media links.

The verified production source is `795e39efe609fe188646ed354268b560ea432486`, served by `dpl_CPSZWuHrirUtLbpt2hwcArHYbtRU`. The local documentation checkpoint is `47d46f19389b3044c89b2ed398a5853b0f825267`. Public HTML SHA256: `01c3ead4762f0c97ae8b5602e06fe66cb6f6530bb69f7a91acbcb3982c611340`. The current local build matches after normalizing Windows line endings.

## Capture and editing

- Reuse the existing fixed demo autopilot and original English Windows speech fixtures with real production GPT-Live-1 / GPT-5.6 Luna responses.
- Keep one continuous run, ordinary game timing, actual damage, earned upgrades, signed pacts and victory. Record the new flight debrief after completion.
- Capture the full browser tab at 1920×1080. Preserve the original WebM and measure actual delivered frames. A full-length CFR60 copy is only an import intermediate; all editorial cuts happen in Resolve.
- Retain the previous project and its six timelines. The new working timeline is **SUBMISSION - Latest English campaign - 59s 60fps - 20260915**, ID `bba22e25-b110-4f09-a9ae-8da4f1efbd8f`, copied from the empty 60fps template. Resolve saved and exported a backup before this addition.
- Keep English captions, readable speech and contract reviews, original synchronized audio, six-sector highlights and the real ending.

This is an automated desktop demonstration with synthetic player speech. It is not a new human microphone or physical phone recording. The earlier human iPhone film and generated concept boards retain their own provenance.

## Capture evidence

The second bounded production attempt completed successfully in English: six real GPT-Live-1 voice sessions, six signed boss pacts, 18 GPT-5.6 Luna adaptive reviews, 18 encounters, six bosses, 242 kills, 80 parries, two damage taken, and 375.07 seconds of combat. The raw WebM capture SHA256 is `87535f9290bd87430f8186ab92741071dad17b9fae1e8d3026467617bc1a735e`; it is not the JSON report hash. Attempt 1 is preserved separately; its strict assertion failure and legitimate 17 AI / 1 local fallback result remain historical evidence. The second run is the authoritative full-playthrough record.

The run used fixed demo autoplay, ordinary game timing, original English Microsoft Zira fixtures, and no score or game-state mutation. Budget ledger direct delta was $0.60 and gateway delta was $0.010435; these are measured deltas, not invoice claims. Private voice session IDs remain in the unique ignored work file.

The accepted native Resolve film has 13 chronological, normal-speed cuts: 59 seconds of video, 1920x1080 and 3,540 fixed-60fps frames. All frames decode, all 13 English caption samples pass visual inspection, and every original-audio comparison passes (minimum correlation 0.99988; maximum lag 1.5 ms). Local Chrome playback reached `ended` at 59.008 seconds, unmuted and at normal speed. MP4 SHA256: `3ac49985b4d3215a4cf10604c7527b806a13099282b428fd2e2f85ffa1b5a0b0`.

The original WebM contains 35,532 frames, with its last timestamp at 639.845 seconds and 55.5306 delivered fps on average. It has 32 gaps over 50 ms, the largest 1.398 seconds. The full-length compatibility copy duplicates missing frames for CFR60 import; it creates no new motion. The film preserves the complete game view at 90% scale above the English caption margin.

The first native export passed decode/audio checks but lacked the saved captions. It was rejected during visual inspection and never published. Its file and checks remain in `rejected-render-01/`; activating and refreshing each Fusion composition fixed the final render. The six original timelines and a project backup are preserved. Final editable project: `.artifacts/media-refresh-20260915/resolve/NEMESIS-PACT-latest-English-59s-final.drp`.

## Publication and validation

The [public viewer](https://www.circle-hydrangea.net/nemesis-pact-live/) now serves the new film and eight refreshed gameplay/interface screenshots, including the completed Luna flight debrief. The two concept boards and earlier human iPhone film retain their original provenance. Canonical source is `site/demo/`; Pages commit `ddd1d26aaa2a58548cc8d7acd9da547ae83d0adf` was pushed and its deployment completed successfully.

The [immutable media release](https://github.com/Yasei-no-otoko/nemesis-pact-live/releases/tag/media-refresh-20260915-english-demo) contains the accepted MP4, English SRT and a source ZIP built from deployed game commit `795e39e`. The release tag points to media/source checkpoint `d31939b`; the ZIP manifest identifies the separately preserved deployed game source. Source ZIP SHA256: `fad9d0c18dfc65278ac5809f694327174301d067f348fe7cdc1355091abf6278`.

Anonymous HTTP verification checked 15 URLs. All ten images, the provenance JSON and three release assets match their source bytes exactly. The custom-domain host adds one Cloudflare analytics script to the HTML; the remaining HTML matches the committed page exactly. Both the received HTML hash and the added script hash are recorded. Windows checkout line endings are checked against committed Git bytes. See [publication-http.json](validation-media-refresh-20260915/publication-http.json).

Actual public Chrome playback, started through the native video control, reached `ended=true` at 59.008 seconds, unmuted at rate 1, with no media error. All ten gallery images loaded at their original dimensions, with no horizontal page overflow in the observed desktop viewport. The browser did not expose frame-drop counters; the 3,540-frame decode proof describes the encoded file. See [browser observations](validation-media-refresh-20260915/publication-browser.json) and [public player screenshot](validation-media-refresh-20260915/publication-desktop.jpg).

The [Vercel game](https://nemesis-pact-live.vercel.app/) still matches the captured production HTML hash. This media publication required no new game deployment. Capture, native export, English captions, original audio, public playback and delivered assets are verified. Previous films, raw recordings and Resolve project backups remain preserved locally. To roll back the viewer, revert the Pages publication commit and deploy the reverted branch; the earlier release assets remain available.
