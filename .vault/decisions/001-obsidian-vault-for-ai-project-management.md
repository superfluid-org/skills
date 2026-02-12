---
date: 2026-02-12
status: accepted
---

# Use an Obsidian vault for AI-driven project management

## Decision

Use an Obsidian vault (`.vault/`) inside the repository as the central project management hub, with Claude Code as the primary operator — organizing structure, creating tickets, resolving them, and maintaining the roadmap.

## Context

The Superfluid agent skill repo has no build system, package manager, or test suite. It's a documentation-heavy project: Rich ABI YAMLs, architecture references, runtime scripts, and spec guides. Traditional issue trackers (GitHub Issues, Linear) don't fit well because:

- The "developer" doing most of the work is Claude Code, not a human in a browser
- Tickets benefit from being co-located with the spec guides and vision docs they reference
- Obsidian's `[[wikilinks]]` create natural connections between tickets, resources, and the roadmap
- Markdown files are the native format Claude Code reads and writes — no API integration needed

## Structure

The vault is organized into:

- **`Home.md`** — dashboard linking to open tickets, roadmap, and resources
- **`vision/`** — roadmap and direction (`roadmap.md`)
- **`tickets/`** — development tickets (`T{NNN}-slug.md`) with YAML frontmatter for status tracking
- **`resources/`** — spec guides and reference materials (Rich ABI YAML guide, alignment doc, Anthropic's skill-building PDF)
- **`decisions/`** — decision records like this one

## Workflow

Claude Code manages the vault as part of its normal operation:
- **Creating tickets**: finds the next T-number, creates the file, links it from Home.md
- **Resolving tickets**: fills the Resolution section, updates frontmatter status, removes from Home.md open list
- **Updating the roadmap**: moves items between sections as they progress
- **Updating specs**: edits resource files when the Rich ABI YAML format evolves

The user provides direction and input; Claude Code translates that into vault structure.

## Alternatives considered

- **GitHub Issues** — good for community-facing tracking, but adds friction for an AI-first workflow where everything is local markdown
- **Flat TODO in CLAUDE.md** — too unstructured for tracking vision, specs, and multiple tickets
- **No formal tracking** — risks losing context between sessions

## Outcome

The vault was set up in the initial session. The Rich ABI spec guides were moved into `resources/`, a roadmap was populated from the project's presentation, and ticket conventions were established. The vault is tracked in git alongside the skill itself.
