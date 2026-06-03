---
status: done
priority: normal
tags: [skill, guide, contracts, enhancement]
created: 2026-06-04
resolved: 2026-06-04
---

# T049 — Clear Macro guide + Rich ABI YAMLs

## Problem

Developers needed structured knowledge about Clear Macro (EIP-712 clear signing, relaying, gasless
transactions) to use it correctly. The base MacroForwarder guide existed but did not cover the Clear
Macro extension contracts or the off-chain Provider API.

## Resolution

- Created `skills/superfluid/references/guides/clear-macro.md` with a TESTNET/FORWARD-LOOKING banner
  (OP Sepolia 11155420 only, PR #2148 possibly unmerged), covering:
  - Five value props vs base MacroForwarder
  - On-chain contracts: `ClearMacroForwarderV1`, `IClearMacro`, `ClearMacroForwarderV1WithPermit2`,
    `DashboardClearMacro` example @ `0x77232a2a953b570d1fee1fe16b1902299fe7b898`
  - Off-chain Provider API (capabilities / relay-executions / poll endpoints)
  - Dapp integration flow (numbered steps)
  - Links & Source section
- Cross-linked from `macro-forwarders.md` (What & Why + Links sections)
- Created `ClearMacroForwarderV1.abi.yaml` (11 public functions + events/errors, field-order
  convention, meta block flagging testnet/OP-Sepolia + deployment address)
- Created `IClearMacro.abi.yaml` (3 EIP-712 extension functions + inherited `IUserDefinedMacro`
  surface)
- Did NOT add to `abi.mjs`/`selectors.mjs` `ABI_MAP` — `@sfpro/sdk` does not yet export these ABIs
- Added `ClearMacroForwarderV1` and `IClearMacro` ABI signature arrays to `NON_SDK_ABIS` in
  `selectors.mjs:157` (same mechanism as `CFASuperAppBase`)
- Generated `ClearMacroForwarderV1.selectors.yaml` and `IClearMacro.selectors.yaml` via
  `selectors.mjs generate`
- Wired into SKILL.md: Use-Case Map, Debugging Reverts, Apps section

## Key decision

Selectors authored via `NON_SDK_ABIS` hardcoded path (not SDK `ABI_MAP`) because `@sfpro/sdk` does
not yet export `ClearMacroForwarderV1`. When it lands in the SDK, migrate to `ABI_MAP` and `abi.mjs`
and remove the testnet banner.
