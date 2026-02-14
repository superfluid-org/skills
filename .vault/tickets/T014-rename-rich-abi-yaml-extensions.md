---
status: done
priority: low
tags: [contracts, meta]
created: 2025-02-13
resolved: 2025-02-13
---

# T014 — Rename `.rich-abi.yaml` → `.abi.yaml`

## Problem

The `.rich-abi.yaml` file extension is unnecessarily verbose. A shorter `.abi.yaml` extension is cleaner and equally descriptive.

## Resolution

Renamed all 17 Rich ABI YAML files from `.rich-abi.yaml` to `.abi.yaml`:
- 15 contract files in `references/contracts/`
- `references/bases/CFASuperAppBase`
- `references/libraries/SuperTokenV1Library`

Updated all cross-references in:
- `SKILL.md` (18 path references)
- `CLAUDE.md` (file extension mention)
- `scripts/abi.mjs` (error message path)
- `CFAv1Forwarder.abi.yaml`, `GDAv1Forwarder.abi.yaml` (cross-refs to `Superfluid.abi.yaml`)
- `SuperTokenV1Library.abi.yaml` (3 cross-refs)

The "Rich ABI YAML" format name, vault resource guides (`rich-abi-yaml-guide.md`, `rich-abi-yaml-alignment.md`), and resolved tickets were left unchanged.
