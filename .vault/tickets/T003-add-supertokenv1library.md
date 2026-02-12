---
status: done
priority: medium
tags: [spec, contracts, skill, enhancement]
created: 2026-02-12
resolved: 2026-02-12
---

# T003 — Add SuperTokenV1Library Reference

## Problem

The skill documents 16 deployed contracts via Rich ABI YAMLs but has no reference for `SuperTokenV1Library` — a Solidity library (not a contract) with 62 unique function names (~107 functions including overloads) that smart contract developers use via `using SuperTokenV1Library for ISuperToken`.

Without it, the AI can't help write Super Apps or Solidity integrations that use the library's ergonomic API. This is the primary Solidity-facing API for interacting with Superfluid from smart contracts.

**Source**: `SuperTokenV1Library.sol` in `@superfluid-finance/ethereum-contracts` — 2,007 lines, good NatSpec.

## Why Rich ABI YAML Doesn't Fit

- No deployments (it's a Solidity `library`, not a deployed contract)
- No events or errors of its own (delegates to underlying agreements)
- No access control (all functions are `internal`)
- Many overloads with/without `userData` and `ctx` variants

## Options

### Option A: Annotated Source

Include the curated `.sol` file directly in `references/`. Remove private helpers, add `// GOTCHA:` comments.

**Pros**: AI gets exact Solidity signatures for code generation; NatSpec is the single source of truth.
**Cons**: ~700 lines; higher token cost; harder to scan for humans.

### Option B: Markdown Reference

Structured `.md` with function tables by category, prose sections for patterns (agreement abstraction, context threading, Foundry gotchas), cross-references to Rich ABI YAMLs.

**Pros**: Compact; easy to maintain; good for AI reasoning about patterns.
**Cons**: Signatures may drift from upstream; less useful for direct code generation.

### Option C: Rich ABI YAML (adapted)

Adapted `.rich-abi.yaml` using `library: true` in meta, `visibility: internal` on all functions, overloads collapsed by documenting the most complete variant. Follows the existing authoring guide conventions.

**Pros**: Consistent with the other 16 contract references; structured fields parseable by tooling; familiar to AI that already understands the Rich ABI format.
**Cons**: ~550 lines; format was designed for deployed contracts, so some fields are omitted (no deployments, no events/errors sections, no access field).

## Decision

**Option C (Rich ABI YAML)** — chosen for consistency with the existing 17 contract
references. Markdown tables lack structure for AI and aren't human-readable without
a renderer. Annotated source is redundant when the YAML already links to raw source.

All three were prototyped and compared:
- Option A (.sol): 573 lines, 25.5 KB — deleted
- Option B (.md): 230 lines, 13.3 KB — deleted
- Option C (.yaml): 863 lines, 23.6 KB — **kept** → `contracts/SuperTokenV1Library.rich-abi.yaml`

Remaining: wire up SKILL.md with a mapping entry for the library reference.

## Resolution

Created `SuperTokenV1Library.rich-abi.yaml` (Option C, 863 lines) using the adapted Rich ABI YAML format with `library: true` in meta. Covers all 62 unique function names across CFA, GDA, IDA, and token operations. SKILL.md updated with a dedicated section mapping Solidity developers to the library reference.
