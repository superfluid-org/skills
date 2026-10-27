---
status: done
priority: normal
tags: [contracts, skill, enhancement]
created: 2026-10-27
resolved: 2026-10-27
---

# T062 — API additions and ethereum-contracts v1.15.3 protocol changes

## Problem

- Points API: the skill had two links only. Claim code depends on the per-campaign cap
  (`cappedPoints` / `uncappedPoints`), the batch endpoints, `campaignId` (replacing
  `campaign`) and the absolute, permissionless on-chain claim.
- SUP metrics API (`sup-metrics-api.superfluid.dev`) was not mentioned.
- Claim Programs API is now CORS-open and returns fields the skill did not list.
- ethereum-contracts v1.15.3 (GitHub release 2026-10-01; npm `latest` still 1.15.2)
  soft-froze IDA, changed Super App callback limits and switched CFA/GDA liquidation
  to account-level `totalDeposit`. The IDA, Host, CFA, GDA YAMLs and `super-apps.md`
  documented the old behaviour.

## Resolution

Files changed:
- `references/guides/api-services.md`: Points section (endpoints, cap semantics, claim
  gotcha), new SUP Metrics section, Claim Programs CORS line and `subsidyFlowRate` /
  `programDuration` fields.
- `SKILL.md`: SUP Metrics line in `### API Services`.
- `FluidLocker.abi.yaml`: `claim` gotcha (units set absolutely to signed points;
  compare capped points with pool units), batch `claim` signature source.
- `InstantDistributionAgreementV1.abi.yaml`: soft-freeze header, `IDA_NEW_ACTIVITY_FROZEN`
  on the five frozen functions, `IDA_TOO_MANY_SUBSCRIPTIONS` on `approveSubscription`,
  `NEW_ACTIVITY_FROZEN` getter, `MAX_NUM_SUBSCRIPTIONS` values.
- `Superfluid.abi.yaml`: `CALLBACK_GAS_LIMIT` per-network values and shared stipend,
  callback signature note, `HOST_CALLBACK_CONTEXT_TOO_LARGE`, returndata cap on code 22.
- `references/guides/super-apps.md`: "Callback Limits" subsection, code 22 wording.
- `ConstantFlowAgreementV1.abi.yaml` (`deleteFlow`), `GeneralDistributionAgreementV1.abi.yaml`
  (`distributeFlow`): account-level solvency note; GDA `GDA_FLOW_DOES_NOT_EXIST` on liquidation.

Selector sidecars not regenerated: `@sfpro/sdk` 0.3.1 still ships the pre-v1.15.3 Host
and IDA ABIs (4-arg `callAppBefore/AfterCallback`, no new errors), so `generate` cannot
reflect these additions. Its unrelated drift (SafeCast errors, SuperTokenFactory) was
discarded. New selectors from source comments: `HOST_CALLBACK_CONTEXT_TOO_LARGE`
0x62a06f45, `IDA_NEW_ACTIVITY_FROZEN` 0xace0382a, `IDA_TOO_MANY_SUBSCRIPTIONS` 0x6db410ea;
new callbacks `callAppBeforeCallback(address,bytes,bool,bytes,uint256)` 0x9444db93,
`callAppAfterCallback(...,uint256)` 0xdb93aa53.

Sources verified:
- `https://cms.superfluid.pro/points/openapi.json` (paths, schemas, description, changelog).
- `https://sup-metrics-api.superfluid.dev/swagger.json`, `/docs` (200) and live
  `/v1/dao_members_count`, `/v1/circulating`, `/v1/total_delegated_score`, `/v1/config`.
  `distribution_metrics_2` omitted (alternative calculation of the same metrics).
- `https://claim.superfluid.org/api/programs`: GET and OPTIONS return
  `Access-Control-Allow-Origin: *`; 80 entries carry `subsidyFlowRate`, `programDuration`.
  `totalAllocatedHint` is also returned but left out (allocation hints are flagged
  do-not-publish in the research report).
- sup-token `dev` `FluidEPProgramManager.sol`: `updateMemberUnits(locker, stackPoints)`.
- protocol-monorepo `packages/ethereum-contracts/CHANGELOG.md` [v1.15.3], PRs #2221, #2225,
  #2227, #2228, #2230, and source at tag `ethereum-contracts@v1.15.3`. PR #2225's body says
  `approveSubscription` stays available; the merged code and CHANGELOG freeze it.

On-chain checks (2026-10-27, `rpc-endpoints.superfluid.dev`, all 16 networks in
metadata 1.6.5):
- Host logic contains `HOST_CALLBACK_CONTEXT_TOO_LARGE` and the 5-arg callback selector
  everywhere; CFA logic calls the 5-arg callback everywhere (v1.15.3 Host/CFA/IDA set).
- `CALLBACK_GAS_LIMIT`: 3M eth-mainnet, scroll-mainnet; 7.5M avalanche-c, avalanche-fuji;
  8.5M xdai-mainnet; 12M base-mainnet, optimism-mainnet, arbitrum-one, polygon-mainnet,
  celo-mainnet, bsc-mainnet, arc-mainnet, eth-sepolia, base-sepolia, optimism-sepolia,
  arc-testnet.
- IDA `NEW_ACTIVITY_FROZEN` / `MAX_NUM_SUBSCRIPTIONS`: false / 32 on optimism-mainnet and
  optimism-sepolia; true / 256 on all others.
- Account-level solvency, checked on the 10 mainnets in scope plus optimism-sepolia: for a
  CFA-only sender (GDA deposit 0), GDA `isPatricianPeriod` at a timestamp just past
  insolvency returns true, matching CFA. Pre-v1.15.3 GDA logic returns false there (it used
  only the GDA buffer).
