---
status: done
priority: normal
tags: [skill, meta]
created: 2026-03-02
resolved: 2026-03-02
---

# T032 — Bump version to 0.5.2, add skill version metadata

## Problem

The skill had no way to know its own version at runtime. Additionally, version 0.5.2 is needed to trigger the first release with the new ClawHub publishing workflow (T031).

## Resolution

- Bumped `plugins[0].version` in `marketplace.json` from 0.5.1 to 0.5.2
- Added `metadata: { version: 0.5.2 }` to `SKILL.md` frontmatter so the agent sees its version when the skill loads
- Updated `CLAUDE.md` conventions to note that `metadata.version` in SKILL.md must be kept in sync on version bumps
