---
status: done
priority: high
tags: [contracts, enhancement]
created: 2026-02-26
resolved: 2026-02-26
---

# T020 — Add SUP Token / Reserve System ABIs

## Goal

Add Rich ABI YAMLs for the five SUP Token / Reserve System contracts and route them from SKILL.md.

## Context

The SUP ecosystem is a new token staking and liquidity system built on Superfluid. It introduces per-user Reserves (lockers), emission programs via GDA pools, unlock streaming via Fontaines, and tax-based reward distribution. These contracts were not yet documented in the skill.

## Resolution

**Added 5 Rich ABI YAMLs** in `skills/superfluid/references/contracts/`:
- `FluidLocker.abi.yaml` — per-user reserve for locking, staking, and LP positions
- `FluidLockerFactory.abi.yaml` — beacon proxy factory creating deterministic Reserves
- `FluidEPProgramManager.abi.yaml` — SUP emission program orchestration via GDA pools
- `StakingRewardController.abi.yaml` — splits unlock tax revenue between staker and LP pools
- `Fontaine.abi.yaml` — single-use unlock stream contracts

**Updated SKILL.md:**
- Added "SUP Token / Reserve System" section with routing to all 5 contracts
- Expanded error prefix table with new contract error codes
