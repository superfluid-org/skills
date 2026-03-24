---
status: done
priority: medium
tags: [skill, deep-research, enhancement]
created: 2026-03-24
resolved: 2026-03-24
---

# T044: Add TOREX deep research and eval cases

Add a dedicated deep research covering the TOREX (TWAP Oracle Exchange) protocol mechanics, distinct from the existing `superboring.md` which covers the product layer.

## Scope

- New `torex.md` deep research (311 lines) covering:
  - Core architecture (two event loops: money flow events + LMEs)
  - TWAP Observer pattern (ITwapObserver, UniswapV3PoolTwapHoppableObserver)
  - Liquidity Moving Event flow (7-step callback sequence)
  - Discount model (shifted reciprocal f(v,t) = v * F/(F+t), τ/ε parameterization)
  - Back adjustments (back charge for new streamers, back refund for departing)
  - Controller hooks (ITorexController, fee safety, permission controls)
  - MEV properties (trader protection via TWAP, mover exposure)
  - Twin TOREX (Rich/Poor netting, shortfall-only swaps)
  - Liquidity mover implementations (basic SwapRouter02 → advanced TwinTorexLM with 1inch/UniV3/V4/Balancer)
  - Deployment addresses and key repos
- New `torex.cases.json` with 3 eval cases (discount model, back adjustments, Twin TOREX) — 100% pass rate
- Cross-references between `torex.md` and `superboring.md`
- SKILL.md pointer under "Ecosystem deep-dives"

## Sources

- TOREX whitepaper (https://app.superboring.xyz/torexpaper, 8 pages)
- averageX contracts repo (`/refs/averageX/`)
- `superfluid-finance/torex-basic-liquidity-mover` (basic Uniswap V3 mover)
- `superfluid-finance/liquidity-mover` (Twin TOREX + multi-DEX mover)

## Resolution

All files created and verified. Eval cases pass at 100%. Deep research count: 12 (was 11).

### Files created
- `skills/superfluid/references/deep-researches/torex.md`
- `evals/cases/skill/torex.cases.json`

### Files modified
- `skills/superfluid/SKILL.md` — added TOREX pointer
- `skills/superfluid/references/deep-researches/superboring.md` — added cross-reference to torex.md
