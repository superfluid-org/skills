---
status: done
priority: low
tags: [meta, bug]
created: 2026-02-27
resolved: 2026-02-27
---

# T021 — Fix CLAUDE.md Script Count

## Goal

Update CLAUDE.md to reflect all four standalone scripts instead of two.

## Context

CLAUDE.md line 7 said "two standalone scripts" and the directory tree only listed `metadata.mjs` and `tokenlist.mjs`, but `abi.mjs` and `balance.mjs` were added in T005 and T007 without updating CLAUDE.md.

## Resolution

- Changed "two standalone scripts" → "four standalone scripts" on line 7
- Added `abi.mjs` and `balance.mjs` to the directory tree in the Repository Structure section
