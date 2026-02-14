---
status: done
priority: medium
tags: [skill, enhancement]
created: 2026-02-15
resolved: 2026-02-15
---

# T016 — Add subgraph schema references

## Description

Add subgraph entity schemas and query construction patterns to the skill so the agent can help users write GraphQL queries against Superfluid subgraphs. Five source files (4 `.graphql` schemas + 1 query patterns guide) need to be organized into the reference structure and wired into SKILL.md.

## Resolution

Created `references/subgraphs/` directory with 5 files:

- **`query-patterns.md`** — how The Graph auto-generates query schemas from entity definitions (filter operators, pagination, ordering, time-travel, derived fields)
- **`protocol-v1.graphql`** (~79 KB) — main protocol subgraph schema (51 event types, 18 queryable entities)
- **`vesting-scheduler.graphql`** — vesting scheduler subgraph schema
- **`flow-scheduler.graphql`** — flow scheduler subgraph schema
- **`auto-wrap.graphql`** — auto-wrap subgraph schema

Updated SKILL.md:
- Added "Querying indexed data (Subgraphs)" use-case section with intent→reference mappings
- Added cross-reference in Ecosystem → Subgraphs pointing to the new use-case section
