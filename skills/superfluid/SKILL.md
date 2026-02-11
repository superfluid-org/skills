---
name: superfluid
description: >
  Superfluid Protocol expert — smart contract interfaces, integration code, and
  debugging for the Superfluid real-time finance protocol on EVM chains. Trigger
  on: Superfluid, Super Tokens, money streaming, CFA, GDA, IDA, pools, flow
  rates, real-time balance, sentinel, TOGA, liquidation, or any Superfluid
  contract name. Also trigger on Solidity/TypeScript/JavaScript code that
  interacts with Superfluid contracts, debugging Superfluid reverts, or mentions
  of "streaming payments" / "real-time finance" on EVM.
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
CFA (1:1 streams), GDA (1:many via pools), IDA (deprecated, replaced by GDA).

**Super Token** — ERC-20/ERC-777/ERC-2612 with real-time balance. Three
variants: Wrapper (ERC-20 backed), Native Asset/SETH (ETH backed), Pure
(pre-minted).

**Forwarders** (CFAv1Forwarder, GDAv1Forwarder) — convenience wrappers. Each
call is a standalone transaction with readable wallet descriptions. Cannot be
batched — use `Host.batchCall` with raw agreement calls for atomicity.

**Automation** (VestingSchedulerV3, FlowScheduler, AutoWrapManager) — schedule
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

### Building Super Apps

| Intent | Read |
|--------|------|
| CFA callback hooks (simplified base) | `references/contracts/CFASuperAppBase.rich-abi.yaml` |
| App registration, Host context, batch calls | `references/contracts/Superfluid.rich-abi.yaml` |

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

The Rich ABIs document **interfaces** (what to call and how). Two scripts
provide the **runtime data** (what to call it on) by wrapping the canonical
npm packages with local caching for offline use. No npm install required —
the scripts fetch from CDN equivalents of the packages.

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

## Common Contract Addresses

Forwarder addresses are uniform across most networks:
- CFAv1Forwarder: `0xcfA132E353cB4E398080B9700609bb008eceB125`
- GDAv1Forwarder: `0x6DA13Bde224A05a288748d857b9e7DDEffd1dE08`

Host and agreement addresses vary per network — check `meta.deployments` in
each YAML or use `node scripts/metadata.mjs contracts <chain>`.
