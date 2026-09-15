# Sources and licenses

The working baseline is the user-supplied `NEMESIS-PACT-3D-EN-v0.5.0-source.zip`, whose archive root is `NEMESIS-PACT-v0.5.0/`. Existing project code, procedural content, and historical disclosures are preserved. This document does not grant a new license to project-specific or user-supplied code.

The participant clarified on 2026-09-15 that GPT-6 Astra conceived the project from its initial game concept and design, and ChatGPT 6 Pro generated the v0.5.0 source archive during the contest. No project code predates the contest. The supplied archive is an intermediate checkpoint of this entry. Earlier references to existing or baseline project code refer to that development sequence. Third-party components and tools are listed separately below.

The only runtime dependency declared in `package.json` is `@vercel/functions` 3.9.7. Its package-lock entry records Apache-2.0. The lockfile also contains transitive development/tool packages with their upstream declarations, including Apache-2.0, MIT, and ISC components. No OpenAI SDK is bundled; server integrations use native HTTPS requests. Vercel AI Gateway and OpenAI services are external services governed by their own terms.

`THIRD_PARTY_NOTICES.md` records the renderer's ACES fitted curve coefficients from Krzysztof Narkowicz, “ACES Filmic Tone Mapping Curve,” with the documented CC0 option and source link. Native Web Audio synthesizes the soundtrack; no sampled music, fonts, external images, datasets, or imported 3D models are distributed.

Node.js 22 is the declared engine. Python, Playwright, Chromium/Edge, SwiftShader, Pillow, NumPy, and FFmpeg are development or verification tools and are not bundled into the game HTML. Their licenses and source links are recorded in `THIRD_PARTY_NOTICES.md`. The separately rendered MP3 is a preview artifact, not a runtime dependency.

AI assistance was used for implementation, review, debugging, and documentation. The current deployment uses native HTTP calls to `gpt-5.6-luna` through Vercel AI Gateway and `gpt-live-1` for voice. Their combined production correction/sign/amendment path is verified with explicitly synthetic input. Earlier human recordings used gpt-4.1-mini; desktop footage proves spoken amendment and iPhone footage proves interruption with a corrected LOCAL RULES fallback. The user separately reported corrected OPENAI Sign success in Windows Vivaldi. A newer physical iPhone16ProMax human run records both voices, corrected OPENAI Luna right Sign, sanctuary combat, spoken no-sanctuary amendment, OPENAI Sign2 and boss victory. Its native Resolve59s1080p60 English-captioned export is verified locally; the public viewing page and source repository are now accessible anonymously. Eight chronological cuts preserve original sound. One separate postprocess gpt-4o-transcribe-diarize request assists caption review; no voice response is fabricated.

The exact input ZIP SHA256 is `57055F84BC841940BCFC37D580C046656D1A5AE859466CDFBF61901690883DA2`; all 216 files matched the imported tree. Source baseline commit is `d31dd00676e3298b2d937ab0dba449dc45a4fa0e`. The historical v0.5.0 documents describe a prior v0.4.1-to-v0.5.0 revision; this shipping task starts at v0.5.0 and records its own commits. FFmpeg from the PyPI imageio-ffmpeg 0.6.0 wheel was used locally to inspect the recorder fixture; no encoder executable is redistributed.


Public delivery was explicitly authorized by the user for the existing repository. The final physical iPhone demo is hosted on GitHub Release, with a GitHub Pages viewer at https://www.circle-hydrangea.net/nemesis-pact-live/. The reviewed source ZIP includes no Git history or operational secrets; the separate public repository includes its existing development history. No new license has been assigned.


## v0.9.9 concept and craft pass — 2026-09-15 JST

One built-in OpenAI imagegen concept board was generated from the project's existing mechanics and an authored art brief, at the user's request. The board and brief are in output/imagegen. Its underlying model/cost is not reported by that tool. The proposed direct-key CLI was rejected before execution; no direct image API call is claimed.

The generated bitmap is development art direction, excluded from Vercel/runtime by .vercelignore. CSS, thin-ring meshes, geometric Notary and Canvas2D fallback translate its visual language into the game. The concept's fictional clauses are not added to the contract schema. No imported font, 3D asset, sampled music or runtime dependency was added. No new license is assigned to project-specific code or the generated concept. Existing human video remains unchanged and correctly labeled as earlier-build footage.


## v1.3.0 automated film

The new campaign recording uses locally synthesized Microsoft Zira player speech as input to actual GPT-Live-1, with six real signed Luna pacts and18analyses. It is explicitly labeled automated, not a new human recording. Native Resolve cut13normal-speed segments and overlaid English editorial captions; actual game/Live audio is retained. FFmpeg made a full-length60fps compatibility copy and verified media. No voice model impersonation or fabricated API response is used. Source footage, native project and evidence hashes are retained locally. The earlier human iPhone movie remains available as historical evidence.

## Creator-reported mobile campaign completion — 2026-09-15

The creator additionally confirmed personally clearing the full six-sector campaign in mobile mode on an iPhone 16 Pro Max. This participant-reported completion supplements the recorded First Contact victory described above.
