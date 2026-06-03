# API Services — Detailed Usage

For the summary table with base URLs, see the main SKILL.md.

---

## Super API

Real-time on-chain Super Token balances (live balance only — no history, reports, or GDA details).
For full history, GDA support, and CSV reports, use the **Balance API** instead.

`GET /super-token-balance?chain={chainId}&token={tokenAddress}&account={accountAddress}`

Returns connected/unconnected balances, net flow rate, and underlying token
details.

Wrapped by `scripts/balance.mjs` — prefer the script for one-off lookups.

[Swagger](https://superapi.kazpi.com/)

## Balance API

Base URL: `https://balances.superfluid.dev` · Read-only, no auth · mainnet + testnet

[Scalar UI](https://balances.superfluid.dev/ui) · [OpenAPI](https://balances.superfluid.dev/doc)

**Disambiguation** — choose the right API for the job:
- **Super API** — single live balance; fast, no history
- **Accounting API** — CFA + ERC-20 only; no GDA support
- **Balance API** — most comprehensive: CFA + GDA + IDA, history, snapshots, reports, CSV export

### Endpoints

- `GET /v1/chains` — list supported chains
- `GET /v1/accounts/{account}/tokens` — all Super Tokens held by an account
- `GET /v1/accounts/{account}/tokens/{token}/counterparties` — all counterparties for a token
- `GET /v1/accounts/{account}/tokens/{token}/balance` — point-in-time balance:
  `connected`, `disconnected`, `total`, `available`, `deposit`, `netFlowRate`, `maybeCriticalAt`
- `GET /v1/accounts/{account}/tokens/{token}/balance-snapshots` — historical snapshots (for charting)
- `GET /v1/accounts/{account}/tokens/{token}/entries` — raw ledger entries
- `GET /v1/accounts/{account}/tokens/{token}/balance-report` — aggregated report:
  params `period` (daily/weekly/monthly), `format` (json|csv), `groupBy` (by_counterparty|by_category),
  `extrapolate` (boolean), `startDate`/`endDate`
- `GET /v1/accounts/{account}/tokens/{token}/movements` — bank-statement view; cursor pagination

## CMS

Can return unlisted Super Tokens (not just those in the tokenlist). Can get
CoinGecko IDs for price lookups.

[Swagger](https://cms.superfluid.pro/api-docs) ·
[OpenAPI](https://cms.superfluid.pro/openapi.json) ·
[Repo](https://github.com/superfluid-org/superfluid.pro/tree/main/cms)

## Points

SUP points campaigns (Stack.so replacement). Same repo as CMS.

[API docs](https://cms.superfluid.pro/points/api-docs) ·
[OpenAPI](https://cms.superfluid.pro/points/openapi.json)

## Accounting

Splits per-second streams into chunked granularity (e.g. streamed per day).
Handles CFA and ERC-20 transfers only — **no GDA support**.
For GDA support, full history, and CSV export, use the **Balance API** instead.

[Swagger](https://accounting.superfluid.dev/v1/swagger) ·
[Repo](https://github.com/superfluid-org/accounting-api)

## Allowlist

`GET /api/allowlist/{account}/{chainId}` — check if an account is
allowlisted for automations (vesting, flow scheduling, auto-wrap).

## Whois

Resolves across ENS, AF, Farcaster, Lens, etc.
- `GET /api/resolve/{address}` — address → profile/name
- `GET /api/reverse-resolve/{handle}` — name/handle → address

GOTCHA: despite the names, `resolve` takes an address and `reverse-resolve`
takes a name.

## Token Prices

Simpler alternative to CMS for price lookups. Provides prices for all listed
SuperTokens where the token (or underlying) is known to CoinGecko.

Endpoint: `GET /v1/{canonical-network-name}/{token-address}`

[Repo](https://github.com/d10r/sf-token-prices-api/)

## Claim Programs

Returns all SUP reward programs across seasons. Each entry has `appId`,
`name`, `season`, `category`, `url`, and a nested `program.onchainInfo` with
`poolAddress`, `fundingFlowRate`, `totalAllocated`, `totalClaimed`,
`totalMembers`, and funding timestamps.

The response uses tRPC's `superjson` format (top-level `json` + `meta` keys).
Filter by `program.onchainInfo.isFundingFinished` to find active campaigns.
