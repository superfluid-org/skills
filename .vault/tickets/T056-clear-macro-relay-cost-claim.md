---
status: done
priority: normal
tags: [bug, contracts, guide]
created: 2026-06-22
resolved: 2026-06-22
---

# T056 — Soften unverified ClearMacro relay cost-recovery claim

## Problem

The skill stated as **fact** that the ClearMacro relay provider recovers/deducts the gas
cost from the signer's Super Token balance, and that the signer "must hold enough Super Token
to cover the relay fee." Verification showed this is unsubstantiated:

- The authoritative provider README
  (`https://raw.githubusercontent.com/d10r/clearmacro-provider/refs/heads/main/README.md`),
  which `clear-macro.md` cites as source of truth, documents **no** fee/charge/recovery
  mechanism. Its only gas references are the provider funding its **own** relayer signer
  (`prod:fund`, the `/readyz` per-chain signer-balance check) — i.e. the relay is currently
  effectively subsidized.
- The `ClearMacroForwarder` contract has **no** fee mechanism: it verifies the EIP-712
  signature and forwards the batch call (EIP-2771). There is no fee param/function and no
  Super Token deduction in the forwarder.
- Any cost recovery would have to be **macro-specific** (a transfer-to-provider operation the
  user signs over), not a property of the relay. The reference `DashboardClearMacro` does not
  do this.

Confirmed by the maintainer: provider relaying is a **new solution still in BETA with no fee
model yet**. So the recovery mechanism the docs described doesn't merely lack documentation —
it does not exist at this stage.

Only the cost-recovery clause was wrong. The first half — "gasless from the signer's
perspective: the provider fronts native gas" — is correct and was kept.

## Resolution

Softened the three spots that asserted a recovery/fee mechanism, reframing it as one possible
provider-specific model that is **not** enforced by the forwarder, with the current reference
provider documenting no fee scheme:

- `skills/superfluid/references/guides/clear-macro.md` — Execution Mode 2 intro.
- `skills/superfluid/references/guides/clear-macro.md` — "Gasless from signer's perspective"
  Notes bullet (removed the "must hold enough Super Token to cover the relay fee" assertion).
- `skills/superfluid/references/contracts/ClearMacroForwarder.abi.yaml` — `meta.notes` bullet.

Left accurate phrasings untouched: `clear-macro.md` "Provider Relay (Gasless)" heading,
`macro-forwarders.md` Blind-vs-Clear table Gas row ("relayer pays (gasless for signer)"),
`ClearMacroForwarder.abi.yaml` header comment ("provider pays gas on the signer's behalf"),
and `SKILL.md` ("enabling gasless-for-signer flows") — none of these claim cost recovery.

Bumped version 1.2.3 → 1.2.4 in all four required locations:
- `.claude-plugin/plugin.json` — source of truth (`version` field)
- `.claude-plugin/marketplace.json` — `plugins[0].version`
- `skills/superfluid/SKILL.md` — frontmatter `metadata.version`
- `landing-page/index.html` — version badge text

No selectors regeneration needed — only prose / `meta.notes` changed, not ABI signatures.

Follow-up: provider relaying is in BETA with no fee model yet. Revisit the docs once relaying
leaves BETA and/or a fee model is introduced (confirm with the provider author, d10r) before
re-asserting any specific cost-recovery mechanism.
