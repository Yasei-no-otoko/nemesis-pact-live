# UI review — current screenshots

Reviewed with actual image inspection on 2026-09-14:

- Desktop: `desktop-01-title.png`, `desktop-02-contract.png`
- Portrait 390×844: `portrait-01-title.png`, `portrait-02-contract.png`
- Small 320×568: `small-01-title.png`, `small-02-contract.png`

Findings:

- First Contact is clear on desktop and 390px portrait. The primary CTA reads “Negotiate the rules. Fight your deal.” and has the strongest mint treatment. The title screen still gives enough context to understand movement, parry, and pact-making.
- Desktop contract view is legible: counterparty, prompt, proposed clauses, preview, status, and both `Get counteroffer` / `Sign & enter combat` actions are visible without horizontal overflow. The right-side scrollbar shows the lower connection/voice controls continue below the fold, so a reviewer must scroll to reach them.
- At 390px, the contract panel is vertically scrollable and has no horizontal clipping. The sticky action bar remains usable, but it covers the lower price/connection content while at the initial scroll position; the user must scroll behind the sticky bar to inspect all clauses.
- At 320px, the primary CTA wraps to four short lines and extends below the captured viewport. It remains readable, but the initial “next action” is visually cramped and the adjacent Full campaign button consumes substantial width. This is the main small-screen polish issue.
- The 320px contract view keeps the prompt, counterparty, clauses, and sticky actions readable. The cost section is below the fold and partly obscured by the sticky action bar until scrolled.
- No black-screen defect was inferred: these captures include the full DOM overlays and visible WebGL scene. This review does not claim native-device performance or audio/live voice success.

Follow-up implementation was then checked with fresh Edge screenshots under `browser/covenant-smoke` after build: the voice panel now appears directly after the intro and before the terms textarea on desktop and portrait; the consent copy is shorter while retaining microphone and AI-voice disclosure; and mobile action buttons are in normal flow, so the 390px contract capture shows the full price and preview without a sticky overlay. The 320px title CTA is now three lines in the fresh capture rather than four. The fresh run rendered all three viewports as `WEBGL2 / PBR` with no page errors and used LOCAL RULES only.
