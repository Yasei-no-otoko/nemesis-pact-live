# Baseline validation — 2026-09-14

基点: `baseline-v0.5.0-verified-source` / commit `d31dd00` / branch `ship/living-covenant`.
この記録は v0.5.0 source ZIP 取り込み直後の Node 22 実行結果。実装変更の証拠ではない。

## Runtime

- Node: `v22.23.2` (cached `node@22` executable via `npm exec --yes --package=node@22`)
- npm host: `11.6.2` (system npm; scripts were invoked with the cached Node 22 binary)
- OS: Windows PowerShell, `C:\Users\wildman\Downloads\NEMESIS-PACT-3D-EN-v0.5.0-source\NEMESIS-PACT`

## Results

| Command / suite | Result | Counts / output |
|---|---|---|
| `npm run check` equivalent (`node --check` for package.json's 17 listed files) | PASS | 17/17 syntax checks |
| `npm test` equivalent (`node --test tests/*.test.js`) | PASS | 164 tests, 164 pass, 0 fail, 0 skipped, 1106.62 ms |
| `npm run build` equivalent (`node tools/build.js`) | PASS | `dist/NEMESIS-PACT.html` 323999 bytes; no external assets |
| `npm run test:covenant` | PASS | 40 tests, 40 pass, 0 fail, 637.94 ms |
| `npm run test:covenant-simulation` | PASS | 12 scenarios: desktop/portrait × standard/veteran, all `won` |
| `npm run test:campaign` | PASS | 12 scenarios: desktop/portrait × expedition/gauntlet × 3 difficulties, all `won` |
| `npm run test:simulation` | PASS | 9 scenarios: 3 difficulties × 3 seeds, all `won` |
| `npm run test:portrait` | PASS | 27/27 scenarios (`620`, `900`, `1180` widths × 3 difficulties × 3 seeds), all `won` |
| `npm run test:server` | PASS | build `0.5.0`; 9 HTTP/security checks; `upstreamCalls: 0`; loopback only, not Vercel |

The server smoke checks covered hosted bytes and same-origin opt-in, secret/source/path exclusion, mock POST selection, GET and non-JSON rejection, oversized body rejection, covenant composition, and unknown rule injection rejection.

## Browser tooling availability

- `npx playwright --version`: `1.63.0` (CLI available; npm offered installation of `playwright@1.63.0`).
- `python --version`: `Python 3.12.10`.
- Python `import playwright`: unavailable (`ModuleNotFoundError`).
- Existing Python browser fixtures require `/usr/bin/chromium` and therefore are not runnable on this Windows host as written.
- Installed browser executable found: `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`.
- No Chromium executable was found in the inspected PATH / Playwright cache. A future real-browser run can use Edge with Node Playwright or install the pinned Python dependency/browser when authorized.

## Working tree note

The baseline run generated/updated build outputs and existing simulation JSONs. At capture time the worktree also contained changes from other agents (`.gitignore`, docs, `progress.md`, and simulation evidence); this QA run did not edit source, server, API, package, test, or tool files and did not commit or push.
