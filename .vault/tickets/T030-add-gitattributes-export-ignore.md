---
status: done
priority: low
tags: [meta]
created: 2026-03-01
resolved: 2026-03-01
---

# T030: Add .gitattributes to Exclude Dev Files from Distribution

## Problem

When users clone the repo or tools use `git archive`, they download dev-only files
(`.vault/`, `evals/`, `CLAUDE.md`, `CONTRIBUTING.md`, `.claude-plugin/`) that aren't
needed for using the skill. The installed skill (via `npx skills add`) already only
copies `skills/superfluid/`, but the initial download still included everything.

## Resolution

Added `.gitattributes` with `export-ignore` on dev-only paths. Distribution archives
now contain only `README.md`, `.gitignore`, `.gitattributes`, and `skills/superfluid/`.
Verified with `git archive` — all dev files excluded.
