---
status: done
priority: high
tags: [contracts, enhancement]
created: 2026-02-12
resolved: 2026-02-12
---

# T008 — Add unit-change / flow-rate rounding GOTCHAs

## Problem

In a real troubleshooting session, it took 6+ back-and-forth exchanges for the AI to diagnose why GDA pool members stopped receiving tokens. The root cause: a unit increase had pushed `totalUnits` above `requestedFlowRate`, truncating the per-unit flow rate to 0 in the pool index. When the user reduced units back below the flow rate, the distribution didn't recover — because `updateMemberUnits` adjusts the adjustment flow using the *existing* per-unit rate (0), not recomputing it from the distributor's requested flow rate. The fix (re-calling `distributeFlow`) was undocumented.

The existing GOTCHAs on `distributeFlow` mentioned rounding but didn't explain the interaction with unit changes or the need to re-call `distributeFlow` after units change.

## Solution

Added GOTCHAs to `updateMemberUnits` and `distributeFlow` across all 3 GDA contract reference files, targeting the exact functions the AI reads during troubleshooting.

### Files modified

- **`GDAv1Forwarder.rich-abi.yaml`**: GOTCHA on `updateMemberUnits` (unit changes don't recompute per-unit rate; fix: re-call `distributeFlow`). New GOTCHA on `distributeFlow` (truncation-to-0 scenario, unit changes don't recover it).
- **`SuperfluidPool.rich-abi.yaml`**: GOTCHA on `updateMemberUnits`, brief cross-references on `increaseMemberUnits` and `decreaseMemberUnits`.
- **`GeneralDistributionAgreementV1.rich-abi.yaml`**: GOTCHA on `updateMemberUnits`, expanded `distributeFlow` GOTCHA with per-unit rate storage explanation, NOTE on `appendIndexUpdateByPool` explaining why unit changes can't recover a truncated distribution.

## Relation to T002

This ticket addresses the "extreme case" (#3) from [[T002-document-gda-adjustment-flow-rate]] and partially covers the "ratchet effect" (#2). T002's broader scope (three-level flow rate model, architecture.md section, compounding analysis) remains open.

## Resolution

All GOTCHAs implemented as described above. The AI should now diagnose the unit-change rounding issue within 1-2 exchanges instead of 6+.
