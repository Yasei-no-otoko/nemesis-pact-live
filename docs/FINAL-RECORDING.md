# Record a complete run, edit the submission to 59 seconds

The user requested manual-duration capture on 2026-09-15: the raw recording may exceed 60 seconds to include the actual boss defeat. The submission is still at most 60 seconds. This overrides the previous forced 60-second capture instructions.

## Capture on the production game

1. Open https://nemesis-pact-live.vercel.app/?demo=1 in desktop Vivaldi, Chrome or Edge. Reload an already open tab to get the manual recorder.
2. Click **Record demo**, choose **this game tab**, and include tab audio. The button counts elapsed time upward. Capture requests 60fps; actual delivered frames depend on the browser and device. Recording continues until **Stop & save** or the browser ends screen sharing; there is no application duration cutoff. Audio uses the game's active microphone, so enable voice through **Start voice**. Recording itself does not open another microphone or call OpenAI.
3. Say “左を安全にして”, then interrupt the Notary's audible reply with “やっぱり右にして。増援は許可する”. Wait for the corrected **OPENAI / gpt-5.6-luna** right-side clauses, review them, then **Sign**.
4. Fight long enough to show the sanctuary erasing actual bullets. Press **R**, start voice again, and say “結界なし。弾を遅く、反射を強く。通常射撃を弱くしていい”. Review the updated contract and **Sign** again.
5. Continue until the boss is defeated. Leave the result visible for a few seconds, then click **Stop & save**. The WebM downloads locally; it is not uploaded. Keep the original file and tell Codex its saved path.

The 45-second GPT-Live-1 connection limit and 90 reserved voice seconds per fight are separate from recording length. Sign still ends the voice session; a second negotiation reconnects through the existing allowance. Longer capture does not extend API sessions, reset combat, increase budgets or automatically start another session. A multi-minute recording needs browser memory; save before closing or refreshing the tab. On an iPhone without browser screen sharing, use the device's screen recorder and supply that original instead.

## Native DaVinci Resolve edit

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

## Remaining delivery work

The user will record again after the manual recorder is published. The new long human source and final edited MP4 are therefore pending. Existing historical videos remain preserved and accurately labeled with their actual models and observed fallback. Public video hosting and source/judge-access decisions remain pending; recording or editing does not itself publish human footage.
