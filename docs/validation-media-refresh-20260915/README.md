# Media refresh validation — September 15, 2026

The second English production attempt is the authoritative campaign capture. It completed six real GPT-Live-1 voice sessions, six signed pacts, 18 GPT-5.6 Luna adaptive reviews, 18 encounters, and six bosses: 242 kills, 80 parries, two damage taken, and 375.07 seconds of combat. The original WebM SHA256 is `87535f9290bd87430f8186ab92741071dad17b9fae1e8d3026467617bc1a735e`.

Attempt 1 is preserved as historical evidence because its strict assertion failed and its bounded run fell back once (17 AI reviews, one local review). Attempt 2 completed all 18 adaptive reviews with real OpenAI responses.

Capture used English UI, fixed demo autoplay, ordinary game timing, original English Windows Zira fixtures, and no score or game-state mutation. Measured budget deltas were $0.60 direct and $0.010435 gateway; these are ledger deltas and do not claim invoice totals.

The accepted native Resolve export has 13 chronological cuts, 59 seconds of video and 3,540 decoded frames at 1920x1080 / 60 fps. Every cut has visible English captions and original synchronized audio: minimum normalized correlation 0.99988, maximum measured lag 1.5 ms. See `film/result.json`, `film/audio-sync.json` and `full-campaign/resolve-edit.json`. Earlier human films and generated concept boards retain their provenance.

`rejected-render-01/` preserves the first uncaptioned export's automated checks. It was rejected during visual inspection and never published. The final MP4 SHA256 is `3ac49985b4d3215a4cf10604c7527b806a13099282b428fd2e2f85ffa1b5a0b0`.

Publication is complete: [viewer](https://www.circle-hydrangea.net/nemesis-pact-live/) and [release](https://github.com/Yasei-no-otoko/nemesis-pact-live/releases/tag/media-refresh-20260915-english-demo). `publication-http.json` records 15 anonymous downloads: 14 exact source-byte matches, plus the HTML whose only difference is a documented host-added analytics tag. `publication-browser.json` records normal-speed, unmuted playback through 59.008 seconds with `ended=true`, no media error and all ten gallery images loaded. `publication-desktop.jpg` shows the completed public player; `publication-gallery-detail.jpg` shows a captured page detail. Browser playback frame drops were not measurable through this control API.
