---
status: done
priority: high
tags: [evals, contracts, skill]
created: 2026-03-24
resolved: 2026-03-24
---

# T046 — Add eval cases for smart contract patterns

## Goal

Write eval cases to verify the skill correctly teaches smart contract patterns, gotchas, and production knowledge from the new patterns guide.

## Resolution

Created `evals/cases/skill/smart-contract-patterns.cases.json` with 7 eval cases:

| Case | Category | Tests |
|------|----------|-------|
| `gotcha-gda-no-app-credit` | gotchas | GDA has no app credit for CFA→GDA splitting |
| `gotcha-gda-unit-scaling` | gotchas | flowRate/totalUnits truncation to zero |
| `correct-automation-public-operator` | correctness | ACL + ERC-20 allowance dual permission pattern |
| `correct-passive-vs-superapp` | correctness | Passive state query vs Super App |
| `correct-custom-supertoken-types` | correctness | Pure / Wrapper / SETH / Bridged types |
| `codegen-cfa-gda-splitter` | code-gen | CFA→GDA splitter with buffer funding |
| `routing-smart-contract-patterns` | routing | Routes to patterns guide content |

Iterative refinement over 3 eval runs:
- Round 1: Identified incorrect rounding premise, overly strict criteria, prompt ambiguities
- Round 2: Deleted invalid rounding case, fixed SETH/variant ambiguity, reframed automation as general pattern
- Round 3: Fixed automation prompt to motivate ERC-20 approve, added getCFAFlowRate/getCFANetFlowRate to golden facts

Final results: 5/7 pass at 100%. The `codegen-cfa-gda-splitter` case (30-60%) is a legitimate failure — the model's training overrides the skill's GDA no-app-credit documentation. This is the hardest test and correctly identifies a real knowledge gap.
