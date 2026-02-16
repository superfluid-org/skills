---
status: done
priority: medium
tags: [skill, enhancement]
created: 2026-02-16
resolved: 2026-02-16
---

# T018 — Add subgraph usage guides

## Goal

Add per-subgraph usage guides alongside existing `.graphql` schema files, covering example queries, filter patterns, status computation, and gotchas.

## Context

The repo had `.graphql` schemas (entity definitions) and a generic `query-patterns.md` (Graph Protocol mechanics), but no Superfluid-specific usage patterns — no example queries, no vesting status logic, no gotchas about address casing or broken `_nocase` filters.

## Resolution

Created 4 guide files and updated 2 existing files:

**New files:**
- `references/subgraphs/vesting-scheduler-guide.md` — 12-status decision tree, timing fields, totalAmountWithOverpayment formula, schedule ID format, events query, filter patterns
- `references/subgraphs/flow-scheduler-guide.md` — union type handling (CreateTask/DeleteTask), example query, filter patterns
- `references/subgraphs/auto-wrap-guide.md` — example query, filter patterns
- `references/subgraphs/protocol-v1-guide.md` — token type detection, account snapshots query, nested filter example

**Modified files:**
- `references/subgraphs/query-patterns.md` — added § 13 "Superfluid-Specific Gotchas" (lowercase addresses, `_nocase` broken on Bytes, timestamps, event addresses ambiguity)
- `SKILL.md` — updated subgraph intent table to reference guide files
