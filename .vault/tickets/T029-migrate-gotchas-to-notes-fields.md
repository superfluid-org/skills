---
status: done
priority: high
tags: [contracts, spec, skill]
created: 2026-03-01
resolved: 2026-03-01
---

# T029: Migrate Gotchas to Structured `notes:` Fields

## Problem

Non-obvious behavior warnings were scattered across three formats: `# GOTCHA:` comments,
`gotchas:` YAML fields (on some files), and plain `#` comments. The inconsistency meant
AI models often missed critical information because comments don't appear in parsed YAML
output and the field name varied.

## Resolution

**Phase 1 — Field rename (3 files):** Renamed `gotchas:` → `notes:` with "Gotcha: " prefix
on each item in SuperTokenV1Library, CFASuperAppBase, and Superfluid.

**Phase 2 — Comment promotion (14 files):** Promoted all `# GOTCHA:` comments to `notes:`
fields across the remaining YAML files. Result: 87 `notes:` entries across 17 files, zero
remaining `# GOTCHA:` comments, zero `gotchas:` fields.

**Phase 3 — Documentation updates (5 files):** Updated `_rich-abi-yaml-format.md`,
`SKILL.md`, `CLAUDE.md`, `rich-abi-yaml-guide.md`, and `rich-abi-yaml-alignment.md` to
reference `notes:` instead of `gotchas:`.

**Phase 4 — SKILL.md emphasis:** Strengthened SKILL.md to guide models toward reading YAML
files (not just the quick-reference section). Added emphasis that `notes:` is "the most
important field for correctness." Gotcha eval scores improved from 43% → 81%.

**Phase 5 — Wording improvements for failing evals:** Improved note wording on
`distributeFlow` (GDA rounding — explicitly negated wrong interpretation) and
SuperTokenV1Library `address(this)` functions (added the fix, not just the problem).

**Phase 6 — Final comment scan:** Reviewed all 22 YAML files for remaining comment-only
behavioral details. Added `notes:` to `SuperToken.decimals` (always 18) and
`SuperToken.balanceOf` (clamps negative to zero).
