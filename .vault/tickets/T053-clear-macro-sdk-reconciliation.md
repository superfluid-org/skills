---
status: done
priority: high
tags: [skill, contracts, scripts, enhancement]
created: 2026-06-08
resolved: 2026-06-08
---

# T053 — Clear Macro SDK reconciliation

## Problem

A prior autonomous run (T049) documented `ClearMacroForwarder` from an **unmerged PR (#2148) on OP
Sepolia testnet**, routing through the `NON_SDK_ABIS` workaround in `selectors.mjs`. The feature has
since **shipped**: `@sfpro/sdk` 0.2.1 exports the forwarders, the PR is merged to `dev`, and the
contract is deployed at a deterministic address across **16 networks** — not testnet-only.

The documentation currently gives false (testnet-only) and incomplete guidance for a now-released
contract.

## Scope and decisions

- **Canonical skill-facing name:** `ClearMacroForwarder` (drop `V1`/`WithPermit2` from the name;
  note the underlying contract is `ClearMacroForwarderV1WithPermit2`).
- **Plain `runMacro` is first-class;** `runPermit2AndMacro` is an optional bundled Permit2 path,
  NOT the default.
- **Migrate ABI YAML** off `NON_SDK_ABIS` onto the normal SDK `ABI_MAP` path — SDK now exports
  `clearMacroForwarderAbi`.
- **Remove all "TESTNET ONLY / OP Sepolia / PR #2148" framing.**
- **`IClearMacro` stays in `NON_SDK_ABIS`** — it is an interface not exported by the SDK.
- **Legacy `MacroForwarder` = `BlindMacroForwarder`** (SDK export `blindMacroForwarderAbi`).

## SDK verification (confirmed 2026-06-08)

Commands run against `@sfpro/sdk@0.2.1` and `@superfluid-finance/metadata`:

```
bunx -p @sfpro/sdk bun skills/superfluid/scripts/abi.mjs list
```
=> `clearMacroForwarderAbi` NOT yet in `abi.mjs` ABI_MAP (will be added in Task 5).

SDK generated file (`dist/abi/generated.js`) confirms:
- `clearMacroForwarderAbi` — exported ✓
- `clearMacroForwarderAddress` — `0xC1EaB73855155D4e021f7EB4f866996Bac2fe25e` (16 chains: 1, 10,
  56, 100, 137, 8453, 42161, 42220, 43113, 43114, 84532, 534351, 534352, 11155111, 11155420,
  666666666) ✓
- `blindMacroForwarderAbi` — exported ✓
- `blindMacroForwarderAddress` — `0xFD0268E33111565dE546af2675351A4b1587F89F` (same 16 chains) ✓

ABI functions confirmed in `clearMacroForwarderAbi`:
- Write: `runMacro`, `runPermit2AndMacro`
- Read/helpers: `getDigest`, `getNonce`, `getPermit2WitnessStructHash`, `getPermit2WitnessTypeString`,
  `encodeParams`, `eip712Domain`
- Constants: `PERMIT2`, `SELF_PROVIDER`
- Events: `MacroExecuted`, `Permit2UpgradeExecuted`, `EIP712DomainChanged`
- Errors: `InvalidNonce`, `InvalidPayload`, `InvalidSignature`, `MacroContractMismatch`,
  `OutsideValidityWindow`, `ProviderNotAuthorized`

`@superfluid-finance/metadata` keys confirmed:
- `contractsV1.clearMacroForwarderV1WithPermit2` ✓
- `contractsV1.macroForwarder` ✓

All Reference section facts in the plan match the live SDK. Proceed with all tasks.

## Resolution

Completed 2026-06-08 via the autonomous ralphex plan `docs/plans/2026-06-08-clearmacroforwarder-sdk-reconciliation.md`.

All 11 tasks completed: ABI YAML renamed and expanded (all 7 functions + PERMIT2/SELF_PROVIDER/Permit2UpgradeExecuted), ClearMacro migrated from NON_SDK_ABIS to SDK ABI_MAP, BlindMacroForwarder added to abi.mjs/selectors.mjs, selector sidecars regenerated, clear-macro guide rewritten end-to-end (Payload shape, EIP-712, self-submit, relay, Permit2 witness), macro-forwarders guide reframed, SKILL.md routing updated, eval cases updated and regression added. Ships as part of the single 1.2.0 release (no separate patch bump).
