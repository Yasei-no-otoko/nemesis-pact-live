# Clause withdrawal regression

The new human `nemesis-pact-demo (2).webm` exposed a frontend intent bug on source 31381f9. During mid-fight parley, `安全は撤回。その代わり敵の弾を遅く` cleared the proposed deal and disabled Sign. The old substring check treated revoking a sanctuary clause as withdrawing the whole proposal.

`isProposalWithdrawal` now recognizes explicit terminal whole-proposal cancellation commands. Clause edits and ambiguous speech continue through the existing validated covenant service. A real cancellation still invalidates the request and disables Sign; accumulated speech is retained so a delayed replacement clause can supersede it. No model, signing, quota or simulation permissions change.

`local/result.json` uses synthetic transcript callbacks in actual Edge controls and the LOCAL RULES path, with zero API calls. It covers clause removal, ordinary whole-proposal cancellation, delayed continuation, two signatures and HP/boss/time continuity. Local rules are bounded offline parsing, not evidence of natural-language model interpretation.

The first production attempt on source `ed48b2895363e511a59a8b84e6da8fce0ab3c3dd`, deployment `dpl_Hg4HZHD3Z5y6Xjf5VMp2UUECpyio`, is preserved in `attempt-1/`. Actual GPT-Live-1 recognized `安全は撤回その代わり敵の弾を遅く` and replied, but emitted no `session.delegation.created` in the 30-second wait. The offer was no longer incorrectly withdrawn, yet the model request did not start. This is a failed end-to-end run, not a pass. One prior Luna text contract had been signed. The actual voice session stopped with confirmed Redis settlement; cost retained $0.05 direct OpenAI and $0.000400 Gateway.

The follow-up adds a bounded application request after quiet meaningful speech when provider delegation is missing. It uses the same generation checks, request cancellation, canonical validation, eight-attempt limit and explicit Sign. Results are returned with the documented session-wide `delegation_id: null`; no provider delegation ID is fabricated. A late delegation for the same input must not generate a second paid contract. The voice prompt also distinguishes clause removal from whole-proposal withdrawal.

Final production regression remains pending. Its separate script allows one Live session per run, synthetic Japanese speech input, a prior text contract/sign, then the recorded withdrawal phrase, a real model amendment and second Sign. It is not human microphone evidence. All failed attempts remain separate.
