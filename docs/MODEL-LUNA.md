# Contract model: GPT-5.6 Luna

Requested by the user; API ID `gpt-5.6-luna`, Gateway ID `openai/gpt-5.6-luna`. The voice model remains `gpt-live-1`; voice delegation and text use the same validated covenant service and explicit Sign path.

## Verified configuration (2026-09-15 JST)

- [OpenAI model documentation](https://developers.openai.com/api/docs/models/gpt-5.6-luna) supports Responses, structured output and `reasoning.effort=none`.
- [Vercel model documentation](https://vercel.com/ai-gateway/models/gpt-5.6-luna) and the live `/v1/models` catalog identify the exact Gateway slug. The unmodified selected catalog entry is in `validation-current/luna/catalog.json`.
- [Gateway Responses documentation](https://vercel.com/docs/ai-gateway/sdks-and-apis/responses) defines the existing authenticated `/v1/responses` path.

The server chooses standard/default service tier and no reasoning effort for short, latency-sensitive selections from the existing 36 legal rule combinations. Output remains capped at 700 tokens, upstream deadline at 12 seconds, and strict schema plus explicit-correction validation remains unchanged. The model and settings cannot be selected by a browser request. No model fallback to a differently named model is configured; failed generation yields clearly labeled LOCAL RULES.

## Accounting

Catalog rates for this short-context request are $0.20 per million input tokens, $1.20 output, $0.25 cache-write input and $0.02 cache-read input. Keep cached reads at the full base input price conservatively; add the write premium for reported cache-write tokens. If cache detail is missing/invalid, assume all input was written. Missing total token usage retains the full $0.01 reservation. Output usage includes any reasoning tokens rather than charging only visible text.

The first two live handler probes succeeded; the second exposed cache-write usage. Its initial accounting omitted a $0.000066 write premium, which was added to the durable verification ledger and preserved as an explicit correction in `validation-current/luna/live-handler.json`. The server calculation was fixed before production activation. This accounting remains conservative application accounting, not a provider invoice.

Gateway total/public/judging caps and direct OpenAI voice caps remain unchanged. Local real-model verification uses the already allocated Gateway verification pool; production keeps its approved public pool. The previous gpt-4.1-mini entry remains in the server allowlist for controlled rollback only; `OPENAI_MODEL` selects a single model.

## Evidence scope

`validation-current/luna/live-handler.json` records two actual Gateway calls, returned upstream model IDs, valid contracts, usage and timing through the local handler with a production-authenticated app identity and shared quotas. It is not a browser, human-microphone or signature test. Production browser results and release metadata are recorded separately after deployment. Earlier human videos use gpt-4.1-mini and must not be relabeled as Luna footage.

Production verified at `fad1fc1e338bc7a4c750742859c21889e5b009f1` / `dpl_9GkMZF6NWQMbowgTY5rQ9NYAECiv`: all three real browser proposals used Luna, followed by Sign revisions 1 and 2 and verified combat/health continuity. Latencies 1797/2235/2175ms, n=3; no p95 or general success-rate claim. See `validation-current/luna/production/result.json`.
