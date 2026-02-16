---
status: done
priority: high
tags: [skill, enhancement]
created: 2025-02-15
resolved: 2025-02-15
---

# T017 — Add dedicated Super Apps guide

## Problem

App credit, callback lifecycle, jailing, and app levels were documented only as scattered fragments across multiple YAML files and a brief architecture.md subsection. In real conversations, Claude had to fetch raw Solidity source code to explain the push/pop mechanism, APP_RULE reason codes, and lending rules — information that should be available in the skill.

## Resolution

Created `references/guides/super-apps.md` — a dedicated ~150-line guide covering:

- **What is a Super App** — definition and purpose
- **Callback lifecycle** — full push/pop sequence (10 steps)
- **App credit** — zero-balance design goal, three lending rules (Rule A, CFA-1, CFA-2), deposit impact on sender
- **App levels & composition** — FINAL vs SECOND, `allowCompositeApp`, MAX_APP_CALLBACK_LEVEL
- **Jailing** — all 9 APP_RULE reason codes enumerated, consequences, practical rules including context threading guidance

Supporting changes across 5 existing files:

- `architecture.md` — slimmed app credit section to summary + cross-reference
- `Superfluid.abi.yaml` — added APP_RULE reason codes, Jail event cross-ref, callback lifecycle in Agreement Framework section, expanded configWord glossary
- `ConstantFlowAgreementV1.abi.yaml` — expanded app credit glossary with zero-balance framing
- `CFASuperAppBase.abi.yaml` — expanded header with jailing causes, added GOTCHA about APP_LEVEL_FINAL on getConfigWord
- `SKILL.md` — added routing row for guide, expanded Super Apps paragraph
