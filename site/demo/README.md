# Public demo viewer

Canonical source for the [NEMESIS PACT demo page](https://www.circle-hydrangea.net/nemesis-pact-live/). This static page introduces the game without requiring a play session. It contains the latest English full-campaign film, seven actual PC captures, a flight-debrief card, two previously generated concept boards, and the earlier human iPhone archive.

The game remains hosted separately at <https://nemesis-pact-live.vercel.app/>. This directory is not an input to the game build or its Vercel API deployment.

## Publish

Copy `index.html`, `gallery-provenance.json`, and the files in `assets/` into the root of the existing `gh-pages` checkout, retaining `.nojekyll`, `iphone.html`, and both historical posters. Review, commit and push `gh-pages` to the configured origin. Commit this canonical source and the verification record to `ship/living-covenant` as well. No Vercel deployment is needed for a viewer-only update.

The current film, English captions and source ZIP are immutable GitHub Release assets under `media-refresh-20260915-english-demo`. The viewer defers video loading until playback is requested. Below-the-fold images use native lazy loading. Navigation, full-size image links, the evidence disclosure and all copy work without JavaScript.

## Images

`gallery-provenance.json` records source files, recording timestamps, hashes, dimensions and capture conditions. The ten gallery images are losslessly encoded WebP with unchanged RGB pixels and original dimensions. The gameplay frames retain their complete HUD and demo labels. There is no crop, recoloring, compositing, added bullet or invented gameplay.

Five combat frames come from the latest continuous production recording. Three interface screenshots are tracked in `docs/validation-media-refresh-20260915/full-campaign/`, including the completed Luna flight debrief. Concept originals and prompts are tracked in `output/imagegen/`; the viewer labels them as generated concept art.

The latest PC run uses demo autoplay, synthetic English player speech and real GPT-Live-1 / GPT-5.6 Luna. The film preserves the full gameplay view at 90% scale above a separate English caption margin, with its recorded audio. The earlier human iPhone viewer remains linked separately. Image inspection and publication consume no game-model API budget.
