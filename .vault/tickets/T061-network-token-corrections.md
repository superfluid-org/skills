---
status: done
priority: normal
tags: [bug, contracts, skill]
created: 2026-10-27
resolved: 2026-10-27
---

# T061 — Network lists, Arc native-asset gotcha, canonical wrapper removal, flowing-balance dust guard

## Problem

- `deployments:` blocks still listed `degenchain` and `scroll-sepolia` (removed in
  `@superfluid-finance/metadata` 1.6.4) and none listed `arc-mainnet` (1.6.5) or `arc-testnet` (1.6.4).
- SKILL.md and `SuperToken.abi.yaml` implied every network has a Native Asset Super Token.
  Arc mainnet has none: USDCx wraps the 6-decimal USDC ERC-20 at `0x3600…0000`. Arc testnet USDCx
  is Native Asset, so testnet-tested code picks the wrong wrap path on mainnet.
- `SuperTokenFactory.abi.yaml` documented the canonical wrapper API (`createCanonicalERC20Wrapper`,
  `computeCanonicalERC20WrapperAddress`, `getCanonicalERC20Wrapper`,
  `initializeCanonicalWrapperSuperTokens`), removed in ethereum-contracts v1.15.3.
- `useFlowingDecimalPoint` in `flowing-balances.md` threw `Cannot convert undefined to a BigInt` when a
  dust flow rate truncated to 0 per tick (`formatEther(0n)` is `"0"`, no fractional part).

## Resolution

Files changed:
- `references/contracts/{BatchLiquidator,CFAv1Forwarder,ClearMacroForwarder,ConstantFlowAgreementV1,GDAv1Forwarder,GeneralDistributionAgreementV1,InstantDistributionAgreementV1,SuperTokenFactory,Superfluid,TOGA}.abi.yaml`:
  `deployments:` only. Removed `degenchain`/`scroll-sepolia`, added `arc-mainnet`/`arc-testnet` where metadata
  lists the contract (TOGA: arc-mainnet only). All 14 files with metadata-backed blocks (incl.
  FlowScheduler, VestingSchedulerV3, AutoWrap*) now match 1.6.5 exactly; no other drift.
- `SuperTokenFactory.abi.yaml`: removed the 4 canonical wrapper functions, their header text, and the 4
  errors only they used; added `meta.notes` (removed in v1.15.3 / `@sfpro/sdk` 0.3.x, npm `latest` may be
  1.15.2). Regenerated `SuperTokenFactory.selectors.yaml` only.
- `SuperToken.abi.yaml`: header, glossary and `meta.notes` no longer imply universal SETH.
- `SKILL.md`: Super Token variants sentence, new Common Gotchas entry.
- `guides/flowing-balances.md`: `!afterDecimal` guard in the hook plus a step in the algorithm prose.
  The Vue/Svelte/Solid sections are prose pointers with no hook copy, so nothing to port.

Sources verified:
- metadata 1.6.5 `networks.json` and `CHANGELOG.md`; script diffed every block (0 missing/extra/different).
- `cast` via rpc-endpoints.superfluid.dev: arc-mainnet USDCx `getUnderlyingToken()` = `0x3600…`, 6 decimals,
  `upgradeByETH` reverts; arc-testnet USDCx `getUnderlyingToken()` = `0x0`, `upgradeByETH` succeeds.
  Tokenlist `superTokenInfo.type` is `Wrapper` (5042) vs `Native Asset` (5042002); testnet
  `underlyingTokenAddress` is still `0x3600…`, so rely on `type`/`getUnderlyingToken()`.
- ethereum-contracts `CHANGELOG.md` v1.15.3 (Breaking) and `ISuperTokenFactory.sol` on `dev`; `cast` on Base:
  `getCanonicalERC20Wrapper` and `computeCanonicalERC20WrapperAddress` revert, `createERC20Wrapper` works.
  npm `latest` of ethereum-contracts is 1.15.2, `@sfpro/sdk` latest 0.3.1.
- Dust crash reproduced with viem (`1n` at 60ms and 400ms throws); guarded version returns 0, identical
  results for non-dust rates.
