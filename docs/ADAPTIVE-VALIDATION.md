# v1.3.0 adaptive campaign — production validation

App `06275908ab07372c59f5bbcb2033c268322b6771` is deployed at [production](https://nemesis-pact-live.vercel.app/) as READY `dpl_f3q3Af5zwDQ2WvvhA4zuahkfhpCH`. Hosted HTML is 480961 bytes, SHA256 `ee796c06abf681d2fb6735ad4f707e8c6d452b0158bd85ac72db7037199e0166`, exactly matching the local build. Runtime code did not change during recording or editing.

## Actual full campaign

Fresh native Windows Edge 153.0.4234.32, RX6900XT, WebGPU compute, 1920x1080, headless browser with ordinary requestAnimationFrame. Fixed demo steering supplied real game inputs. Original Microsoft Zira synthetic player speech entered actual GPT-Live-1 over WebRTC. No mocked model response, test-only game hooks, accelerated clock, invulnerability, HP edits or forced victory were used.

One production run cleared all **18 encounters and6 bosses**, with **6 signed voice pacts and18 successful Luna performance analyses**. Battle time371.31seconds,242 eliminations,74 reflections,33 grazes,2 hull damage,score104920. Its score/discoveries were excluded from personal records. The scripted route, seed and Story/Bastion difficulty are preserved in the raw run report; this single run is not a general balance study.

The first synthetic request asked for slow bullets, then interrupted audible enemy output to request stronger reflections with weaker normal shots. Remote RMS at interruption0.02163. The revised validated offer was mirror, applied only by Sign. Seven proposal HTTP requests were initiated; one superseded request was intentionally aborted by the client. Six completed signed proposals and all18 analysis results were OpenAI. A client abort does not prove upstream work or billing stopped.

Live connection1,453–2,266ms; signed contract generation1,817–2,539ms; adaptive analysis1,952–3,494ms,median2,137.5ms. Pressure moved0→1→2, then stayed within its cap. Level2 means bullet speed116% and formation arrival spacing84% of the selected authored difficulty. Hull, run time, upgrades and signed pact effects were retained. All6 microphone tracks ended and peers closed; Redis confirms all6 server voice sessions stopped. Zero page errors. [Full evidence](validation-adaptive/full-campaign/result.json), [summary](validation-adaptive/full-campaign/summary.json).

## Regression and control boundaries

279/279 unit tests passed in24,601ms;49 syntax files passed and hosted/offline builds completed. Tests cover canonical disabled-run equivalence, wave/whole-sector aggregation before healing, stale and duplicate requests, request-digest binding, one-step caps, unknown-cost reservation retention, explicit application boundaries, and real new-bullet/formation effects. Three real Redis scenarios passed. Four layout sizes1440x900,1280x720,430x932,320x568 passed in native Edge; smaller sizes are emulation, not physical phones. Three controlled Node autoplay simulations cleared the campaign. The provided web-game skill helper and actual canvas screenshots were inspected. [Implementation and controls](ADAPTIVE-DIFFICULTY.md).

## Actual edited film

The original local WebM is627.152seconds,654,268,084bytes,SHA256 `2348431895c028265c0f3164baee0bd358ee06835ea827af0edcd4c6cb506e47`. Capture requested60fps at1920x1080. Full decoding found36,785 frames,average58.6539 delivered fps; game-screen intervals averaged58.9146. Ten source gaps exceeded50ms,maximum1.376seconds. These are capture delivery measurements, not GPU presentation-rate guarantees.

Full-length H264/AAC CFR60 compatibility conversion duplicated missing source frames; it added no motion or dialogue. Native DaVinci Resolve Studio21.1 created a new timeline,13 chronological normal-speed cuts,13 linked original-audio ranges and13 Fusion TextPlus captions. Existing five timelines were preserved. Result: **59seconds /3,540frames /1920x1080 /60fps**, stereo48kHz AAC,108,838,606bytes,SHA256 `d29667a3d254814a761217ec0319669c88cf1f14075c819f3ddb56f9732dbff1`. All frames decoded at exact60fps timestamps; audio duration59.008seconds,RMS0.0470,peak0.6634,no full-scale samples. All13 caption layouts inspected. No post-produced AI answers, victory or sound replacement. [Edit plan](validation-adaptive/full-campaign/edit-plan.json), [native project evidence](validation-adaptive/full-campaign/resolve-final.json), [media QA](validation-adaptive/full-campaign/film/result.json).

Resolve stalled when custom settings and frame rate were changed in one operation. The just-saved project DB was copied before restarting only Resolve; changing the settings separately succeeded. This runtime required exclusive AppendToTimeline endFrame values to obtain the requested durations; all clip lengths, boundaries and linked audio ranges were re-read and verified. The native AMD exporter rejected quality/overwrite setting keys; its existing quality preset produced the inspected file. Original footage and a native DRP remain local.

## Spend and rollback

At 2026-09-15T04:11:42.272Z, conservative ledger totals were **direct OpenAI$3.000000/$10** and **Gateway$0.042359/$20**; this goal added$0.300000 and$0.005021. Active reservations0;kill switch unset. No plan, paid contract, auto-charge or unrelated project changed. The session request cap increased12→48 to cover18 analyses,6 voice sessions and contracts; global budgets and concurrency remain enforced. Exact grant-specific Vercel balance/expiry, provider invoices and infrastructure charges remain unknown. App accounting does not guarantee the claimed$30 grant covers all charges.

Rollback: `vercel rollback dpl_5HEfvWCWhNzwstCDpK4qk3RuUaB9 --yes --scope wildmans-projects`; source tagv1.2.0. Preserve quotas, keys and media. Keep public delivery accessible through September17. Six English submission fields remain below200words; representative information remains only in the ignored kit. Form submission was not performed.


## Final public delivery

[v1.3.0 Release](https://github.com/Yasei-no-otoko/nemesis-pact-live/releases/tag/v1.3.0) is public with the source ZIP,59s MP4 and matching English caption sidecar. Fresh anonymous Edge downloaded all34,220,352source ZIP bytes and108,838,606MP4 bytes; both SHA256 hashes match. The viewer played the complete59.008seconds at rate1,reported ended=true,3,540decoded video frames and zero media/page errors. Its automated browser reported201dropped playback frames; this is distinct from source capture drops and the verified60fps encoded file. No smooth-playback guarantee on every device is implied. The earlier human iPhone viewer returned200 and retains its original film. gh-pages`03f778c5b091aa55376cc05780265165f59995a4` is pushed.

All13native audio cuts correlate with the same source intervals above0.9998,with measured offset no greater than2ms at8kHz analysis. Local full decode and caption layout review passed. Source package258files,SHA256`fefb70632fdd8cf57d625db9ae34a016814e6361849b265912e436020ea30db1`,archivecommit`4e39e84bbe6898806e4ca7038ef99bb970287eb1`. Application source remains`06275908ab07372c59f5bbcb2033c268322b6771`. Final evidence is tagged`milestone-27-adaptive-demo-verified` after publication; the source ZIP represents the immutablev1.3.0release checkpoint.

Final conservative ledger at2026-09-15T04:37:44.012Z:directOpenAI$3/$10;Gateway$0.042359/$20;active0;all6servervoice sessions stopped. Provider invoice, Vercel grant and infrastructure uncertainties remain. Six revised English fields are131/158/149/138/169/148words. Private representative kit is synchronized and excluded from Git/ZIP. No form submission or legal attestation was performed. No required work remains for this adaptive-campaign and film goal.
