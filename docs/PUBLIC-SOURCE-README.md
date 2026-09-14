# NEMESIS PACT — Living Covenant

[Play the production game](https://nemesis-pact-live.vercel.app).

Ask the Notary for combat terms, interrupt and correct your request, review the displayed clauses, then explicitly **Sign**. Your signed contract changes actual bullet sanctuaries, speed, reflections and their costs. Renegotiate during the fight without resetting health or elapsed combat time. First Contact offers a short boss encounter; the existing six-sector campaign is also preserved.

Voice uses GPT-Live-1 over the official Live API. The separate contract service uses GPT-5.6 Luna through Vercel AI Gateway. Text and voice share validation and explicit signature. Model speech cannot directly change combat. **LOCAL RULES** supports play without a microphone, provider access or network.

## Run and verify

With Node.js22, run `npm ci`, `npm run check`, `npm test`, `npm run build`, then `npm start`. Open the loopback URL printed by the server. The offline `dist/NEMESIS-PACT.html` contains no external assets and cannot call live services.

Live deployment requires server-side credentials and a durable quota store; `.env.example` defaults to disabled live access and kill switches. Never expose credentials in browser code, commits or a generic directory server. Budget reservations, concurrency limits and explicit termination must remain enabled when allowing live access.

Controls: WASD/arrows move; E parries; Space dashes; F uses Nova; R renegotiates. First Contact aims and fires automatically. Touch controls are available. Only the displayed clauses apply after Sign.

## Evidence and provenance

The supplied v0.5.0 ZIP matched all216 imported files; SHA256 `57055F84BC841940BCFC37D580C046656D1A5AE859466CDFBF61901690883DA2`. Existing gameplay, procedural content and six-sector architecture are disclosed as baseline reuse. This release adds actual Live/Luna integration, bounded contracts, quota/security controls, UI refinements and local recording. AI assistance was used for code, debugging, review and documentation.

Actual production API/browser tests and physical iPhone16ProMax human footage demonstrate correction, both signatures, changed combat, renegotiation and boss defeat. The 59-second1080p60 demo preserves original speech and eight chronological cuts. Its source capture averaged34.499 delivered fps; exporting60fps does not add missing motion or establish game FPS. Windows Edge, earlier human Vivaldi and Chrome, and emulated layouts have separate evidence scopes. Additional physical Android/macOS and sustained phone FPS remain unmeasured.

This review archive includes source, tests, standalone build, dependency lockfile and notices. It excludes operational secrets, Git history, raw recordings and private run logs. The archive manifest identifies the source commit. Publication does not assign a new open-source license to project-specific or user-supplied code. See `THIRD_PARTY_NOTICES.md` for dependency and renderer attribution. No new external images, fonts, sampled music or3D models were added.
