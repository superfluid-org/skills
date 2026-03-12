---
status: done
priority: high
tags: [meta, bug]
created: 2026-03-12
resolved: 2026-03-12
---

# T037 — Add plugin.json and fix plugin packaging

## Problem

Uploading the skill zip to Claude Desktop fails with "Invalid plugin: missing .claude-plugin/plugin.json". The repo only had `marketplace.json` (the marketplace catalog) but was missing `plugin.json` (the plugin manifest). Additionally, the GHA release workflow zipped only `skills/superfluid/` contents, excluding `.claude-plugin/` entirely.

## Resolution

- Added `.claude-plugin/plugin.json` with full plugin metadata
- Updated `.claude-plugin/marketplace.json`: changed `source` from `"./skills/superfluid"` to `"./"` (repo root is the plugin), removed `strict: false`
- Updated `.github/workflows/release.yml`: zip now includes `.claude-plugin/` and `skills/superfluid/` from repo root, version reads from `plugin.json`, ClawHub publishes from root
- Updated `CLAUDE.md` version convention to reflect `plugin.json` as single source of truth
