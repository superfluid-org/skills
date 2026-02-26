# Runtime Data Scripts

The Rich ABIs document **interfaces** (what to call and how). Scripts provide
**runtime data** (what to call it on) by wrapping canonical npm packages with
local caching for offline use. No npm install required — the scripts fetch
from CDN equivalents of the packages.

All scripts are in `skills/superfluid/scripts/`.

---

## ABI JSON — `abi.mjs`

Source: [`@sfpro/sdk`](https://sdk.superfluid.pro/docs) package.

```
node abi.mjs <contract>               Full JSON ABI
node abi.mjs <contract> <function>    Single fragment by name
node abi.mjs list                     All contracts with SDK import info
```

Accepts YAML names (`CFAv1Forwarder`) and short aliases (`cfa`, `host`,
`pool`, `token`, `vesting`, etc.).

The script maps the same contracts as `@sfpro/sdk` — it's a convenience for
inspecting or inlining ABIs without having a project set up. When writing
application code, import ABIs and addresses from `@sfpro/sdk` instead — see
`references/guides/sdks.md` for import paths.

---

## Token list — `tokenlist.mjs`

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

---

## Super Token balance — `balance.mjs`

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

---

## Network metadata — `metadata.mjs`

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

---

## On-chain reads — `cast call`

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
