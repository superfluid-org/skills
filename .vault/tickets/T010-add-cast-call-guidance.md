---
status: done
priority: medium
tags: [skill, enhancement]
created: 2026-02-12
resolved: 2026-02-12
---

# T010 — Add `cast call` guidance for on-chain reads

## Problem

The skill can resolve contract addresses (metadata.mjs), token addresses (tokenlist.mjs), ABIs (abi.mjs), and balances (balance.mjs) — but the AI has no way to make arbitrary smart contract read calls. It can look everything up but can't actually query the chain.

## Solution

Add a section to SKILL.md documenting how to use Foundry's `cast call` for read-only `eth_call` queries. If `cast` isn't installed locally, fall back to `bunx @foundry-rs/cast`. Include the Superfluid RPC endpoint pattern and examples integrating with existing scripts.

## Acceptance Criteria

- [x] SKILL.md has a new "On-chain reads" section after the metadata.mjs section
- [x] Links to cast docs
- [x] Documents `cast call` syntax with function signature format
- [x] Mentions `bunx @foundry-rs/cast` as fallback
- [x] Includes Superfluid RPC endpoint pattern (kept low-key)
- [x] Explicitly prohibits write commands (`cast send`)
- [x] Shows integration examples with existing scripts
- [x] Home.md updated with ticket link

## Resolution

Added "On-chain reads — `cast call`" section to SKILL.md with: `cast call` syntax including return-type decoding, `bunx @foundry-rs/cast` fallback when Foundry is not installed, Superfluid RPC endpoint pattern (`rpc-endpoints.superfluid.dev/{network-name}`), explicit prohibition of `cast send` and write commands, and integration examples combining `cast call` with `metadata.mjs` and `tokenlist.mjs` for address resolution.
