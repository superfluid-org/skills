---
status: open
priority: high
tags: [spec, contracts, skill, enhancement]
created: 2026-02-12
---

# T002 — Document GDA adjustment flow rate semantics

## Problem

The skill's documentation of GDA adjustment flow rates is shallow — limited to glossary one-liners ("rounding remainder flow directed to the pool admin") and a single GOTCHA on `distributeFlow`. Three critical behavioral nuances are undocumented, leading the AI to give incomplete or misleading answers about how adjustment flow rates actually work.

### 1. The three-level flow rate model

The skill doesn't distinguish between three distinct values:

| Level | Definition | Recalculated when |
|-------|-----------|-------------------|
| `requestedFlowRate` | The argument passed to `distributeFlow` | `distributeFlow` is called |
| `actualFlowRate` | `floor(requested / totalUnits) * totalUnits` — locked at call time | `distributeFlow` is called |
| `effectiveFlowRate` | `actualFlowRate - adjustmentFlowRate` — what members receive | `distributeFlow` or `updateMemberUnits` is called |

The gap between requested and actual is **silently dropped** — not distributed, not sent to admin, just lost. The gap between actual and effective is the adjustment flow sent to admin.

### 2. The ratchet effect

When `updateMemberUnits` changes `totalUnits`, the adjustment flow rate can only increase, never decrease. It acts as a high-water mark:

```
newRemainder = actualFR - floor(actualFR / newTotalUnits) * newTotalUnits
adjustmentFR = max(currentAdjustmentFR, newRemainder)
```

Only calling `distributeFlow` again resets this. Transient bad divisibility permanently degrades the effective flow rate.

### 3. The extreme case

When `totalUnits` exceeds `actualFlowRate` (even transiently), `floor(actualFR / totalUnits) = 0`, so the **entire flow** becomes adjustment flow. Due to the ratchet, it stays that way even after units decrease to values that would divide cleanly. The pool effectively stops distributing until `distributeFlow` is called.

### Compounding

Issues 1 and 2 compound. Issue 1 locks in a reduced `actualFlowRate`. Issue 2 then ratchets `adjustmentFlowRate` up against that already-reduced actual. The effective flow rate can be driven arbitrarily far below the target by nothing more than the ordering of pool admin operations.

## Proposed changes

### Rich ABI YAMLs

- **`GeneralDistributionAgreementV1.rich-abi.yaml`**:
  - Expand `distributeFlow` GOTCHA to explain the three-level model and the requested→actual gap
  - Add a GOTCHA to `updateMemberUnits` about the ratchet effect on adjustment flow
  - Expand `estimateFlowDistributionActualFlowRate` comments to clarify what "actual" means

- **`GDAv1Forwarder.rich-abi.yaml`**:
  - Mirror shortly key GOTCHAs on `distributeFlow` and `getPoolAdjustmentFlowRate`, refer to the GDA agreement to learn more

- **`SuperfluidPool.rich-abi.yaml`**:
  - Add GOTCHA to `updateMemberUnits` about the ratchet effect

### Architecture

- **`architecture.md`**: Add a subsection under GDA explaining the adjustment flow rate lifecycle and the ratchet behavior

## Reference test cases

From [`d10r/sf-gda-issues`](https://raw.githubusercontent.com/d10r/sf-gda-issues/refs/heads/master/test/GDASemanticIssues.t.sol):

- `testIssueALucky` / `testIssueAUnlucky` — Action ordering (setting units before vs. after `distributeFlow`) causes different `actualFlowRate` lockdowns for the same final pool state
- `testIssueBLucky` / `testIssueBUnlucky` / `testIssueBVeryUnlucky` — Transient bad divisibility permanently captures adjustment flow via the ratchet, up to and including the entire distribution
