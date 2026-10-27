---
status: done
priority: normal
tags: [skill, enhancement]
created: 2026-10-27
resolved: 2026-10-27
---

# T059 — Add Superfluid Wallet awareness

## Problem

The skill had no awareness of Superfluid Wallet, Superfluid Finance Ltd's non-custodial
wallet that people and their AI agents use together (public beta). Agents asked about it,
or asked to transact on a user's behalf, had nothing to route to.

## Resolution

Minimal-mention scope, matching T057 (SuperVault):

- `skills/superfluid/SKILL.md` — Superfluid Wallet entry in Ecosystem `### Apps`: pairing
  prompt, human approval with ERC-7730 clear signing, Turnkey key custody, WalletConnect,
  x401 identity, supported networks, what is not live yet (x402 spending controls,
  auto-approval policies), and that it is a Superfluid Finance Ltd product separate from
  the DAO-governed protocol. Added `Superfluid Wallet` to the description keywords.

Every claim comes from public pages checked 2026-10-27: https://www.superfluidwallet.com
(`/start`, `/faq`, `/hfa`, `/clear-approval`, `/clear-policy`) and
https://app.superfluidwallet.com/onboarding.md.

Follow-up: if the wallet ships agent-facing APIs or Superfluid-specific flows worth
routing to (e.g. streams through the wallet), add a guide or route from the use-case map.
