---
status: done
priority: high
tags: [skill, enhancement]
created: 2026-02-27
resolved: 2026-02-27
---

# T022 — Slim SKILL.md, Extract Content to Dedicated Guides

## Goal

Reduce SKILL.md size by extracting verbose inline documentation into dedicated reference files, keeping SKILL.md as a concise routing map.

## Context

SKILL.md had grown to include full SDK import tables, API endpoint details, governance breakdowns, Rich ABI YAML format specification, and script usage examples inline. This made it too large and prevented the AI from loading more specific context on-demand. Extracting detail into dedicated files under `references/guides/` and `references/contracts/` keeps SKILL.md as a compact routing map so the agent loads only the references it needs for a given task.

## Resolution

**Extracted to new guide files** (`references/guides/`):
- `sdks.md` — SDK import paths, ABI tables, deprecated package warnings
- `scripts.md` — script command syntax, arguments, examples
- `api-services.md` — per-API endpoints, Swagger/OpenAPI links, gotchas
- `sup-and-dao.md` — SUP distribution, Foundation vs DAO, governance, links

**Extracted to contracts:**
- `_rich-abi-yaml-format.md` — Rich ABI YAML parsing specification (was inline in SKILL.md)

**Added SUP subgraph references** (`references/subgraphs/`):
- `sup-subgraph-guide.md` — usage guide for the SUP/Locker subgraph
- `sup-subgraph.graphql` — entity schema
- Renamed `query-patterns.md` → `_query-patterns.md` (underscore prefix for cross-cutting docs)

**SKILL.md changes:**
- Added Developer Tracks table (Smart Contract / App / Investigating)
- Replaced verbose inline sections with summary + pointer to the relevant guide
- Updated all paths for earlier renames (bases/ → contracts/, libraries/ → contracts/, architecture.md → guides/)
- Added SUP subgraph row to the subgraph table
