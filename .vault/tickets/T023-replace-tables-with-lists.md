---
status: done
priority: medium
tags: [skill, enhancement]
created: 2026-02-27
resolved: 2026-02-27
---

# T023 — Replace Markdown Tables with Bullet Lists for Token Efficiency

## Goal

Replace markdown tables across SKILL.md and reference files with bullet lists to reduce token overhead and improve LLM readability.

## Context

Markdown tables carry significant per-row overhead: header rows, separator rows (`|---|---|`), and pipe/padding characters on every data row. Most tables in the skill were simple key→value or key→description mappings that don't benefit from columnar alignment. Bullet lists with `→` or `—` separators are more token-efficient and easier for LLMs to parse.

## Resolution

**SKILL.md** — Replaced all 22 tables (142 pipe-lines → 1). Developer Tracks wide table → 3 bold-labeled paragraphs. Use-Case Map tables (13) → flat bullet lists. Error prefix, SDK, API, subgraph, app, sentinel tables → bullet lists. Result: 367→325 lines, 18.4KB→17.5KB.

**Reference files** (6 files modified):

- `references/subgraphs/_query-patterns.md` — 7 tables converted. Operator reference (22-row flat table) restructured into grouped sections by type availability. Scalar types, naming convention, full-text operators, key sources, notable changes → bullet lists.
- `references/guides/sdks.md` — Deprecated packages table → bullet list. ABI import tables kept (dense lookup, columnar alignment justified).
- `references/guides/super-apps.md` — APP_RULE jailing reason codes (9 rows) → bullet list.
- `references/guides/macro-forwarders.md` — Batch operation types (10 rows) → bullet list.
- `references/subgraphs/vesting-scheduler-guide.md` — Status decision tree (12 rows, 5 columns) → numbered priority list (better for "first match wins" logic).
- `references/subgraphs/sup-subgraph-guide.md` — Network endpoints (2 rows) → bullet list.
