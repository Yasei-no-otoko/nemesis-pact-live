# Record a complete run, edit the submission to 59 seconds

> **Current cloud recording workflow — 2026-09-15:** Open `https://nemesis-pact-live.vercel.app/?demo=1` and keep **Game recording · no screen sharing** selected. Click **Record demo**, play normally, then **Stop & save**. This uses the game's own composed canvas via `captureStream(60)`, not `getDisplayMedia`. It captures the 3D canvas, 2D effects, current visible UI text/controls, and the existing local audio mix. UI shadows, pseudo-elements, filters and exact CSS gradients are simplified; DOM text is sampled at up to 10 Hz. Requested 60 fps is not a guarantee: this cloud test delivered approximately 10–15 video frames per second. Do not label it a 60fps human/live-AI submission recording. Recording controls occupy a separate 128px strip only with `?demo=1`. The download link remains available after saving, until the next save or page closure.
>
> **Tab recording** remains available for native browser styling, with an explicit browser share prompt. The recorder offers cancellation and a 20-second start timeout with guidance to switch to Game recording. It does not bypass or auto-accept the browser permission dialog. The timeout was observed in the cloud browser; immediate cancellation and late-stream cleanup are covered by lifecycle unit tests. Active microphone/remote streams are mixed only if already connected through the normal voice flow; recording does not request a microphone, start a model, sign a contract or upload video.
>
> Validation: actual browser clicks recorded LOCAL RULES negotiation → explicit Sign → combat and successfully saved VP9/Opus WebM; the file fully decoded and contained game audio. Subsequent capture verified HUD and legible primary buttons. A 320px iframe also recorded and saved, with a visible re-download link; it is not an iPhone test. The cloud browser's download-event waiter timed out even though files appeared in its synchronized download directory and decoded correctly. Node 22 affected suite passed 24/24 before the final download-link addition; final affected suite also passed 24/24 with Node 24, syntax 58/58 and build passed. No new live voice/model calls. [Canvas capture API](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/captureStream), [screen-sharing permission model](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia).


The user requested manual-duration capture on 2026-09-15: the raw recording may exceed 60 seconds to include the actual boss defeat. The submission is still at most 60 seconds. This overrides the previous forced 60-second capture instructions.

## Capture on the production game

1. Open https://nemesis-pact-live.vercel.app/?demo=1 in desktop Vivaldi, Chrome or Edge. Reload an already open tab to get the manual recorder.
2. Click **Record demo**, choose **this game tab**, with video sharing. Game, active microphone and enemy audio are mixed directly; tab audio is not requested. The button counts elapsed time upward. Capture requests 60fps; actual delivered frames depend on the browser and device. Recording continues until **Stop & save** or the browser ends screen sharing; there is no application duration cutoff. Audio uses the game's active microphone, so enable voice through **Start voice**. Recording itself does not open another microphone or call OpenAI.
3. Say “左を安全にして”, then interrupt the Notary's audible reply with “やっぱり右にして。増援は許可する”. Wait for the corrected **OPENAI / gpt-5.6-luna** right-side clauses, review them, then **Sign**.
4. Fight long enough to show the sanctuary erasing actual bullets. Press **R**, start voice again, and say “結界なし。弾を遅く、反射を強く。通常射撃を弱くしていい”. Review the updated contract and **Sign** again.
5. Continue until the boss is defeated. Leave the result visible for a few seconds, then click **Stop & save**. The WebM downloads locally; it is not uploaded. Keep the original file and tell Codex its saved path.

The 45-second GPT-Live-1 connection limit and 90 reserved voice seconds per fight are separate from recording length. Sign still ends the voice session; a second negotiation reconnects through the existing allowance. Longer capture does not extend API sessions, reset combat, increase budgets or automatically start another session. A multi-minute recording needs browser memory; save before closing or refreshing the tab. On an iPhone without browser screen sharing, use the device's screen recorder and supply that original instead.

## Native DaVinci Resolve setup and editing workflow

Resolve Studio **21.1.0.17** was connected through its native MCP. The new project **NEMESIS PACT - Submission 20260915** contains the empty timeline **Submission - 59s edit - awaiting capture**, 1920x1080 at **60fps** (explicit custom timeline settings). Its seven section markers end at 59 seconds. The project is saved and exported to `.artifacts/submission/resolve/NEMESIS-PACT-59s-template.drp`. This is an editing template, not a completed submission video.

| Target edit time | Keep from the real recording |
|---|---|
| 0–3s | Game identity / first request |
| 3–15s | Audible enemy reply, human interruption and correction |
| 15–23s | Corrected OPENAI clauses and explicit Sign |
| 23–30s | Actual changed combat and sanctuary effect |
| 30–43s | R, spoken amendment, new clauses and Sign 2 |
| 43–55s | Late combat and actual boss defeat |
| 55–59s | Result and playable URL |

These are editable allocations, not required performance timings. Preserve the source file. Inspect its duration, variable frame rate, resolution and audio first. If WebM needs compatibility conversion, create a full-length constant-frame-rate intermediate with synchronized audio; perform the actual cuts in Resolve. Import the recording, duplicate the template into a named working timeline, select source ranges in chronological order and append with linked audio. Keep speech and both contract reviews readable at normal speed; shorten setup, waits and uneventful combat using clear cuts. Do not synthesize responses, hide LOCAL RULES, or combine different attempts into an apparently single successful run.

After picture editing, create English captions from the recorded speech and visible clauses. Review text, cut boundaries, audio synchronization and the actual ending. Use a 59-second target (3540 frames at 60fps), leaving a one-second margin below the submission limit. Save the editable project and export H.264/AAC MP4 at 1080p/60fps, starting only the render job created for this edit. Verify Resolve reports Complete and that the output decodes, has audio, and lasts no more than 60 seconds.

## Earlier desktop recording and local edit

The new 119.65-second `nemesis-pact-demo (3).webm` was received after deployment. Its seven chronological source ranges are 12–28, 35–44, 54–59, 59–70, 75–78, 85–89 and 104–115 seconds. The native timeline **SUBMISSION - human full sequence - 59s 60fps v1** contains 3540 frames at 60fps, with linked original audio and native Fusion TextPlus English captions. The complete play shows correction, both signatures, changed combat, renegotiation and actual boss defeat.

Local output: `.artifacts/submission/NEMESIS-PACT-human-59s-60fps-en_V1-0001.mp4`. Resolve rendered H.264/AAC at 1920x1080, fixed 60fps; the 59.01-second container decodes all 3540 video frames and audio without error. The raw recording averages 58.688 delivered frames per second; conversion to CFR does not create missing source motion. The editable project is `.artifacts/submission/resolve/NEMESIS-PACT-human-59s-60fps-en.drp`; retain its full-length compatibility MP4 for media relinking. At that stage the Resolve selection was the desktop timeline; the latest selected timeline is the phone edit below. Captions also have a separate `NEMESIS-PACT-human-59s-60fps-en.srt` sidecar.

Evidence and hashes: `validation-current/human-long/`. Public hosting and source/judge access remain pending. Recorded Notary audio also needs human confirmation: transcription detected only the player's speech, which is not sufficient to prove that enemy audio is missing. The local review copy retains original audio; no reply was synthesized or substituted. Recording/editing does not itself publish human footage. Earlier source videos and the synthetic QA are preserved separately.

Runtime import note: on this Resolve21.1 host, `ImportMedia([absolute_path])` accepted the H.264/AAC compatibility MP4; the structured FilePath-list form returned an empty list for that same video, and direct WebM also returned an empty list. Actual AppendToTimeline duration matched `endFrame - startFrame` on the QA media; verify the real imported source ranges and item durations rather than assuming an inclusive end. The compatibility transcode retains the full source duration; shortening happens only in Resolve.


## Verified editing/export path

The synthetic recorder QA file was imported through a full-length H.264/AAC compatibility copy and cut in native Resolve from 66.35 seconds to 58 seconds. Its two video sections retain linked audio. The separate QA timeline rendered successfully using H.264 AMD / AAC: 1920x1080, constant 60fps, 3480 decoded video frames, 58.01-second container duration, non-silent stereo audio. The cut and ending were visually checked. This is plumbing verification using synthetic content, not the human submission.

The saved editable project, including the empty human template and clearly named QA timeline, is exported as `.artifacts/submission/resolve/NEMESIS-PACT-60fps-edit-kit.drp`. This earlier QA export predates the human edit; the current selection is now the final human timeline. Media stays local; DRP exports reference their original media paths. Numeric/string VideoQuality overrides and ReplaceExistingFilesInPlace=false were rejected by this runtime; the QA used the current AMD quality setting and a verified new unique filename. Recheck the final human export's quality and filename in Resolve before rendering.


## Latest physical iPhone edit

The new `nemesis-pact-demo-long.webm` is100.611 seconds from a user-confirmed physical iPhone16ProMax. Safari is visible in the source broadcast selector; version unknown. Both player and Notary speech are present. Unlike the older desktop audio-review question, this phone run has recorded evidence for both voices, corrected OPENAI Luna right Sign, real sanctuary combat, spoken sanctuary removal, OPENAI Sign2 and boss defeat.

Native Resolve timeline **SUBMISSION - iPhone full sequence -59s60fps v1**, ID `ddf8c408-5b47-462f-8fe0-013e77d0e689`, uses8 chronological source ranges:8–22.4,27–38.5,45–49,55.5–58.8,62–65.3,67.2–78.5,82–84.4,91.3–100.1 seconds. Original speed and linked audio are preserved. English TextPlus captions occupy the margin beside the complete portrait image. The source averages34.499 delivered fps; full-length CFR conversion duplicates frames without invented motion.

Verified final MP4: `.artifacts/submission/NEMESIS-PACT-iPhone-59s-60fps-en-final.mp4`,55,266,531bytes,3540 frames,1920x1080,60fps,59.008-second browser duration. Native render completed and full decode passed. Final correction, contract, amendment and victory captions were visually checked; Edge playback ended without page/media errors. The original voices remain intact. See `validation-current/phone-long/` for hashes, timeline, cuts and reports.

Editable project: `.artifacts/submission/resolve/NEMESIS-PACT-iPhone-59s-60fps-en.drp`; relink `.artifacts/submission/resolve/NEMESIS-PACT-phone-full-60fps.mp4` if needed. SRT: `.artifacts/submission/NEMESIS-PACT-iPhone-59s-60fps-en.srt`. Local review: `.artifacts/submission/iphone.html`. The development copy and previous desktop edit remain preserved. The final video is now public at https://www.circle-hydrangea.net/nemesis-pact-live/ with downloadable MP4/SRT/source ZIP at https://github.com/Yasei-no-otoko/nemesis-pact-live/releases/tag/milestone-16-iphone-demo-audio. Native anonymous Edge verified full remote1x playback and matching source-ZIP download. Earlier pending-public statements above describe the prior desktop stage.
