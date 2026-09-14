# Browser QA — current run

- Date: 2026-09-14
- Host: Windows, Python 3.12.10, isolated `.work/browser-venv`
- Playwright: 1.57.0 (project pin)
- Browser: Microsoft Edge `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`
- Test: `tests/covenant_smoke.py`
- Result: desktop 1280×800, portrait 390×844, small 320×568 all rendered `WEBGL2 / PBR` with no page errors.
- Scope: controlled offline browser smoke; no OpenAI calls, no human/device/FPS claim.

All Python browser fixtures now use `tests/browser_env.py` for browser discovery and `NEMESIS_VALIDATION_DIR` for output. Existing historic validation folders are no longer the default destination. The mandated `develop-web-game` client could not run because its ES module imports `playwright` from its own skill directory; `npm exec --package=playwright` did not make that module resolvable for the external script. This is an environment/module-resolution limitation, not a game assertion result.
