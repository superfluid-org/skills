---
status: done
priority: normal
tags: [skill, evals]
created: 2026-06-04
resolved: 2026-06-04
---

# T051 — Eval cases for Clear Macro, Balance API, and Reporter

## Problem

New skill content (Clear Macro, Balance API, Reporter) needed eval coverage to prevent regressions
and verify correct routing.

## Resolution

Added 5 new eval cases across `routing.cases.json` and `correctness.cases.json`:

**Routing cases** (`evals/cases/skill/routing.cases.json`):
- `route-clear-macro`: gasless/relayed human-readable signed tx → `clear-macro.md`; verifies
  testnet flag and Provider API mention; tagged `regression-t049`
- `route-balance-api`: full history + GDA + CSV → Balance API (not Super/Accounting);
  tagged `regression-t050`
- `route-reporter-deeplink`: build a Reporter tax-CSV deep-link → reporter.superfluid.org,
  params from llms.txt; tagged `regression-t050`

**Correctness cases** (`evals/cases/skill/correctness.cases.json`):
- `correctness-clear-macro-status`: verifies skill flags testnet/forward-looking nature and names
  correct contracts + capabilities→sign→relay→poll flow without hallucinating; tagged `regression-t049`
- `correctness-balance-api-disambiguation`: verifies skill correctly disambiguates Super vs
  Accounting vs Balance API per use-case; tagged `regression-t050`

All 5 cases verified via `--dry-run`; both JSON files parse cleanly.
