---
status: done
priority: medium
tags: [scripts, enhancement]
created: 2026-02-12
resolved: 2026-02-12
---

# T007 — Add abi.mjs script and SDK ABI index

## Problem

The skill documents contract interfaces via Rich ABI YAMLs but has no way to provide actual JSON ABIs at runtime. The `@sfpro/sdk` package bundles typed ABIs for 15 of the 17 documented contracts, but its export paths and naming don't match the YAML contract names — the AI doesn't know about the SDK or how to map between the two.

## Solution

1. Create `scripts/abi.mjs` — self-contained script that fetches JSON ABIs from `@sfpro/sdk` via CDN (jsdelivr), with a hardcoded mapping from YAML contract names to SDK export names/paths. Supports aliases, function fragment extraction, and offline caching.

2. Add an SDK ABI index section to SKILL.md documenting the `@sfpro/sdk` import paths and export names, so the AI can write correct imports when building applications.

## Acceptance Criteria

- [ ] `abi.mjs` created, self-contained (no npm install)
- [ ] Follows existing script conventions (ESM, caching, JSON output, stderr errors)
- [ ] Maps all 15 SDK-available contracts from YAML names to SDK exports
- [ ] Accepts aliases (e.g., `cfa`, `host`, `pool`)
- [ ] Function fragment extraction works (`abi.mjs SuperToken transfer`)
- [ ] Graceful errors for contracts not in SDK (CFASuperAppBase, SuperTokenV1Library)
- [ ] SKILL.md updated with SDK ABI index table
- [ ] Home.md updated with ticket link and quick reference

## Resolution

Created `scripts/abi.mjs` — self-contained ESM script that fetches JSON ABIs from `@sfpro/sdk` via jsdelivr CDN, with a hardcoded mapping from YAML contract names to SDK export paths. Supports aliases, function fragment extraction, and offline caching. Added SDK ABI index table to SKILL.md documenting all `@sfpro/sdk` import paths. Home.md updated.
