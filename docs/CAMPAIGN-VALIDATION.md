# Campaign voice and pact negotiation — v1.2.0

Baseline: clean `dde92f02d0aa3c4281ea241821c024f4a07a3250` on `ship/living-covenant`. The verified v0.5.0 input and later improvements are preserved.

## Implemented

Each of the six Expedition/Gauntlet sectors and three Classic sectors offers its existing three pacts. The shared catalog is checked against all45 actual simulation offers. GPT-5.6 Luna selects one of these pacts through Responses; it cannot invent or combine effects. GPT-Live-1 uses the current rival and sector catalog, sends speech and corrections to the same proposal pathway as text, and receives only the authored benefit, price and tip as unsigned commentary. Speech never signs.

The single `/api/campaign` endpoint handles propose/sign/cancel with the existing HttpOnly session, Origin/CSRF verification, durable shared quota, atomic reservation and an isolated campaign ledger. Stale replies, changes during signing, mismatched receipts and repeated signatures reject. Unknown usage retains its reservation. Voice uses the existing45-second watchdog and90-second allowance per sector, with a stable identifier across reopening that sector in the same run. No global limits were raised. Stop, Sign, Back, revoked consent, hiding the page and connection loss end microphone capture and request upstream shutdown. LOCAL RULES remains selectable without external requests.

The campaign supports negotiation before a sector starts. Its original authored pact mechanics, Q breach action and upgrades remain. First Contact retains composable clauses and its mid-fight amendment. Selecting a campaign pact uses existing world.sign without restarting the run or restoring hull/time/credits.

## Current verification

Four native Edge153.0.4234.32 WebGPU/compute browser layouts passed local proposal, edit, signature and actual combat. Desktop1440x900 and1280x720 fit the800px scaled game canvas; phone430x932 and320x568 are desktop emulation and use vertical scrolling. All transcripts can scroll inside their bounded fields. Four Director browser regressions and18 controlled offline campaign scene fixtures passed, with zero page errors/network calls. The latter use software SwiftShader and are not physical-device or human-play evidence.

Four real Redis tests passed, including campaign/Director/First Contact isolation, delayed result rejection, stale digest rejection and concurrent single-use signing. Only uniquely scoped test keys were removed. Supplied develop-web-game helper movement/dash snapshot inspected.

Node22.23.2:257/257 unit tests passed in24529.1686ms;43 syntax files and build passed. Production real Luna/Live tests are pending in this implementation checkpoint. Prior human iPhone16ProMax/Safari movie and WindowsVivaldi microphone evidence predate this campaign integration and are not claimed as new validation.

## Budget and rollback

Before: direct OpenAI$2.600000/$10; Vercel AI Gateway$0.036538/$20, active0, killnull, at2026-09-15T03:01:08.232Z. These are conservative application accounting, not provider invoices. Grant-specific Vercel balance/expiry and infrastructure costs remain unverified. Existing plans and billing settings remain unchanged.

Rollback: `vercel rollback dpl_Ey6W5h1mdVdm1ExsdNbvLi7ibgRW --yes --scope wildmans-projects`. Preserve Redis, budget totals, secrets and published media. Git tagv1.1.0 restores the previous source.
