---
status: done
priority: medium
tags: [contracts, enhancement]
created: 2026-02-13
resolved: 2026-02-13
---

# T012 — Document 256 pool/index connection limit and gas implications

## Problem

An AI using the skill was asked about GDA pool connection limits. It initially answered "no limit" for self-connections, only discovering the 256 bitmap ceiling after the user pushed it to check the Solidity source. The Rich ABI YAMLs didn't document the `SlotsBitmapLibrary` bitmap size or the gas cost implications of many connections.

## Solution

Add GOTCHAs and clarifying comments to the GDA and IDA Rich ABI YAMLs documenting: the 256 connection limit per account per token (bitmap size), the relationship between the 4 autoconnect slots and the 256 total, and the linear gas scaling on `realtimeBalanceOf`/`balanceOf` as connection count grows.

## Acceptance Criteria

- [x] GDA Pool Connectivity section header documents the 256 limit
- [x] GDA `connectPool` has GOTCHA about 256 limit and gas cost
- [x] GDA `realtimeBalanceOf` has GOTCHA about linear gas scaling per connected pool
- [x] GDA `MAX_POOL_AUTO_CONNECT_SLOTS` clarifies 4 is a subset of the 256 bitmap
- [x] IDA `realtimeBalanceOf` has GOTCHA about linear gas scaling per subscription
- [x] IDA `MAX_NUM_SUBSCRIPTIONS` documents `uint256 = 256 bits` and gas cost note
- [x] Home.md updated

## Resolution

Added GOTCHAs and clarifying comments across both distribution agreement YAMLs. GDA: section header notes the 256 bitmap limit, `connectPool` GOTCHA warns about the limit and gas scaling, `realtimeBalanceOf` GOTCHA explains per-pool external call cost, `MAX_POOL_AUTO_CONNECT_SLOTS` clarifies 4-slot autoconnect is a subset of the 256 bitmap. IDA: `realtimeBalanceOf` GOTCHA for per-subscription gas cost, `MAX_NUM_SUBSCRIPTIONS` expanded with bitmap explanation and gas note.
