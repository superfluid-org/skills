---
updated: 2026-03-24
---

# Roadmap

## Problem Statement

AI knows about Superfluid's existence and general value propositions, but the experience falls short in practice:

- **Inefficient sourcing** — AI starts with web searches and walks websites/docs to find answers, burning time and tokens
- **Hallucinated signatures** — AI fabricates contract function signatures instead of using the real ones
- **No access pattern knowledge** — AI has no idea about the gotchas and access patterns of Superfluid primitives
- **Outdated tooling** — AI doesn't know about new tooling and keeps reaching for deprecated or old alternatives

The skill exists to solve these problems by giving AI direct, structured knowledge it can load into context on demand.

## Current Focus

v1.1.0 released — formal specification deep researches, GDA scalability analysis, TOREX deep research, smart contract patterns guide. Next focus is tool selection guidance and task-oriented guides.

## Planned

1. **Task-oriented guides** — step-by-step recipes for common tasks (set up vesting, build a Super App, create a distribution pool, etc.)
2. **Best practices** — common patterns, pitfalls, and recommendations for Superfluid integrations

## Ideas



## Completed

- **v1.1.0** -- Semantic Money formal specification deep research: yellowpaper foundations, BasicParticle formula, index abstraction, agreement framework, FRP connection, Haskell spec walkthrough (T042). GDA scalability deep research: O(1) distribution via PDPoolIndex, operation walkthroughs, rounding model with align2, connected vs disconnected members, practical builder advice (T042). 2 new correctness eval cases for deep research routing (T043). TOREX deep research: streaming DEX mechanics, discount model, back adjustments, Twin TOREX, liquidity mover implementations, 3 eval cases (T044). Smart contract patterns guide: GDA pool patterns, Super App callbacks, custom SuperTokens, proxy/factory, automation/operator, stream access control — distilled from 8 production repos; GDA no-app-credit and decreaseMemberUnits corrections in ABI YAMLs; 7 eval cases (T045, T046). Cross-references, SKILL.md routing, Formal Foundations section in architecture.md. Brand design guide with color palette, typography, and visual identity for Superfluid team products (T047).
- **v1.0.0** -- Flowing balances guide with framework-agnostic real-time balance display (T038). 5 ecosystem deep researches: Planet IX, Nerite, SuperBoring, Giveth, Streme (T039). ERC-8004 Agent Pool deep-research (T036). History, GoodDollar, Flow State deep researches and prompt guide (T035). Clear Signing preview, x402, Campaigns, social links (T034). Landing page with FAQ, OG tags, install instructions (T033). Release workflow and skill trigger keywords (T031). Plugin packaging with plugin.json (T037). Skill eval runner and evaluation test suite (T026, T024). SUP Token / Reserve System ABIs (T020). Per-subgraph usage guides (T018). Super Apps guide (T017). Version bump and .gitattributes export-ignore (T032, T030). Gotcha migration to notes fields (T029).
- **v0.4.0** -- Subgraph query support: 4 GraphQL entity schemas (protocol-v1, vesting-scheduler, flow-scheduler, auto-wrap) and query-patterns guide in `references/subgraphs/` (T016). MacroForwarder guide with composable batch operations and EIP-712 signed macro example (T015). Renamed `.rich-abi.yaml` → `.abi.yaml` across all 17 reference files (T014). Added Graphinator sentinel and Token Prices API to ecosystem. Replaced marketplace install docs with skills.sh tutorial.
- **v0.3.1** -- Code generation best practices: SDK address exports table, strengthened anti-hallucination ABI/address guidance, Whois endpoint clarification with GOTCHA (T013). Fix GDA celo-mainnet address typo (89355 → 89555).
- **v0.3.0** -- Ecosystem section: SDKs & Packages (active/deprecated with guidance), API Services (CMS, Points, Accounting, Allowlist, Whois), Subgraphs (protocol, vesting, flow-scheduler, auto-wrap), Apps, Foundation/DAO/SUP Token, and Processes (token listing, automation allowlisting). Use-case routing for ecosystem topics (T011). 256 pool/index connection limit and gas cost GOTCHAs in GDA and IDA ABIs (T012).
- **v0.2.2** -- `cast call` guidance for on-chain reads (T010).
- **v0.2.1** -- GDA adjustment flow rate & rounding documentation: sticky behavior GOTCHAs on updateMemberUnits and distributeFlow, architecture.md rounding subsection. App credit deposit implications: sender deposit doubling, fan-out amplification, architecture.md subsection, SKILL.md note, and contract-level GOTCHAs.
- **v0.2.0** -- SuperTokenV1Library Rich ABI YAML (Solidity library reference). Source code links (raw GitHub URL arrays) across all 16 Rich ABI YAMLs. balance.mjs script for live Super Token balance lookups via Super API. abi.mjs script for JSON ABI fetching from @sfpro/sdk with SDK ABI index in SKILL.md. Improved SKILL.md trigger description for more reliable invocation.
- **v0.1.0** -- Initial release. 16 Rich ABI YAMLs covering all core + automation + legacy contracts. 2 runtime scripts (token list resolver, network metadata resolver). SKILL.md with use-case routing and Rich ABI YAML reading instructions.
