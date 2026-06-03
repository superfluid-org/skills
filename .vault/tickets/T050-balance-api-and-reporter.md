---
status: done
priority: normal
tags: [skill, ecosystem, api, enhancement]
created: 2026-06-04
resolved: 2026-06-04
---

# T050 — Balance API + Reporter documentation

## Problem

Developers needed to know about the Balance API (`balances.superfluid.dev`) and the Reporter
(`reporter.superfluid.org`) when working with comprehensive balance history, GDA flows, CSV exports,
or accounting/tax reports. The skill only documented the Super API (live balance) and Accounting API
(CFA + ERC-20, no GDA), leaving GDA balances, historical data, and report generation undiscovered.

## Resolution

- Added Balance API one-liner to SKILL.md API Services list
- Added a "Balance API" section to `references/guides/api-services.md` after "Super API":
  - Base URL, Scalar `/ui`, OpenAPI `/doc`
  - Full endpoint list (`/v1/chains`, `/accounts/{account}/tokens`, `.../{token}/counterparties`,
    `.../balance`, `.../balance-snapshots`, `.../balance-report`, `.../entries`, `.../movements`)
  - Disambiguation callout: Super = live balance only; Accounting = CFA+ERC-20, no GDA;
    **Balance = most comprehensive (CFA+GDA+IDA, history, reports, CSV)**
- Added reciprocal one-line pointers in existing Super API and Accounting API sections
- Added Reporter entry to SKILL.md Apps section with deep-link URL spec pointer (`/llms.txt`)
- Added Balance API and Reporter routes to SKILL.md Use-Case Map "Ecosystem & tooling" section
- No dedicated Reporter guide created (lightweight pointer only, per decision)
