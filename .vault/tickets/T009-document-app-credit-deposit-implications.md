---
status: done
priority: high
tags: [contracts, skill, enhancement]
created: 2026-02-12
resolved: 2026-02-12
---

# T009 — Document app credit deposit implications for Super App senders

## Problem

The skill's references contain the building blocks for understanding app credit (glossary entries, `owedDeposit` fields, balance formula) but never explicitly state the practical consequence: senders streaming to Super Apps lock roughly 2x (or more) capital due to owed deposit. An AI using the skill can infer this by connecting dots across files, but the implication should be stated directly.

## Changes

1. **`references/architecture.md`** — Added "App Credit & Deposit Mechanics" subsection under CFA, explaining the full mechanism: app credit → owed deposit → sender deposit doubling → fan-out amplification → earlier critical status.

2. **`SKILL.md`** — Added note under "Building Super Apps" section about deposit doubling and pointing to architecture.md.

3. **`CFASuperAppBase.rich-abi.yaml`** — Added header GOTCHA about sender deposit doubling when Super App relays flows.

4. **`ConstantFlowAgreementV1.rich-abi.yaml`** — Expanded `app credit` glossary entry to mention owed deposit backing. Added note to `updateFlow` GOTCHA about owedDeposit accumulation.

5. **`Superfluid.rich-abi.yaml`** — Added GOTCHA to `appCallbackPush` explaining that appCreditGranted is backed by the sender's deposit.

## Resolution

All five files updated with consistent messaging. The architecture.md section provides the narrative overview; contract-level GOTCHAs reinforce at point of use; SKILL.md primes the AI when routing to Super App references.
