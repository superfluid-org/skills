---
status: done
priority: normal
tags: [skill, release]
created: 2026-06-04
resolved: 2026-06-04
---

# T052 — Version bump 1.1.2 → 1.2.0

## Problem

After the Clear Macro, Balance API, and Reporter documentation additions (T049–T051), the plugin
version needed to be bumped to reflect the new minor release.

## Resolution

Bumped version 1.1.2 → 1.2.0 in all four required locations:
- `.claude-plugin/plugin.json` — source of truth (`version` field)
- `.claude-plugin/marketplace.json` — `plugins[0].version`
- `skills/superfluid/SKILL.md` — frontmatter `metadata.version`
- `landing-page/index.html` — version badge text

Verified with `grep -rn "1\.2\.0"` across all four files; no stray `1.1.2` remains.
