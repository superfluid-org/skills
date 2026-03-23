---
status: done
priority: medium
tags: [contracts, scripts, enhancement]
created: 2026-03-23
resolved: 2026-03-23
---

# T041: Add selector sidecar files and refine v1.0.0 content

Add `.selectors.yaml` companion files for all contract ABI YAMLs, providing function/event/error selector hashes in a dedicated format. Also refine guides and eval cases for release quality.

## Scope

### Selector sidecars
- New `selectors.mjs` script — generates `.selectors.yaml` files from @sfpro/sdk ABIs using keccak256
- 24 `.selectors.yaml` sidecar files for all contracts
- Remove inline `# 0x...` selector comments from 5 ABI YAMLs (now in sidecars)
- Document sidecar format in `_rich-abi-yaml-format.md`
- Add selector routing to SKILL.md
- Add step 9 (regenerate selectors) to CONTRIBUTING.md

### Eval enhancements
- 4 new eval cases for selectors.mjs (`selectors.cases.json`)
- Enhance `script-runner.mjs` for text assertions and multi-package deps
- Refine eval weights and golden facts in correctness/gotchas/flowing-balances cases

### Guide refinements
- Restructure `flowing-balances.md`: critical rules up front, vanilla JS before React
- Document library cache-warming gotcha

## Resolution

All changes implemented and verified. Selector generation produces correct keccak256 hashes. Eval runner handles new text assertion type. Guide restructuring improves scannability.
