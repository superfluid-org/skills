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
Rich ABI YAML references. Read `references/architecture.md` for the full
protocol architecture. This file maps use-cases to the right references and
explains how to read them.

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

**Automation** (Vesting Scheduler, FlowScheduler, Auto-Wrap) — schedule
on-chain intent, require off-chain keepers to trigger execution.

## Use-Case → Reference Map

Read only the files needed for the task. Each Rich ABI YAML documents every
public function, event, and error for one contract.

### Streaming money (CFA)

| Intent | Read |
|--------|------|
| Create/update/delete a stream (simple) | `references/contracts/CFAv1Forwarder.rich-abi.yaml` |
| ACL, operator permissions, flow metadata | also `references/contracts/ConstantFlowAgreementV1.rich-abi.yaml` |
| Batch streams with other ops atomically | also `references/contracts/Superfluid.rich-abi.yaml` (Host batch call) |

### Distributing to many recipients (GDA)

| Intent | Read |
|--------|------|
| Create pools, distribute, stream to pool | `references/contracts/GDAv1Forwarder.rich-abi.yaml` |
| Pool member management, units, claims | also `references/contracts/SuperfluidPool.rich-abi.yaml` |
| Low-level agreement details | also `references/contracts/GeneralDistributionAgreementV1.rich-abi.yaml` |

### Token operations

| Intent | Read |
|--------|------|
| Wrap/unwrap, balances, ERC-20/777, permit | `references/contracts/SuperToken.rich-abi.yaml` |
| Deploy a new Super Token | `references/contracts/SuperTokenFactory.rich-abi.yaml` |

### Automation

| Intent | Read |
|--------|------|
| Vesting with cliffs and streams | `references/contracts/VestingSchedulerV3.rich-abi.yaml` |
| Schedule future stream start/stop | `references/contracts/FlowScheduler.rich-abi.yaml` |
| Auto-wrap when Super Token balance is low | `references/contracts/AutoWrapManager.rich-abi.yaml` and `references/contracts/AutoWrapStrategy.rich-abi.yaml` |

### Writing Solidity integrations (SuperTokenV1Library)

| Intent | Read |
|--------|------|
| Token-centric Solidity API (`using SuperTokenV1Library for ISuperToken`) | `references/libraries/SuperTokenV1Library.rich-abi.yaml` |

The library wraps CFA and GDA agreement calls into ergonomic methods like
`token.flow(receiver, flowRate)`. Use it for any Solidity contract that
interacts with Superfluid — Super Apps, automation contracts, DeFi
integrations. Includes agreement-abstracted functions (`flowX`, `transferX`)
that auto-route to CFA or GDA, plus `WithCtx` variants for Super App
callbacks. See the YAML header and glossary for Foundry testing gotchas.

### Building Super Apps

| Intent | Read |
|--------|------|
| CFA callback hooks (simplified base) | `references/bases/CFASuperAppBase.rich-abi.yaml` |
| Token-centric API for callback logic | also `references/libraries/SuperTokenV1Library.rich-abi.yaml` (use `WithCtx` variants) |
| App registration, Host context, batch calls | `references/contracts/Superfluid.rich-abi.yaml` |

Super Apps that relay incoming flows via app credit cause the **sender's deposit
to roughly double** (or more for fan-out patterns), because outgoing stream
deposits are backed by the sender as owed deposit. See "App Credit & Deposit
Mechanics" in `references/architecture.md` for the full explanation.

### Sentinels and liquidation

| Intent | Read |
|--------|------|
| Batch liquidation of critical flows | `references/contracts/BatchLiquidator.rich-abi.yaml` |
| PIC auction, bond management, exit rates | `references/contracts/TOGA.rich-abi.yaml` |

### Legacy

| Intent | Read |
|--------|------|
| Old IDA (instant distribution, deprecated) | `references/contracts/InstantDistributionAgreementV1.rich-abi.yaml` |

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

Each YAML's `errors:` section is the complete error index for that contract,
with selector hashes and descriptions. Per-function `errors:` fields show
which errors a specific function can throw.

## Reading the Rich ABI YAMLs

Each YAML is a self-contained contract reference. Here's how to parse them.

### Root structure

```
# Header comment — contract name, description, key notes
meta:             # name, version, source, implements, inherits, deployments
# == Section ==   # Grouped functions (these are the core content)
events:           # All events the contract emits
errors:           # Complete error index
```

Three root keys are reserved: `meta`, `events`, `errors`. Every other
root-level key is a **function**.

### Function entries

```yaml
createFlow:
  # Description of what the function does.
  # GOTCHA: Non-obvious behavior or edge cases.
  mutability: nonpayable     # view | pure | nonpayable | payable
  access: sender | operator  # who can call (omitted for view/pure)
  inputs:
    - token: address
    - receiver: address
    - flowRate: int96        # inline comments for non-obvious params
    - ctx: bytes
  outputs:
    - newCtx: bytes
  emits: [FlowUpdated, FlowUpdatedExtension]   # ordered by emission sequence
  errors: [CFA_FLOW_ALREADY_EXISTS, CFA_INVALID_FLOW_RATE]  # ordered by check sequence
```

Fields appear in this order: description comment, `mutability`, `access`,
`inputs`, `outputs`, `emits`, `errors`. All are omitted when not applicable.

### Key conventions

- **`ctx: bytes` parameter** = function is called through the Host
  (`callAgreement` / `batchCall`), never directly.
- **`access` labels**: `anyone`, `host`, `self`, `admin`, `governance`,
  `sender`, `receiver`, `operator`, `manager`, `pic`, `agreement`,
  `trusted-forwarder`, `factory`, `super-app`. Combine with `|`. Conditional:
  `anyone(if-critical-or-jailed)`.
- **`emits` and `errors` ordering** carries meaning: matches execution flow,
  not alphabetical. First errors in the list are the most likely causes.
- **`# GOTCHA:`** prefix flags non-obvious behavior, common mistakes, or edge
  cases. Pay close attention to these.
- **`meta.source`** is an array of raw GitHub URLs to the Solidity source files
  (implementation, interface, base — filenames are self-documenting).
- **`meta.deployments`** has per-network addresses split into `mainnet` and
  `testnet` subgroups.

### Events section

```yaml
events:
  FlowUpdated:
    indexed:              # log topics (filterable)
      - token: address
      - sender: address
    data:                 # log payload
      - flowRate: int96
```

### Errors section

```yaml
errors:
  # -- Category --
  - SIMPLE_ERROR                    # 0xabcd1234 — description
  - PARAMETERIZED_ERROR:            # errors with diagnostic data
      inputs:
        - value: uint256
```

## Runtime Data (Scripts)

The Rich ABIs document **interfaces** (what to call and how). Scripts provide
**runtime data** (what to call it on) by wrapping canonical npm packages with
local caching for offline use. No npm install required — the scripts fetch
from CDN equivalents of the packages.

### ABI JSON — `@sfpro/sdk` package + `scripts/abi.mjs`

The [`@sfpro/sdk`](https://sdk.superfluid.pro/docs) package provides typed JSON ABIs
for use with viem / wagmi / ethers. ABIs are split across sub-paths:

| Contract (YAML name) | Import path | Export name |
|---|---|---|
| CFAv1Forwarder | `@sfpro/sdk/abi` | `cfaForwarderAbi` |
| GDAv1Forwarder | `@sfpro/sdk/abi` | `gdaForwarderAbi` |
| SuperfluidPool | `@sfpro/sdk/abi` | `gdaPoolAbi` |
| SuperToken | `@sfpro/sdk/abi` | `superTokenAbi` |
| Superfluid (Host) | `@sfpro/sdk/abi/core` | `hostAbi` |
| ConstantFlowAgreementV1 | `@sfpro/sdk/abi/core` | `cfaAbi` |
| GeneralDistributionAgreementV1 | `@sfpro/sdk/abi/core` | `gdaAbi` |
| InstantDistributionAgreementV1 | `@sfpro/sdk/abi/core` | `idaAbi` |
| SuperTokenFactory | `@sfpro/sdk/abi/core` | `superTokenFactoryAbi` |
| BatchLiquidator | `@sfpro/sdk/abi/core` | `batchLiquidatorAbi` |
| TOGA | `@sfpro/sdk/abi/core` | `togaAbi` |
| AutoWrapManager | `@sfpro/sdk/abi/automation` | `autoWrapManagerAbi` |
| AutoWrapStrategy | `@sfpro/sdk/abi/automation` | `autoWrapStrategyAbi` |
| FlowScheduler | `@sfpro/sdk/abi/automation` | `flowSchedulerAbi` |
| VestingSchedulerV3 | `@sfpro/sdk/abi/automation` | `vestingSchedulerV3Abi` |

CFASuperAppBase and SuperTokenV1Library are not in the SDK (abstract base /
Solidity library).

When writing application code, prefer importing from `@sfpro/sdk` over
inlining ABI JSON. Use `scripts/abi.mjs` to inspect or inline ABIs when the
SDK is not a dependency:

```
node abi.mjs <contract>               Full JSON ABI
node abi.mjs <contract> <function>    Single fragment by name
node abi.mjs list                     All contracts with SDK import info
```

Accepts YAML names (`CFAv1Forwarder`) and short aliases (`cfa`, `host`,
`pool`, `token`, `vesting`, etc.).

### Token list — `scripts/tokenlist.mjs`

Source: `@superfluid-finance/tokenlist` npm package.
Resolves Super Token addresses, symbols, and types. Use when you need to find
a specific token address or determine a Super Token's type.

```
node tokenlist.mjs super-token <chain-id> <symbol-or-address>
node tokenlist.mjs by-chain <chain-id> --super
node tokenlist.mjs by-symbol <symbol> [--chain-id <id>]
node tokenlist.mjs by-address <address>
node tokenlist.mjs stats
```

The `superTokenInfo.type` field determines which ABI patterns apply:
- **Wrapper** → `upgrade`/`downgrade` work; `underlyingTokenAddress` is
  provided. Underlying ERC-20 approval uses underlying's native decimals;
  Super Token functions always use 18 decimals.
- **Native Asset** → use `upgradeByETH`/`downgradeToETH` instead.
- **Pure** → `upgrade`/`downgrade` revert; no wrapping.

### Super Token balance — `scripts/balance.mjs`

Source: [Super API](https://superapi.kazpi.com) (real-time on-chain query).
Retrieves the current Super Token balance, net flow rate, and underlying token
balance for any account. No caching — balances are fetched live.

```
node balance.mjs balance <chain-id> <token-symbol-or-address> <account>
```

The output includes:
- **connected/unconnected balance** — wei and human-readable formatted values.
  Connected = streaming balance; unconnected = pending pool distributions.
- **netFlow** — aggregate flow rate in wei/sec and tokens/month (30-day month).
- **maybeCriticalAt** — estimated time when connected balance hits zero.
- **underlyingToken** — the wrapped ERC-20 balance (for Wrapper Super Tokens).

### Network metadata — `scripts/metadata.mjs`

Source: `@superfluid-finance/metadata` npm package.
Resolves contract addresses, subgraph endpoints, and network info for any
Superfluid-supported chain. Use when `meta.deployments` in a YAML doesn't
cover the target chain, or when you need automation/subgraph endpoints.

```
node metadata.mjs contracts <chain-id-or-name>
node metadata.mjs contract <chain-id-or-name> <key>
node metadata.mjs automation <chain-id-or-name>
node metadata.mjs subgraph <chain-id-or-name>
node metadata.mjs networks [--mainnets|--testnets]
```

Contract keys match the field names in the metadata: `host`, `cfaV1`,
`cfaV1Forwarder`, `gdaV1`, `gdaV1Forwarder`, `superTokenFactory`, `toga`,
`vestingSchedulerV3`, `flowScheduler`, `autowrap`, `batchLiquidator`, etc.

### On-chain reads — `cast call`

[`cast`](https://www.getfoundry.sh/cast) performs read-only `eth_call` queries against
any contract. If `cast` is not installed locally, use `bunx @foundry-rs/cast` instead.

**Never use `cast send` or any write/transaction command — read calls only.**

```
cast call <address> "functionName(inputTypes)(returnTypes)" [args] --rpc-url <url>
```

The return types in the second set of parentheses tell cast how to decode the
output. Without them you get raw hex.

**RPC endpoint:** `https://rpc-endpoints.superfluid.dev/{network-name}` — network
names are the canonical Superfluid names from `node metadata.mjs networks`
(e.g. `optimism-mainnet`, `base-mainnet`, `eth-mainnet`).

**Examples:**

```bash
# Total supply of USDCx on Optimism
cast call 0x35adeb0638eb192755b6e52544650603fe65a006 \
  "totalSupply()(uint256)" \
  --rpc-url https://rpc-endpoints.superfluid.dev/optimism-mainnet

# Flow rate via CFAv1Forwarder (address from Common Contract Addresses below)
cast call 0xcfA132E353cB4E398080B9700609bb008eceB125 \
  "getAccountFlowrate(address,address)(int96)" \
  <superTokenAddress> <account> \
  --rpc-url https://rpc-endpoints.superfluid.dev/optimism-mainnet
```

Use `abi.mjs` to look up exact function signatures and `metadata.mjs` /
`tokenlist.mjs` for contract and token addresses.

## Common Contract Addresses

Forwarder addresses are uniform across most networks:
- CFAv1Forwarder: `0xcfA132E353cB4E398080B9700609bb008eceB125`
- GDAv1Forwarder: `0x6DA13Bde224A05a288748d857b9e7DDEffd1dE08`

Host and agreement addresses vary per network — check `meta.deployments` in
each YAML or use `node scripts/metadata.mjs contracts <chain>`.
