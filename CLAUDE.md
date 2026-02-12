# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A Claude Code plugin that provides an AI agent skill for the [Superfluid Protocol](https://superfluid.finance). It's published to the Claude Code marketplace as `superfluid-org/skills`. There is no build step, test suite, or package manager — the repo is purely documentation and two standalone scripts.

## Repository Structure

```
.claude-plugin/          # Plugin + marketplace metadata (plugin.json, marketplace.json)
.vault/                  # Obsidian vault — project management (see below)
skills/superfluid/
  SKILL.md               # Main skill file — loaded by Claude Code on trigger
  references/
    architecture.md      # Protocol architecture overview
    contracts/           # 16 Rich ABI YAML files (one per contract)
  scripts/
    metadata.mjs         # Resolve contract addresses, subgraph endpoints, network info
    tokenlist.mjs        # Resolve Super Token addresses, symbols, and types
```

## Key Concepts

**Rich ABI YAMLs** — The core content. Each `.rich-abi.yaml` file is a self-contained contract reference documenting every public function, event, and error with parameter descriptions, access control, gotchas, and deployment addresses. Root keys: `meta`, `events`, `errors` are reserved; all other root keys are functions.

**SKILL.md** — The entry point Claude Code sees. It has YAML frontmatter (`name`, `description`) and maps use-cases to the correct reference files. It also documents the Rich ABI YAML format so Claude can parse them.

**Scripts** — Standalone Node.js (ESM) scripts requiring no `npm install`. They fetch data from CDN (`jsdelivr`) on first run and cache locally in `scripts/.cache/` (gitignored). Run with `node`:

```bash
node skills/superfluid/scripts/metadata.mjs contracts 10        # contract addresses on Optimism
node skills/superfluid/scripts/tokenlist.mjs super-token 10 USDCx  # find USDCx on Optimism
```

## Conventions

- Plugin version is tracked in `.claude-plugin/plugin.json` (field `version`) and `.claude-plugin/marketplace.json` (under `plugins[0].version`) — keep them in sync.
- Rich ABI YAML field order within function entries: description comment, `mutability`, `access`, `inputs`, `outputs`, `emits`, `errors`.
- `# GOTCHA:` prefix in YAML comments flags non-obvious behavior or common mistakes.
- `ctx: bytes` parameter on a function means it's called through the Host, never directly.

## Project Vault (`.vault/`)

An Obsidian vault used for project management. Claude Code is the "master" — it organizes the vault, creates tickets, and resolves them.

**Structure:**
- `Home.md` — dashboard with links to open tickets, roadmap, and resources
- `vision/roadmap.md` — skill direction, priorities, milestones
- `tickets/T{NNN}-slug.md` — development tickets with YAML frontmatter (`status`, `priority`, `tags`)
- `resources/` — Rich ABI YAML spec guides and other reference materials

**Ticket workflow:**
- Create: find highest T-number in `tickets/`, increment, create file, add `[[link]]` to Home.md "Open Tickets"
- Resolve: fill `## Resolution`, set `status: done` + `resolved` date, remove from Home.md open list
- Tags: `spec`, `contracts`, `scripts`, `skill`, `meta`, `bug`, `enhancement`

**Spec guides** (`resources/rich-abi-yaml-guide.md`, `resources/rich-abi-yaml-alignment.md`) are living documents — update them when the Rich ABI YAML format evolves.
