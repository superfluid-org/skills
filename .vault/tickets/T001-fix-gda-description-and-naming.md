---
status: done
priority: high
tags: [spec, contracts, skill, bug]
created: 2026-02-12
resolved: 2026-02-12
---

# T001 — Fix GDA description, naming, and config flag errors

## Problem

A user conversation with the skill revealed three categories of inaccuracies:

1. **GDA is many-to-many, not just 1-to-many** — when `distributionFromAnyAddress: true`, multiple senders can distribute into the same pool. The skill said "1:many" in several places, misleading the AI summary.
2. **Naming preferences** — "Vesting Scheduler" (no "v3") and "Auto-Wrap" are the preferred human-readable names in prose.
3. **Config flag confusion in architecture.md** — two places incorrectly described `transferability`/`transferabilityForUnitsOwner` as controlling distribution access; that's actually `distributionFromAnyAddress`. `transferabilityForUnitsOwner` controls whether members can transfer pool units.

## Resolution

Applied fixes across three files:

- **SKILL.md**: Changed GDA shorthand from "1:many" to "many-to-many"; updated automation names to "Vesting Scheduler", "Auto-Wrap".
- **architecture.md**: Fixed GDA heading to "Many-to-many"; corrected config flag from `transferability` to `distributionFromAnyAddress` with proper description; clarified IDA as "1-to-many only"; fixed `transferabilityForUnitsOwner` description to correctly say it controls unit transfers.
- **README.md**: Changed GDA shorthand from "1:many" to "many-to-many".
