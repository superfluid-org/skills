---
status: done
priority: high
tags: [contracts, scripts, enhancement]
created: 2026-03-23
resolved: 2026-03-23
---

# T040: Update to @sfpro/sdk 0.2.0 and add yield backend support

Update the skill to reflect @sfpro/sdk 0.2.0 (ethereum-contracts 1.15.0) which adds yield backend support, and add the SUP contract category to the ABI resolver.

## Scope

### SuperToken.abi.yaml — Yield backend
- Remove "yield backend omitted" comment
- Add `enableYieldBackend`, `disableYieldBackend`, `getYieldBackend`, `withdrawSurplusFromYieldBackend` functions
- Add `YieldBackendEnabled`, `YieldBackendDisabled` events
- Add `VERSION` view function
- Add `IYieldBackend.sol` to `meta.source`
- Add `meta.yield_backends` with links to 4 implementations (Aave, AaveETH, ERC4626, Spark)

### abi.mjs — SUP contracts
- Add 7 SUP contracts to `ABI_MAP`: Fontaine, FluidLocker, FluidLockerFactory, FluidEPProgramManager, StakingRewardController, SUPToken, SUPVestingFactory
- Add 13 aliases (sup, locker, staking, fontaine, etc.)

### sdks.md — Contract table updates
- Add Governance row (already in abi.mjs, was missing from docs)
- Add all 7 SUP contract rows
- Add `governanceAddress` and SUP address exports to address table

## Resolution

All changes implemented and verified against `@sfpro/sdk@0.2.0`. All 7 SUP ABI exports confirmed present. Yield backend functions confirmed in SDK's SuperToken ABI.
