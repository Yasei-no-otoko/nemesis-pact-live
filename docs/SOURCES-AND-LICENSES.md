# Sources and licenses

The working baseline is the user-supplied `NEMESIS-PACT-3D-EN-v0.5.0-source.zip`, whose archive root is `NEMESIS-PACT-v0.5.0/`. Existing project code, procedural content, and historical disclosures are preserved. This document does not grant a new license to project-specific or user-supplied code.

The only runtime dependency declared in `package.json` is `@vercel/functions` 3.9.7. Its package-lock entry records Apache-2.0. The lockfile also contains transitive development/tool packages with their upstream declarations, including Apache-2.0, MIT, and ISC components. No OpenAI SDK is bundled; server integrations use native HTTPS requests. Vercel AI Gateway and OpenAI services are external services governed by their own terms.

`THIRD_PARTY_NOTICES.md` records the renderer's ACES fitted curve coefficients from Krzysztof Narkowicz, “ACES Filmic Tone Mapping Curve,” with the documented CC0 option and source link. Native Web Audio synthesizes the soundtrack; no sampled music, fonts, external images, datasets, or imported 3D models are distributed.

Node.js 22 is the declared engine. Python, Playwright, Chromium/Edge, SwiftShader, Pillow, NumPy, and FFmpeg are development or verification tools and are not bundled into the game HTML. Their licenses and source links are recorded in `THIRD_PARTY_NOTICES.md`. The separately rendered MP3 is a preview artifact, not a runtime dependency.

AI assistance was used for implementation, review, debugging, and documentation. The current deployment uses native HTTP calls to `gpt-4.1-mini` through Vercel AI Gateway and `gpt-live-1` for the voice path. The user reported a first real voice contract change and boss defeat; full interruption and public video evidence remain unverified.

The exact input ZIP SHA256 is `57055F84BC841940BCFC37D580C046656D1A5AE859466CDFBF61901690883DA2`; all 216 files matched the imported tree. Source baseline commit is `d31dd00676e3298b2d937ab0dba449dc45a4fa0e`. The historical v0.5.0 documents describe a prior v0.4.1-to-v0.5.0 revision; this shipping task starts at v0.5.0 and records its own commits. FFmpeg from the PyPI imageio-ffmpeg 0.6.0 wheel was used locally to inspect the recorder fixture; no encoder executable is redistributed.
