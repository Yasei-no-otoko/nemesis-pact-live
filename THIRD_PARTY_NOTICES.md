Current v1.1.0: the campaign AI Director uses the same GPT-5.6 Luna Gateway service and existing runtime dependency. No additional third-party package or new project license was added. Historical version sections below retain their own scope.

Current v1.0.0 clarification (2026-09-15): historical version sections below describe their own release only. The hosted game now uses real GPT-Live-1 and GPT-5.6 Luna, as documented in README and current validation. The new `output/imagegen/nemesis-v100-concept.png` was generated with the authenticated built-in imagegen tool and translated to local CSS/geometry; no bitmap is required at runtime. The tool does not expose model/cost. No new third-party runtime library, paid plan or project license was added. v0.9.9 concept provenance also remains in its plan.

> Historical v0.5.0 baseline document, retained verbatim below. For the 2026-09-14 shipping changes, actual Live API use, new runtime dependency and repository/deployment evidence, see [current sources and licenses](docs/SOURCES-AND-LICENSES.md). Statements below about no live inference/deployment apply only to that earlier revision.

# Third-party notices and development-tool disclosure

This file records identifiable formula provenance and tools actually used. It does not assign a new open-source license to project-specific code or certify ownership/timing of all earlier participant materials. The team representative must finalize that declaration for the contest.

## Included formula

The analytic filmic curve in the GLSL/WGSL renderer uses coefficients 2.51, 0.03, 2.43, 0.59 and 0.14 from **Krzysztof Narkowicz, “ACES Filmic Tone Mapping Curve” (2016)**. The author offers the fitted implementation under **CC0 or MIT**. This package records the CC0 option and credits the source. This fitted curve is not a full ACES implementation.

Primary source: https://knarkowicz.wordpress.com/2016/01/06/aces-filmic-tone-mapping-curve/
CC0 reference: https://creativecommons.org/publicdomain/zero/1.0/

## Procedural content

No sampled music, soundfonts, external music files, imported 3D assets, datasets, or third-party JavaScript runtime libraries are in the game distribution. `src/score.js` contains newly authored motif/chord tables and deterministic arrangements created with ChatGPT assistance. `src/audio.js` synthesizes sound using native Web Audio nodes. The separately delivered MP3 is a render of this engine, not a dependency of the game. It was loudness-adjusted for listening.

## Development / verification tools (not redistributed)

| Tool | License / source | Use |
|---|---|---|
| Node.js | MIT; incorporated code has additional notices. https://github.com/nodejs/node/blob/main/LICENSE | Build, tests, local server |
| Python | PSF-2.0, incorporated component notices. https://docs.python.org/3/license.html | Test harness and packaging |
| Playwright for Python | Apache-2.0. https://github.com/microsoft/playwright-python | Browser automation |
| Chromium | BSD-3-Clause plus incorporated licenses. https://chromium.googlesource.com/chromium/src/+/main/LICENSE | Browser/Web Audio/GL validation |
| SwiftShader | Apache-2.0 plus component notices. https://swiftshader.googlesource.com/SwiftShader | Software graphics backend |
| Pillow | MIT-CMU. https://pillow.readthedocs.io/en/stable/about.html | Preview/screenshot handling in the development workflow |
| NumPy | BSD-3-Clause. https://numpy.org/doc/stable/license.html | Audio sample checks and sampler assembly |
| FFmpeg | The installed executable reports GPL-2.0-or-later (`ffmpeg -L`). Generic builds vary; see https://www.ffmpeg.org/legal.html | MP3 preview encoding only; executable/libraries not included |

ChatGPT, optional OpenAI API access, and optional Vercel hosting are services governed by their own terms. Their inclusion in a workflow does not amount to importing an open-source package. No OpenAI SDK is bundled; the existing server uses native HTTP requests. No new live OpenAI call or Vercel deployment was performed for this release.

All notices were checked against primary publisher/repository materials or the installed executable's own license output on 2026-09-13. This is a technical inventory, not a replacement for the representative's rights and build-period review.


## v0.5.0 revision

The new covenant module, UI, mode-specific scenery and gateway were developed in this ChatGPT-assisted revision on top of the disclosed v0.4.1 baseline. No new third-party runtime package, font, imported artwork, dataset, sampled music or model is bundled. GPT-Live-1 is researched but not connected. Current upstream response tests use fixtures, not live inference. Development tools are not redistributed in the HTML or source package. Project-specific code has not been newly relicensed. See docs/PROVENANCE.md.
