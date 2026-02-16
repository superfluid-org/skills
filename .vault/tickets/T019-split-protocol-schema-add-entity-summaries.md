---
status: done
priority: medium
tags: [skill, enhancement]
created: 2026-02-16
resolved: 2026-02-16
---

# T019 — Split protocol schema + add entity summaries

## Goal

Improve AI token efficiency for subgraph references by splitting the large protocol-v1 schema and adding concise entity summaries to all guide files.

## Context

`protocol-v1.graphql` was 2,971 lines (~12K tokens) with ~70% boilerplate. Splitting it lets the agent load only the relevant half. Entity summaries in guide files give the agent a quick overview of what's queryable without loading full schemas.

## Resolution

**Split `protocol-v1.graphql`:**
- `protocol-v1-events.graphql` (1,685 lines) — Event interface + 47 event types
- `protocol-v1-entities.graphql` (1,347 lines) — Event interface + 18 higher-order/aggregate/helper entities
- Original file deleted

**Added entity summaries to all 4 guide files:**
- `protocol-v1-guide.md` — 18 entities with key fields + 47 event names by category
- `vesting-scheduler-guide.md` — 3 entities + 8 events
- `flow-scheduler-guide.md` — 3 entities + 4 events
- `auto-wrap-guide.md` — 2 entities + 6 events

**Updated SKILL.md:**
- Split protocol-v1 row into entities vs events
- Reordered to list guide files before schema files (guides are more token-efficient for initial lookup)
