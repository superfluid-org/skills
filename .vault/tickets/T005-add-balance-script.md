---
status: done
priority: medium
tags: [scripts, enhancement]
created: 2026-02-12
resolved: 2026-02-12
---

# T005 — Add balance.mjs script

## Problem

The skill documents Super Token balance semantics (connected vs unconnected, flow rates, liquidation) but cannot fetch live balance data. Users asking "why can't I see my GDA distribution?" need to see the unconnected balance — which requires an on-chain query.

## Solution

Create `scripts/balance.mjs` that queries the [Super API](https://superapi.kazpi.com) `GET /super-token-balance` endpoint. The script:
- Accepts chain ID, token (symbol or address), and account
- Resolves symbols via the CDN token list (same as `tokenlist.mjs`)
- Returns formatted JSON with connected/unconnected balances, net flow rate, liquidation estimate, and underlying token balance

## Acceptance Criteria

- [ ] `balance.mjs` created, self-contained (no npm install)
- [ ] Follows existing script conventions (ESM, caching, JSON output, stderr errors)
- [ ] Symbol resolution works (e.g., `USDCx` → address)
- [ ] SKILL.md updated with documentation section
- [ ] Home.md quick reference updated

## Resolution

Created `scripts/balance.mjs` — self-contained ESM script querying the Super API for live Super Token balances. Supports symbol resolution via CDN token list, returns connected/unconnected balances, net flow rate, and liquidation estimate. SKILL.md and Home.md updated.
