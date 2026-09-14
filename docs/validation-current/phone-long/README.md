# Physical iPhone full-sequence recording — 2026-09-15 JST

The user supplied `nemesis-pact-demo-long.webm` and explicitly identified a physical iPhone16ProMax. The first source frame shows Safari selected for screen broadcasting; the browser version is unknown. `source.json` records the preserved input hash,100.611-second decoded duration,3471 frames,497x1080 VP9/Opus and average34.499 delivered fps. This is capture delivery, not an instrumented game-FPS measurement.

One recorded human run shows the following, using the then-production manual-recorder build896f0fe. Approximate timestamps refer to the uncut source:

| Source time | Observed behavior |
|---|---|
|8–10.4s| Player asks to make the left safe. |
|12–22.4s| Notary replies; player says right and permits reinforcements while the UI remains SPEAKING. The recorded voices overlap/interleave around18.2–18.8s. The Notary acknowledges the correction. |
|27–38.5s| Spoken price, corrected OPENAI / gpt-5.6-luna right sanctuary contract, explicit Sign and actual right sanctuary combat. |
|45–49s| Real combat with the signed sanctuary and return fire. |
|55.5–65.3s| Parley reopens during the same fight; player asks to remove the safe zone. |
|67.2–84.4s| Notary replies; OPENAI / gpt-5.6-luna revision2 offers reflected damage x1.8 with reinforcements and no sanctuary. Model latency shown3173ms. Player signs; battle resumes with the changed rules. |
|91.3–100.1s| Final combat and boss defeat. Result:9536 points,1/1 boss,2/2 pacts kept,4 bullets erased,635 damage returned,31 seconds of combat. |

`transcription-run.json` records one actual postprocess `gpt-4o-transcribe-diarize` request:32726ms, both player and Notary recognized, conservative$0.05 charged to the existing verification allocation. This is distinct from the game's GPT-Live-1 and Luna. ASR contains word errors; English captions paraphrase recorded speech and visible canonical clauses. The recording and transcript establish enemy voice presence in this phone source. They do not prove the older desktop source contains enemy sound.

Native Resolve Studio21.1.0.17 uses timeline `ddf8c408-5b47-462f-8fe0-013e77d0e689`, eight chronological cuts at original speed with linked sound. `edit-plan.json`, `native-timeline.json` and `captions.json` retain exact frame ranges. The full-length CFR compatibility file pads one pixel to498x1080; actual shortening and English TextPlus captions are native Resolve edits. No voices, responses or victory footage were substituted. The portrait frame is intact and English text occupies its left margin.

Final local output: `.artifacts/submission/NEMESIS-PACT-iPhone-59s-60fps-en-final.mp4`,55,266,531bytes,SHA256 `2d0b31d936c35638a7227d33fa7418d602cfe42cd1cb8e8bc3dcb8ba82c988aa`. Render `d9af1137-a86c-44cd-b64d-5eeb026113a9` completed in156805ms. All3540 video frames and stereo audio decoded;1920x1080,60fps,59.008-second browser container. English captions at correction, contract, amendment and result were visually inspected. Native Edge153 played through to ended with no page/media errors or external requests. Its4x playback frame drops do not measure source/render FPS. `export/` contains reports and checked frames.

Editable DRP: `.artifacts/submission/resolve/NEMESIS-PACT-iPhone-59s-60fps-en.drp`; retain the full-length phone compatibility MP4 for relinking. English SRT is a separate sidecar. Public viewing is verified at https://www.circle-hydrangea.net/nemesis-pact-live/ . The user approved publication of the existing repository and this final human footage; assets are published on its GitHub Release.

An early1-second Fusion QA render omitted captions because the new composition was not persisted; an explicit native undo transaction committed changed graph inputs. An initial full render was stopped to move the victory caption after the visible defeat. Both diagnostic files are excluded from delivery. `render.json` identifies only the successful final job.
