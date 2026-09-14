# Clause withdrawal regression

The new human `nemesis-pact-demo (2).webm` exposed a frontend intent bug on source 31381f9. During mid-fight parley, `安全は撤回。その代わり敵の弾を遅く` cleared the proposed deal and disabled Sign. The old substring check treated revoking a sanctuary clause as withdrawing the whole proposal.

`isProposalWithdrawal` now recognizes explicit terminal whole-proposal cancellation commands. Clause edits and ambiguous speech continue through the existing validated covenant service. A real cancellation still invalidates the request and disables Sign; accumulated speech is retained so a delayed replacement clause can supersede it. No model, signing, quota or simulation permissions change.

`local/result.json` uses synthetic transcript callbacks in actual Edge controls and the LOCAL RULES path, with zero API calls. It covers clause removal, ordinary whole-proposal cancellation, delayed continuation, two signatures and HP/boss/time continuity. Local rules are bounded offline parsing, not evidence of natural-language model interpretation.

Production real Live/Luna regression is pending deployment. Its separate script allows exactly one Live session, synthetic Japanese speech input, a prior text contract/sign, then the recorded withdrawal phrase, a real model amendment and second Sign. It is not human microphone evidence.
