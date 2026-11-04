---
status: done
priority: normal
tags: [skill, enhancement]
created: 2026-11-04
resolved: 2026-11-04
---

# T063 — Checkout widget, hosted checkout and builder retired

## Problem

`sdks.md` said `@superfluid-finance/widget` had no replacement because it was stuck on wagmi v1, and linked a Playground at `checkout-builder.superfluid.finance`. The widget, hosted checkout and builder are being retired; those domains will redirect to https://superfluid.org/checkout-retired.

## Resolution

- `references/guides/sdks.md`: widget line now says retired and unmaintained, Playground link removed, links the notice.
- `SKILL.md`: deprecated list entry points to the notice.

No other `checkout-builder`, `checkout.superfluid` or `checkout-docs` references exist in the skill. No version bump: CLAUDE.md requires one only on version bumps.
