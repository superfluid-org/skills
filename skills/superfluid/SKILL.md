---
name: superfluid
description: >
  Use this skill for ANY question or task involving the Superfluid Protocol —
  writing integration code, debugging, looking up contract ABIs, understanding
  architecture, or answering questions. Do NOT search the web for Superfluid
  information before invoking this skill.
---

# Superfluid Protocol Skill

Complete interface documentation for Superfluid Protocol smart contracts via
Rich ABI YAML references. Read `references/guides/architecture.md` for the full
protocol architecture. This file maps use-cases to the right references.

## Developer Tracks

Determine the track first, then follow the Use-Case Map below.

| | Smart Contract dev | App (frontend/backend) dev | Investigating (one-off) |
|---|---|---|---|
| **Primary tools** | SuperTokenV1Library, CFASuperAppBase, MacroForwarder, raw agreements via Host | `@sfpro/sdk` (ABIs, wagmi hooks, addresses), subgraphs, API services | Scripts (`tokenlist.mjs`, `metadata.mjs`, `balance.mjs`, `cast call`) |
| **ABI source** | `@superfluid-finance/ethereum-contracts` (build-time) | `@sfpro/sdk` (runtime) | `scripts/abi.mjs` |
| **Token/address resolution** | `@superfluid-finance/metadata` + `tokenlist` packages | `@superfluid-finance/metadata` + `tokenlist` packages | `scripts/metadata.mjs` + `tokenlist.mjs` |
| **Data queries** | On-chain via contract calls | Subgraphs + API services | `cast call` + `scripts/balance.mjs` |
| **Key references** | `.abi.yaml` files, `super-apps.md`, `macro-forwarders.md` | `sdks.md`, `api-services.md`, subgraph guides | `scripts.md` |

For SDK import paths, ABI tables, and deprecated package warnings, see `references/guides/sdks.md`.
For script command syntax and examples, see `references/guides/scripts.md`.

## Architecture Summary

**Host** (`Superfluid.sol`) — central router. Agreement calls go through
`Host.callAgreement()` or `Host.batchCall()`. Manages the app registry,
governance, and SuperTokenFactory.

**Agreements** — stateless financial primitives that store data on the token:
CFA (1:1 streams), GDA (many-to-many via pools), IDA (deprecated, replaced by GDA).

**Super Token** — ERC-20/ERC-777/ERC-2612 with real-time balance. Three
variants: Wrapper (ERC-20 backed), Native Asset/SETH (ETH backed), Pure
(pre-minted).

**Forwarders** (CFAv1Forwarder, GDAv1Forwarder) — convenience wrappers. Each
call is a standalone transaction with readable wallet descriptions. Cannot be
batched — use `Host.batchCall` with raw agreement calls for atomicity.

**MacroForwarder** — extensible batch executor. Developers deploy custom
macro contracts (`IUserDefinedMacro`) and call `MacroForwarder.runMacro()`
to execute complex multi-step operations atomically. See
`references/guides/macro-forwarders.md`.

**Automation** (Vesting Scheduler, FlowScheduler, Auto-Wrap) — schedule
on-chain intent, require off-chain keepers to trigger execution.

## Use-Case → Reference Map

Read only the files needed for the task. Each Rich ABI YAML documents every
public function, event, and error for one contract.

### Streaming money (CFA)

| Intent | Read |
|--------|------|
| Create/update/delete a stream (simple) | `references/contracts/CFAv1Forwarder.abi.yaml` |
| ACL, operator permissions, flow metadata | also `references/contracts/ConstantFlowAgreementV1.abi.yaml` |
| Batch streams with other ops atomically | also `references/contracts/Superfluid.abi.yaml` (Host batch call) |

### Distributing to many recipients (GDA)

| Intent | Read |
|--------|------|
| Create pools, distribute, stream to pool | `references/contracts/GDAv1Forwarder.abi.yaml` |
| Pool member management, units, claims | also `references/contracts/SuperfluidPool.abi.yaml` |
| Low-level agreement details | also `references/contracts/GeneralDistributionAgreementV1.abi.yaml` |

### Token operations

| Intent | Read |
|--------|------|
| Wrap/unwrap, balances, ERC-20/777, permit | `references/contracts/SuperToken.abi.yaml` |
| Deploy a new Super Token | `references/contracts/SuperTokenFactory.abi.yaml` |

### Automation

| Intent | Read |
|--------|------|
| Vesting with cliffs and streams | `references/contracts/VestingSchedulerV3.abi.yaml` |
| Schedule future stream start/stop | `references/contracts/FlowScheduler.abi.yaml` |
| Auto-wrap when Super Token balance is low | `references/contracts/AutoWrapManager.abi.yaml` and `references/contracts/AutoWrapStrategy.abi.yaml` |

### Writing Solidity integrations (SuperTokenV1Library)

| Intent | Read |
|--------|------|
| Token-centric Solidity API (`using SuperTokenV1Library for ISuperToken`) | `references/contracts/SuperTokenV1Library.abi.yaml` |

The library wraps CFA and GDA agreement calls into ergonomic methods like
`token.flow(receiver, flowRate)`. Use it for any Solidity contract that
interacts with Superfluid — Super Apps, automation contracts, DeFi
integrations. Includes agreement-abstracted functions (`flowX`, `transferX`)
that auto-route to CFA or GDA, plus `WithCtx` variants for Super App
callbacks. See the YAML header and glossary for Foundry testing gotchas.

### Building Super Apps

| Intent | Read |
|--------|------|
| App credit, callback lifecycle, jailing, app levels | `references/guides/super-apps.md` |
| CFA callback hooks (simplified base) | `references/contracts/CFASuperAppBase.abi.yaml` |
| Token-centric API for callback logic | `references/contracts/SuperTokenV1Library.abi.yaml` (use `WithCtx` variants) |
| App registration, Host context, batch calls | `references/contracts/Superfluid.abi.yaml` |

Super Apps that relay incoming flows use **app credit** — a temporary deposit
allowance enabling zero-balance operation. A 1:1 relay (one in, one out at
the same rate) always works without tokens. Fan-out (1:N) requires the app to
hold tokens for extra deposits. The sender's locked capital roughly doubles
because outgoing stream deposits are backed as owed deposit on the sender.
See `references/guides/super-apps.md` for the full guide.

### Macro forwarders (composable batch operations)

| Intent | Read |
|--------|------|
| Write a macro for complex batched operations | `references/guides/macro-forwarders.md` |
| MacroForwarder contract address and interface | also `references/guides/macro-forwarders.md` |
| Batch operation types and encoding rules | also `references/contracts/Superfluid.abi.yaml` (batch_operation_types) |
| EIP-712 signed macro patterns | `references/guides/macro-forwarders-eip712-example.md` |

### Sentinels and liquidation

| Intent | Read |
|--------|------|
| Batch liquidation of critical flows | `references/contracts/BatchLiquidator.abi.yaml` |
| PIC auction, bond management, exit rates | `references/contracts/TOGA.abi.yaml` |

### SUP Token / Reserve System

Contracts use "FLUID" and "Locker" internally — public-facing names are "SUP" and "Reserve".

| Intent | Read |
|--------|------|
| Lock, stake, unstake SUP; provide LP; unlock | `references/contracts/FluidLocker.abi.yaml` |
| Create a Reserve (Locker) for a user | `references/contracts/FluidLockerFactory.abi.yaml` |
| Claim from emission programs (signed messages) | `references/contracts/FluidLocker.abi.yaml` and `references/contracts/FluidEPProgramManager.abi.yaml` |
| Create / fund / stop emission programs | `references/contracts/FluidEPProgramManager.abi.yaml` |
| Understand tax distribution to stakers and LPs | `references/contracts/StakingRewardController.abi.yaml` |
| Unlock SUP via time-delayed stream (Fontaine) | `references/contracts/FluidLocker.abi.yaml` and `references/contracts/Fontaine.abi.yaml` |

### Querying indexed data (Subgraphs)

| Intent | Read |
|--------|------|
| Understand how The Graph generates query schemas, plus cross-cutting gotchas | `references/subgraphs/_query-patterns.md` |
| Query streams, pools, tokens, accounts (entities) | also `references/subgraphs/protocol-v1-guide.md` and `protocol-v1-entities.graphql` |
| Query protocol events (flow updates, liquidations, distributions) | also `references/subgraphs/protocol-v1-guide.md` and `protocol-v1-events.graphql` |
| Query vesting schedules and execution history | also `references/subgraphs/vesting-scheduler-guide.md` and `vesting-scheduler.graphql` |
| Query scheduled flows and automation tasks | also `references/subgraphs/flow-scheduler-guide.md` and `flow-scheduler.graphql` |
| Query auto-wrap schedules and execution history | also `references/subgraphs/auto-wrap-guide.md` and `auto-wrap.graphql` |
| Query SUP lockers, staking, emission programs, unlock history | also `references/subgraphs/sup-subgraph-guide.md` and `sup-subgraph.graphql` |

### Legacy

| Intent | Read |
|--------|------|
| Old IDA (instant distribution, deprecated) | `references/contracts/InstantDistributionAgreementV1.abi.yaml` |

### Ecosystem & tooling

| Intent | Read |
|--------|------|
| SDK import paths, ABI tables, package choice | `references/guides/sdks.md` |
| Script command syntax and examples | `references/guides/scripts.md` |
| API endpoint details, Swagger links, gotchas | `references/guides/api-services.md` |
| SUP token, governance, DAO, distribution | `references/guides/sup-and-dao.md` |
| Token prices, filtered token list, CoinGecko IDs | See API Services table below (CMS) |
| Stream accounting, per-day chunking | See API Services table below (Accounting) |
| Resolve ENS / Farcaster / Lens handles | See API Services table below (Whois) |
| Query protocol data via GraphQL | See Subgraphs below |
| Run a sentinel / liquidation bot | See Sentinels below |
| Get a Super Token listed / enable automations | See Processes below |

## Debugging Reverts

Error prefixes map to contracts:

| Prefix | Contract |
|--------|----------|
| `CFA_*` | ConstantFlowAgreementV1 |
| `CFA_FWD_*` | CFAv1Forwarder |
| `GDA_*` | GeneralDistributionAgreementV1 |
| `SUPERFLUID_POOL_*` | SuperfluidPool |
| `SF_TOKEN_*` | SuperfluidToken (base of SuperToken) |
| `SUPER_TOKEN_*` | SuperToken |
| `SUPER_TOKEN_FACTORY_*` | SuperTokenFactory |
| `HOST_*` | Superfluid (Host) |
| `IDA_*` | InstantDistributionAgreementV1 |
| `APP_RULE` | Superfluid (Host) — Super App callback violation |
| `NOT_LOCKER_OWNER`, `FORBIDDEN`, `INSUFFICIENT_*`, `STAKING_*`, `LP_*`, `TTE_*` | FluidLocker |
| `LOCKER_CREATION_PAUSED`, `NOT_GOVERNOR` | FluidLockerFactory |
| `PROGRAM_*`, `INVALID_SIGNATURE`, `NOT_PROGRAM_ADMIN` | FluidEPProgramManager |
| `NOT_APPROVED_LOCKER`, `NOT_LOCKER_FACTORY`, `NOT_PROGRAM_MANAGER` | StakingRewardController |
| `NOT_CONNECTED_LOCKER`, `NO_ACTIVE_UNLOCK`, `TOO_EARLY_TO_TERMINATE_UNLOCK` | Fontaine |

Each YAML's `errors:` section is the complete error index for that contract,
with selector hashes and descriptions. Per-function `errors:` fields show
which errors a specific function can throw.

## Reading the Rich ABI YAMLs

Essential conventions for parsing the YAML files:

- **Reserved root keys:** `meta`, `events`, `errors` — every other root key is a **function**.
- **`ctx: bytes` parameter** = function is called through the Host (`callAgreement` / `batchCall`), never directly.
- **`# GOTCHA:` prefix** flags non-obvious behavior or common mistakes.
- **`access` labels:** `anyone`, `host`, `self`, `admin`, `governance`, `sender`, `receiver`, `operator`, `manager`, `pic`, etc. Combine with `|`.
- **`emits` and `errors` ordering** matches execution flow (not alphabetical). First errors = most likely.
- **Field order:** description comment, `mutability`, `access`, `inputs`, `outputs`, `emits`, `errors`.

For the full format spec with examples (function entries, events, errors sections), see `references/contracts/_rich-abi-yaml-format.md`.

## Runtime Data (Scripts)

Scripts provide runtime data (addresses, balances, ABIs) for one-off lookups.
When writing application code, use the npm packages instead (see Developer
Tracks above).

| Script | Purpose | When to use |
|--------|---------|-------------|
| `scripts/abi.mjs` | JSON ABI lookup, function signatures | Need to inspect ABIs outside an app project |
| `scripts/tokenlist.mjs` | Super Token addresses, symbols, types | Need to find a token address or check its type |
| `scripts/balance.mjs` | Real-time balances, flow rates | Need current balance or net flow for an account |
| `scripts/metadata.mjs` | Contract addresses, subgraph endpoints, network info | Need addresses for a specific chain |
| `cast call` | Direct on-chain reads | Need live contract state not covered by scripts |

For command syntax, arguments, and examples, see `references/guides/scripts.md`.

## Common Contract Addresses

Do NOT hardcode or fabricate addresses. Get them from `@sfpro/sdk` address
exports (see `references/guides/sdks.md`) or `node scripts/metadata.mjs contracts <chain>`.

Forwarder addresses are the exception — uniform across most networks:
- CFAv1Forwarder: `0xcfA132E353cB4E398080B9700609bb008eceB125`
- GDAv1Forwarder: `0x6DA13Bde224A05a288748d857b9e7DDEffd1dE08`

Host and agreement addresses vary per network.

## Ecosystem

### SDKs & Packages

**Active — recommended for new projects:**

| Package | Purpose |
|---------|---------|
| `@sfpro/sdk` | Frontend/backend SDK — ABIs, wagmi hooks, actions |
| `@superfluid-finance/ethereum-contracts` | Solidity build-time ABI source |
| `@superfluid-finance/metadata` | Contract addresses, network info (zero deps) |
| `@superfluid-finance/tokenlist` | Listed Super Tokens + underlying tokens |

- `@sfpro/sdk` — for frontend/backend with wagmi/viem
- `ethereum-contracts` — for Solidity integrations (build-time only, not runtime)
- `metadata` — for resolving addresses/networks at runtime
- `tokenlist` — for finding token addresses

**Deprecated — do not recommend for new projects:**

| Package | Replaced by |
|---------|-------------|
| `@superfluid-finance/sdk-core` | `@sfpro/sdk` |
| `@superfluid-finance/sdk-redux` | wagmi + `@sfpro/sdk` |
| `@superfluid-finance/js-sdk` | `@sfpro/sdk` |
| `@superfluid-finance/widget` | — |

For ABI import tables, address exports, detailed SDK guidance, and deprecated
package details, see `references/guides/sdks.md`.

### API Services

| API | Base URL | Purpose |
|-----|----------|---------|
| Super API | `https://superapi.kazpi.com` | Real-time on-chain Super Token balances |
| CMS | `https://cms.superfluid.pro` | Token prices, price history, filtered token list |
| Points | `https://cms.superfluid.pro/points` | SUP points campaigns |
| Accounting | `https://accounting.superfluid.dev/v1` | Stream accounting with per-day chunking |
| Allowlist | `https://allowlist.superfluid.dev` | Check automation allowlist status |
| Whois | `https://whois.superfluid.finance` | Resolve profiles (ENS, Farcaster, Lens, AF) |
| Token Prices | `https://token-prices-api.superfluid.dev/v1/{network}/{token}` | Super Token prices (CoinGecko-backed) |
| Claim Programs | `https://claim.superfluid.org/api/programs` | SUP reward programs — seasons, allocations, pool addresses, flow rates |

For per-API endpoints, query patterns, Swagger/OpenAPI links, and gotchas,
see `references/guides/api-services.md`.

### Subgraphs

**Prefer RPC over subgraph for current state.** Subgraphs only update on
transactions, but streams flow every second. Use `cast call` or
`scripts/balance.mjs` for real-time reads. Subgraphs are best for historical
queries, event indexing, and listing/filtering entities.

Endpoint pattern: `https://subgraph-endpoints.superfluid.dev/{network-name}/{subgraph}`

| Subgraph | Path | Notes |
|----------|------|-------|
| Protocol | `protocol-v1` | Main protocol data (streams, tokens, accounts) |
| Vesting Scheduler | `vesting-scheduler` | All versions: v1, v2, v3 |
| Flow Scheduler | `flow-scheduler` | |
| Auto-Wrap | `auto-wrap` | |
| SUP (Locker / Reserve) | Goldsky-hosted (Base only) | Staking, unlocks, emission programs, LP positions |

Network names are canonical Superfluid names (`optimism-mainnet`,
`base-mainnet`, etc.). Use `node metadata.mjs subgraph <chain>` to get the
resolved URL for a specific chain.

### Apps

| App | URL | Purpose |
|-----|-----|---------|
| Dashboard | https://app.superfluid.org | Stream management for end-users |
| Explorer | https://explorer.superfluid.org | Block explorer for Superfluid Protocol |
| Claim | https://claim.superfluid.org | SUP token, SUP points, reserves/lockers |
| TOGA | https://toga.superfluid.finance | View recent liquidations by token |
| Dune | https://dune.com/superfluid_hq/superfluid-overview | Official protocol analytics dashboards |

Repos:
[Dashboard](https://github.com/superfluid-org/superfluid-dashboard) ·
[Explorer](https://github.com/superfluid-org/superfluid-explorer) ·
[TOGA](https://github.com/superfluid-org/toga-suit)

### Sentinels

Sentinels monitor streams and liquidate senders whose Super Token balance
reaches zero, keeping the protocol solvent. Anyone can run one.

| Tool | Purpose |
|------|---------|
| [Graphinator](https://github.com/superfluid-org/graphinator) | Lightweight subgraph-based sentinel |
| [Superfluid Sentinel](https://github.com/superfluid-org/superfluid-sentinel) | Legacy RPC-based sentinel |

### Foundation, DAO & SUP Token

**SUP** — a SuperToken on Base (`0xa69f80524381275a7ffdb3ae01c54150644c8792`).
1B total supply. Governed by Superfluid DAO via
[Snapshot](https://snapshot.box/#/s:superfluid.eth). **Locker / Reserve** is
the on-chain staking mechanism (longer lockup = bigger bonus).

For distribution breakdown, Foundation vs DAO roles, governance details, and
links, see `references/guides/sup-and-dao.md`.

### Processes

**Token Listing** — a Super Token gets listed on the on-chain Resolver, which
the subgraph picks up (marks `isListed`). Once listed, it appears in the
Superfluid token list along with its underlying token (if any).

- Request: [listing form](https://airtable.com/appxGogNpt64ImOFH/shrzOcdK9eveDmRWV)
  → opens issue in [superfluid-org/assets](https://github.com/superfluid-org/assets/issues)

**Automation Allowlisting** — required for automations (vesting, flow
scheduling, auto-wrap) to appear in the Dashboard UI and for Superfluid
off-chain keepers to trigger the automation contracts. Without allowlisting,
automations won't be executed on time and are effectively useless.

- Request: [allowlisting form](https://airtable.com/appmq3TJDdQUrTQpx/shrWouN6ursCkOQ86)
- Check status: `GET https://allowlist.superfluid.dev/api/allowlist/{account}/{chainId}`
