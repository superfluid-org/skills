---
status: done
priority: high
tags: [skill, enhancement]
created: 2026-02-12
resolved: 2026-02-12
---

# T006 — Improve skill trigger description

## Problem

The AI doesn't invoke the Superfluid skill automatically enough. It sometimes searches the web for Superfluid documentation instead of loading the skill. The root cause is the SKILL.md frontmatter `description` — it lists specific trigger keywords (which paradoxically narrows matching) and doesn't tell the AI to prefer the skill over web search.

## Solution

Replace the SKILL.md frontmatter `description` with a shorter, directive version that:
- Uses broad language ("ANY question or task involving Superfluid")
- Explicitly says "Do NOT search the web"
- Is shorter and easier for the AI to match against

## Resolution

Replaced the SKILL.md frontmatter `description` with a shorter, directive version that uses broad matching language and explicitly instructs the AI not to search the web for Superfluid information.
