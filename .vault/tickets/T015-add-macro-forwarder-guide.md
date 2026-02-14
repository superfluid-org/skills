---
status: done
priority: high
tags: [skill, contracts, enhancement]
created: 2026-02-14
resolved: 2026-02-14
---

# T015 — Add MacroForwarder guide

## Description

Add comprehensive documentation for the MacroForwarder pattern — composable batch operations via user-defined macros (`IUserDefinedMacro`). This includes the core guide (contract interface, batch operation types, encoding rules, client-side viem usage) and a separate EIP-712 signed macro example (SuperBoring).

## Resolution

Created two guide files under `references/guides/`:

- **`macro-forwarders.md`** (~470 lines) — core reference:
  - MacroForwarder contract address, `runMacro` signature, execution flow
  - `IUserDefinedMacro` interface (`buildBatchOperations`, `postCheck`)
  - Complete batch operation types table (1-5, 101-102, 201-202, 301-302)
  - Operation encoding patterns (agreement calls, upgrades, approvals)
  - Client-side usage (viem): basic execution, dry-run simulation, EIP-712 signing
  - Wrap-and-Stream minimal example
  - Security considerations

- **`macro-forwarders-eip712-example.md`** (~450 lines) — advanced example:
  - `EIP712MacroBase` abstract contract (signature verification, action routing)
  - `SB712Macro` (SuperBoring DCA position management) — production code

Updated cross-references:
- `SKILL.md` — added MacroForwarder summary + intent table with routing to both guides
- `architecture.md` — added "MacroForwarder — Extensible Batch Executor" section
- `.vault/Home.md` — added guides directory entry
