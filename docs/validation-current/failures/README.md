# Failure-path browser regression

Run: `tests/failure_browser_test.py` on the local hosted page (`127.0.0.1:8080`) with Microsoft Edge 153 through Playwright. All API responses and microphone behavior are deliberately mocked; `realApiCalls: 0`. This evidence does not claim live OpenAI or Vercel success.

The run covers:

- an OpenAI-shaped proposal fixture, explicit Sign, and combat pact HUD activation;
- session fetch failure falling back to `LOCAL RULES`, followed by playable explicit Sign;
- upstream HTTP 429 and 503 falling back to `LOCAL RULES`, followed by playable explicit Sign;
- microphone permission denial with an explicit text negotiation fallback.

The client stale-result, supersession, and duplicate-sign invariants remain covered by `tests/covenant-client.test.js`; this browser file does not represent interruption or live voice negotiation.

Machine-readable result: [results.json](results.json). Screenshots are in this directory and are labeled by case.

The session disconnect fixture aborts the request; it does not measure a timeout. Stalled-header and stalled-body timeouts have separate Node unit tests. The 503 fixture represents service unavailability, not a real Redis outage.
