---
updated: 2026-02-12
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

v0.2.0 expanded the skill with a Solidity library reference, live balance/ABI scripts, and SDK integration knowledge. The next focus is broader tooling reference (subgraphs, APIs, deprecation notes), best practices, and task-oriented guides.

## Planned

1. **Tooling reference** — document Superfluid developer tools (SDKs, subgraphs, APIs), their current development status, and deprecation notes
2. **Tool selection guidance** — help AI know which tool to reach for given a task
3. **Best practices** — common patterns, pitfalls, and recommendations for Superfluid integrations
4. **Task-oriented guides** — step-by-step recipes for common tasks (set up vesting, build a Super App, create a distribution pool, etc.)

## Ideas



## Completed

- **v0.2.0** -- SuperTokenV1Library Rich ABI YAML (Solidity library reference). Source code links (raw GitHub URL arrays) across all 16 Rich ABI YAMLs. balance.mjs script for live Super Token balance lookups via Super API. abi.mjs script for JSON ABI fetching from @sfpro/sdk with SDK ABI index in SKILL.md. Improved SKILL.md trigger description for more reliable invocation.
- **v0.1.0** -- Initial release. 16 Rich ABI YAMLs covering all core + automation + legacy contracts. 2 runtime scripts (token list resolver, network metadata resolver). SKILL.md with use-case routing and Rich ABI YAML reading instructions.
