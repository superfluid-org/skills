---
status: done
priority: medium
tags: [scripts, skill, meta]
created: 2026-03-01
resolved: 2026-03-01
---

# T028: Refactor Scripts to Runtime Imports, Add Gotchas and Docs

## Problem

Scripts fetched data from CDNs and cached locally in `.cache/` directories, adding
complexity (file I/O, cache invalidation, error handling for network failures). SKILL.md
lacked documentation of common pitfalls. No contributor guide existed.

## Resolution

**Script refactoring** — All 4 scripts (`abi.mjs`, `balance.mjs`, `metadata.mjs`,
`tokenlist.mjs`) now use `bunx -p <pkg> bun` to import package data at runtime.
Removed all CDN fetching, local caching, and `.cache/` directory. Deleted
`scripts/.gitignore` (no longer needed).

**Common Gotchas** — Added section to SKILL.md documenting: Super Token 18-decimal
invariant, GDA 256-connection limit, distribution rounding, SuperTokenV1Library
`address(this)` behavior, CFASuperAppBase APP_LEVEL_FINAL, GDA pool nesting
restriction, FluidLocker instant unlock penalty.

**Documentation** — Created CONTRIBUTING.md with architecture overview, token
efficiency practices, content type guides, and conventions. Updated CLAUDE.md and
`references/guides/scripts.md` to reflect new script execution pattern.
