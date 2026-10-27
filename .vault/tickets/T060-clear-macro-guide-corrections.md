---
status: done
priority: normal
tags: [bug, skill]
created: 2026-10-27
resolved: 2026-10-27
---

# T060 — Correct Clear Macro provider-relay example, fee wording and allowlist note

## Problem

- `clear-macro.md` provider-relay example polled `res.status` (never set, so it looped forever),
  read nonexistent `caps.domain`/`caps.provider` (signing `provider: ''`), and omitted the
  `awaiting_authorization` state, Safe (`safeMessageV1`) authorization and the missing CORS headers.
- "BETA with no fee model yet" / "documents no fee scheme" (guide and `ClearMacroForwarder.abi.yaml`
  note) was stale: a live public-source macro (`DashboardClearMacro`) charges a disclosed USDCx fee.
- SKILL.md Automation Allowlisting said allowlisting was the only path, while the Dashboard schedules
  FlowScheduler streams through its Clear Macro for EOAs without the allowlist gate.

## Resolution

Files changed:
- `skills/superfluid/references/guides/clear-macro.md`: rewrote Provider Relay (poll `terminal`/`state`,
  `security.domain`/`provider` = `capabilities.providerName`, full state list, final hash from
  `receipt` or `transaction.hash`, CORS gotcha, `clientRequestId`/`metadata`/`forceExecuteAfterPreflightRevert`
  one-liners, `DELETE` cancel), added "Safe / ERC-1271 signers", rewrote the fee sentence.
- `skills/superfluid/references/contracts/ClearMacroForwarder.abi.yaml`: same fee rewording in `meta.notes`
  (comment/notes only, selector sidecars unaffected).
- `skills/superfluid/SKILL.md`: an exception under Automation Allowlisting (first hedged; firmed up
  2026-10-27 after the maintainer confirmed keepers execute these schedules).

Sources verified: live `https://clearmacro-provider.superfluid.dev/docs/json` and `/v1/capabilities`
(no `Access-Control-Allow-Origin`; `OPTIONS` returns 404); Dashboard `master` `contracts/README.md`,
`src/features/clearMacro/relayApi.ts`, `src/features/send/stream/SendStream.tsx`,
`src/features/clearMacro/useClearMacroEligibility.ts`.
