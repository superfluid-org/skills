---
status: done
priority: normal
tags: [skill, enhancement]
created: 2026-07-03
resolved: 2026-07-03
---

# T057 — Add SuperVault product awareness

## Problem

The skill had zero awareness of SuperVault (https://supervault.suplabs.org) — a Superfluid
Labs time-limited technical demo on Base mainnet demonstrating streaming vault yield, and a
live reference for the Superfluid "yield streams" institutional offering
(https://superfluid.org/institutional/yield-streams).

Facts verified against the public integrator docs (https://supervault.suplabs.org/docs),
the Basescan-verified deployment, and on-chain reads:

- ERC-4626 vault `StableYieldSyncVault` (`0x8C60503C0353ED12c3Eebc3036BF033A3BbB95Aa`,
  share token "SuperVault Technical Demo Share" / SVTD) paired with an immutable
  `SyncFundManager` custodian (`0x904103dfE7231e2534e0Be29E6086CB0FF7d76bd`).
- Deposited USDC goes into a Morpho Vault V2 (Steakhouse Prime USDC,
  `0xbeef0e0834849aCC03f0089F01f4F1Eeb06873C9`); an operator-set stable yield rate
  (`stableYieldRate`, 300 bps at time of writing) is streamed per-second to depositors as
  USDCx via a GDA pool (`YIELD_POOL` `0xcaF84DACEd15AC4543cb4a94BfE9B5070d910Be0`); a 1%
  fee (`FEE_BPS = 100`) streams via a second GDA pool to the DAO treasury
  (dao.superfluid.eth). Surplus Morpho yield accrues to share NAV, not the stream. Streams
  are pre-funded at deposit time (`guaranteedFlowDuration` solvency horizon, 48h at time of
  writing).
- Deposit+connect and redeem are one-signature ClearMacro flows (`SyncVaultMacro` at
  `0xA2175966fD97356C9ADb72ECC40875BC02Fa110b`) executed through the canonical
  `ClearMacroForwarder` (`0xC1EaB73855155D4e021f7EB4f866996Bac2fe25e`); the vault trusts
  the forwarder via ERC-2771.

Scope constraints (user decisions):

- **Minimal mention** — no deep-research doc, no Rich ABI YAMLs / `NON_SDK_ABIS` /
  selectors, no Use-Case Map or Debugging Reverts wiring, no eval cases.
- SuperVault is **unrelated** to the Super Token yield-backend feature
  (`enableYieldBackend` etc. in `SuperToken.abi.yaml`) — do not conflate them.
- Contracts are **not open-source** (repos private); cite only public references (the
  site, its `/docs` pages, the Basescan-verified deployment).

## Resolution

- `skills/superfluid/SKILL.md` — added a SuperVault entry to the Ecosystem `### Apps`
  list (vault address, mechanism summary, ClearMacro flows, closed-source note, docs link,
  yield-backend disambiguation clause).
- `skills/superfluid/references/guides/clear-macro.md` — added a "Live mainnet deployment"
  note in the DashboardClearMacro section pointing to SuperVault's `SyncVaultMacro` as a
  production `ClearMacroBase` deployment on Base.
- Bumped version 1.2.4 → 1.2.5 in all four required locations:
  - `.claude-plugin/plugin.json` — source of truth (`version` field)
  - `.claude-plugin/marketplace.json` — `plugins[0].version`
  - `skills/superfluid/SKILL.md` — frontmatter `metadata.version`
  - `landing-page/index.html` — version badge text

Follow-up: if SuperVault graduates from technical demo to a durable product (or the
contracts are open-sourced), revisit with a deep-research doc and possibly Rich ABI YAML
treatment.

Re-check 2026-10-27 before merge: site, docs and contracts still live on Base
(vault `totalAssets` ~9,652 USDC). The docs now call SuperVault a "technical demo"
and "live reference implementation" with no time limit, so the SKILL.md entry
drops "time-limited". Addresses and the 1% DAO fee (dao.superfluid.eth =
`0xac808840f02c47C05507f48165d2222FF28EF4e1`) re-verified.
