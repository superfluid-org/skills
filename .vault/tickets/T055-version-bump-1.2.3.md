---
status: done
priority: normal
tags: [skill, release, contracts]
created: 2026-06-10
resolved: 2026-06-10
---

# T055 — Version bump 1.2.0 → 1.2.3

## Problem

The `clear-macro.md` guide described `ClearMacroForwarder` as extending the base
`BlindMacroForwarder`. "Extends" reads as Solidity contract inheritance, which is
inaccurate: `ClearMacroForwarder` inherits `[ForwarderBase, EIP712, NonceManager]`
(`ClearMacroForwarder.abi.yaml`) and does **not** inherit `BlindMacroForwarder`. The
two are sibling forwarders — both independently extend `ForwarderBase` (the shared base
for all trusted forwarders) and drive user-defined macros (Blind via `IUserDefinedMacro`,
Clear via `IClearMacro` which extends `IMacro`). Clear is the functional successor /
superset of Blind, not a code descendant.

This documentation correction ships as a patch release.

## Resolution

Reworded the inheritance framing in `skills/superfluid/references/guides/clear-macro.md`:
- Prerequisite blurb: "Clear Macro extends that system" → "Clear Macro is the successor
  that builds on the same macro pattern."
- "What is Clear Macro" intro: now states explicitly that `ClearMacroForwarder` does not
  inherit `BlindMacroForwarder`; both independently extend `ForwarderBase`, and Clear is
  the successor adding four capabilities Blind lacks.

Left accurate inheritance language untouched (`IClearMacro` extends `IMacro`; macro authors
extend `ClearMacroBase`; `MacroForwarder extends the forwarder pattern` in `architecture.md`).

Bumped version 1.2.0 → 1.2.3 in all four required locations:
- `.claude-plugin/plugin.json` — source of truth (`version` field)
- `.claude-plugin/marketplace.json` — `plugins[0].version`
- `skills/superfluid/SKILL.md` — frontmatter `metadata.version`
- `landing-page/index.html` — version badge text

Verified with `grep -rn "1\.2\.3"` across all four files; no stray `1.2.0` remains.
