---
updated: 2026-02-13
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

v0.3.0 released — ecosystem coverage and connection limit documentation. Next focus is tool selection guidance, best practices, and task-oriented guides.

## Planned

1. **Tool selection guidance** — help AI know which tool to reach for given a task
2. **Best practices** — common patterns, pitfalls, and recommendations for Superfluid integrations
3. **Task-oriented guides** — step-by-step recipes for common tasks (set up vesting, build a Super App, create a distribution pool, etc.)

## Ideas



## Completed

- **v0.3.0** -- Ecosystem section: SDKs & Packages (active/deprecated with guidance), API Services (CMS, Points, Accounting, Allowlist, Whois), Subgraphs (protocol, vesting, flow-scheduler, auto-wrap), Apps, Foundation/DAO/SUP Token, and Processes (token listing, automation allowlisting). Use-case routing for ecosystem topics (T011). 256 pool/index connection limit and gas cost GOTCHAs in GDA and IDA ABIs (T012).
- **v0.2.2** -- `cast call` guidance for on-chain reads (T010).
- **v0.2.1** -- GDA adjustment flow rate & rounding documentation: sticky behavior GOTCHAs on updateMemberUnits and distributeFlow, architecture.md rounding subsection. App credit deposit implications: sender deposit doubling, fan-out amplification, architecture.md subsection, SKILL.md note, and contract-level GOTCHAs.
- **v0.2.0** -- SuperTokenV1Library Rich ABI YAML (Solidity library reference). Source code links (raw GitHub URL arrays) across all 16 Rich ABI YAMLs. balance.mjs script for live Super Token balance lookups via Super API. abi.mjs script for JSON ABI fetching from @sfpro/sdk with SDK ABI index in SKILL.md. Improved SKILL.md trigger description for more reliable invocation.
- **v0.1.0** -- Initial release. 16 Rich ABI YAMLs covering all core + automation + legacy contracts. 2 runtime scripts (token list resolver, network metadata resolver). SKILL.md with use-case routing and Rich ABI YAML reading instructions.
