---
status: done
priority: medium
tags: [meta, skill]
created: 2026-03-02
resolved: 2026-03-02
---

# T031: Add GitHub Actions Release Workflow and Skill Trigger Keywords

## Problem

Claude Desktop and similar tools require a `.zip` upload of the skill. The repo had
`.gitattributes` export-ignore rules but no automated way to produce and publish release
archives. Additionally, the SKILL.md description lacked domain-specific keywords (CFA,
GDA, Super App, Super Token, stream, flow rate), reducing auto-trigger reliability.

## Resolution

1. **Release workflow** (`.github/workflows/release.yml`): triggers on `v*` tag pushes,
   validates the tag version matches `plugin.json` and `marketplace.json`, builds a zip
   of only `skills/superfluid/` via `git archive`, and creates a GitHub Release with the
   zip attached.

2. **Skill keywords**: added `Keywords: CFA, GDA, Super App, Super Token, stream, flow rate`
   to the SKILL.md `description` frontmatter field.

3. **Export-ignore**: added `.github/**` and `.github` to `.gitattributes` so the workflow
   directory is excluded from distribution archives.
