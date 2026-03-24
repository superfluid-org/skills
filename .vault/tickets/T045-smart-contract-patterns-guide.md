---
status: done
priority: high
tags: [guides, contracts, skill]
created: 2026-03-24
resolved: 2026-03-24
---

# T045 — Add smart contract patterns guide

## Goal

Create a practical patterns & gotchas guide for smart contract developers, distilled from 8 production repos and reference implementations. Make the AI better at generating correct Superfluid contracts.

## Resolution

Created `references/guides/smart-contract-patterns.md` (440 lines) with 6 sections:
- **A. GDA Pool Patterns** — unit scaling, buffer funding (GDA has no app credit), defensive unit ops, pool config, per-member isolation
- **B. Super App Callback Patterns** — flow splitting anatomy, context chaining, receiver validation, safe external calls, stream redirection
- **C. Custom SuperToken Deployment** — Pure, Wrapper, SETH (pre-deployed), Bridged/xERC20, storage layout, atomic deployment
- **D. Proxy & Factory Patterns** — Beacon, Create2, Clones, UUPS
- **E. Automation / Public Operator Pattern** — ACL via CFAv1Forwarder + ERC-20 allowance, createFlowFrom/deleteFlowFrom, time-gated execution, delay compensation
- **F. Stream-Based Access Control** — passive state query vs Super App, multiple payment tiers

Also updated:
- `SKILL.md` — added GDA buffer gotcha to Common Gotchas + routing entry under Building Super Apps
- `GDAv1Forwarder.abi.yaml` — added GDA no-app-credit note on `distributeFlow`
- `SuperfluidPool.abi.yaml` — corrected `decreaseMemberUnits` note (uint128 underflow, not rounding)
- `super-apps.md` — added "App Credit Is CFA-Only" subsection

Key correction during development: investigation of SuperfluidPool.sol revealed that `decreaseMemberUnits` does NOT fail due to "GDA rounding." Units are stored as plain uint128 — no rounding in store/retrieve. Banger's try/catch is defensive against their own accounting errors, not a protocol issue.
