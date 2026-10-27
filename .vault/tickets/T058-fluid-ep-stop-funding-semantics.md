---
status: done
priority: normal
tags: [bug, contracts]
created: 2026-10-27
resolved: 2026-10-27
---

# T058 — Correct FluidEPProgramManager stopFunding and cancelProgram semantics

## Problem

`FluidEPProgramManager.abi.yaml` described `stopFunding` as callable only inside the
`EARLY_PROGRAM_END` window before the end date, and as returning unused funds. Both are
wrong against `sup-token` `dev` `FluidEPProgramManager.sol`:

- The only time check is `block.timestamp < endDate - EARLY_PROGRAM_END` → revert, so
  the call is valid from 3 days before `endDate` onward, including after `endDate`.
- Early-end compensation (`(endDate - now) * flowRate`) is distributed to the program
  pool and the subsidy share to `TAX_DISTRIBUTION_POOL`. Nothing returns to the treasury.
  After `endDate` both compensation amounts are 0.
- Flows do not stop at `endDate` on their own; someone must call `stopFunding`.

`cancelProgram` returns the initial deposit (buffer + `EARLY_PROGRAM_END` of flow) to the
treasury and distributes nothing to pools.

The corrected text first existed only in a locally installed copy of the skill (no
commit in any branch); this ticket upstreams it after checking it against source.

## Resolution

Updated `skills/superfluid/references/contracts/FluidEPProgramManager.abi.yaml`:
`stopFunding` description and notes, `cancelProgram` description, and the
`ProgramStopped` event comment. Comment-only change, so selector sidecars are unaffected.
