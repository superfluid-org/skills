---
status: done
priority: high
tags: [skill, enhancement]
created: 2026-02-13
resolved: 2026-02-13
---

# T013 — Add code generation best practices to SKILL.md

## Problem

A real conversation using the skill revealed that the AI fabricated contract addresses (wrong Host and GDA addresses for Base Mainnet), hand-crafted an ABI fragment with a phantom `token` parameter on `disconnectPool`, and used the wrong Whois API endpoint (`resolve` instead of `reverse-resolve` for an ENS name). The skill's guidance was too passive ("prefer importing") and didn't document SDK address exports at all.

## Solution

Four targeted edits to SKILL.md:

1. **SDK address export table** — document chain-indexed address objects (`hostAddress`, `cfaAddress`, `gdaAddress`, etc.) alongside the existing ABI import table, with a usage example.
2. **Strengthened ABI/address guidance** — change "prefer importing from @sfpro/sdk" to "ALWAYS import ABIs and addresses from @sfpro/sdk — do NOT hand-craft ABI fragments or hardcode contract addresses."
3. **Common Contract Addresses warning** — add "Do NOT hardcode or fabricate addresses" with pointers to SDK exports and metadata.mjs.
4. **Whois endpoint clarification** — break endpoints into sub-bullets with direction arrows (address → name, name → address) and add GOTCHA about the counterintuitive naming.

## Acceptance Criteria

- [x] SDK address export table added after ABI table with `hostAddress`, `cfaAddress`, `gdaAddress`, etc.
- [x] Code example shows chain-indexed pattern (`hostAddress[8453]`)
- [x] ABI guidance uses "ALWAYS" / "do NOT" instead of "prefer"
- [x] Common Contract Addresses opens with fabrication warning
- [x] Whois endpoints clarified with direction arrows and GOTCHA
- [x] Home.md updated

## Resolution

All four edits applied to SKILL.md. SDK address exports now documented in a table mirroring the ABI table. Guidance strengthened from passive "prefer" to directive "ALWAYS / do NOT". Contract address section warns against fabrication. Whois endpoints clarified with GOTCHA about counterintuitive naming.
