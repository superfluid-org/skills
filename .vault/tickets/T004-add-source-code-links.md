---
status: done
priority: low
tags: [spec, contracts, enhancement]
created: 2026-02-12
resolved: 2026-02-12
---

# T004 — Add source code links to Rich ABI YAMLs

## Problem

The `source` field in each Rich ABI YAML currently points to the repository root URL. When the AI (or a human) needs to inspect actual Solidity source as a last resort, there is no direct link to the specific `.sol` files.

Also, the org name in all `source` URLs is stale (`superfluid-finance` → `superfluid-org`).

## Solution

Replace the `source` string with a plain array of `raw.githubusercontent.com` URLs pointing to:
- Implementation `.sol` file (always first)
- Interface `.sol` file (when applicable, second)
- Base contract `.sol` file (when applicable, third)

Filenames are self-documenting (`Foo.sol` = implementation, `IFoo.sol` = interface, `FooBase.sol` = base).

## Scope

- 16 Rich ABI YAML files in `skills/superfluid/references/contracts/`
- Rich ABI YAML guide in `.vault/resources/rich-abi-yaml-guide.md`
- SKILL.md meta field documentation

## Resolution

Replaced `source` from a single repo URL string to a plain array of `raw.githubusercontent.com` URLs across all 16 Rich ABI YAMLs. Each array lists the implementation file first, then interface, then base contract (only present when applicable). Also fixed the stale org name from `superfluid-finance` to `superfluid-org`. Updated the Rich ABI YAML guide (section 2, Meta Block) and SKILL.md to document the new format. All URLs verified via HTTP HEAD requests.
