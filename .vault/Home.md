# Superfluid Agent Skill

Project vault for the Superfluid Protocol Claude Code skill (`superfluid-org/skills`).

## Vision

- [[roadmap]] -- Skill direction and priorities

## Decisions

- [[001-obsidian-vault-for-ai-project-management]] -- Use Obsidian vault for AI-driven project management

## Open Tickets

(none)

## Resolved Tickets

- [[T020-add-sup-reserve-system-abis]] -- Add SUP Token / Reserve System Rich ABI YAMLs (5 contracts)
- [[T019-split-protocol-schema-add-entity-summaries]] -- Split protocol-v1.graphql into events/entities, add entity summaries to guides
- [[T018-add-subgraph-usage-guides]] -- Add per-subgraph usage guides (vesting status tree, example queries, gotchas)
- [[T017-add-super-apps-guide]] -- Add dedicated Super Apps guide (callback lifecycle, app credit, jailing, app levels)
- [[T016-add-subgraph-schema-references]] -- Add subgraph entity schemas and query patterns
- [[T015-add-macro-forwarder-guide]] -- Add MacroForwarder guide (composable batch operations, EIP-712 example)
- [[T014-rename-rich-abi-yaml-extensions]] -- Rename `.rich-abi.yaml` → `.abi.yaml`
- [[T013-add-code-generation-best-practices]] -- Add code generation best practices (SDK address exports, anti-hallucination guidance, Whois clarification)
- [[T012-document-256-connection-limit]] -- Document 256 pool/index connection limit and gas implications
- [[T011-add-ecosystem-section]] -- Add Ecosystem section (SDKs, APIs, subgraphs, apps, governance, processes)
- [[T010-add-cast-call-guidance]] -- Add `cast call` guidance for on-chain reads
- [[T009-document-app-credit-deposit-implications]] -- Document app credit deposit implications for Super App senders
- [[T002-document-gda-adjustment-flow-rate]] -- Document GDA adjustment flow rate semantics (sticky, rounding)
- [[T008-add-unit-change-rounding-gotchas]] -- Add GOTCHAs for unit-change / flow-rate rounding interaction
- [[T007-add-abi-script]] -- Add abi.mjs script and SDK ABI index to SKILL.md
- [[T006-improve-skill-trigger-description]] -- Improve SKILL.md description so the AI invokes the skill more reliably
- [[T005-add-balance-script]] -- Add balance.mjs script for live Super Token balance lookups
- [[T003-add-supertokenv1library]] -- Add SuperTokenV1Library reference for Solidity developers
- [[T004-add-source-code-links]] -- Add source code links to Rich ABI YAMLs
- [[T001-fix-gda-description-and-naming]] -- Fix GDA description, naming, and config flag errors

## Resources

- [[rich-abi-yaml-guide]] -- Rich ABI YAML authoring specification
- [[rich-abi-yaml-alignment]] -- Alignment with ABI JSON, NatSpec, and ethers.js
- [[The-Complete-Guide-to-Building-Skill-for-Claude.pdf]] -- Anthropic's official skill-building guide (PDF)

## Quick Reference

- **Skill entry**: `skills/superfluid/SKILL.md`
- **Contracts**: `skills/superfluid/references/contracts/` (21 Rich ABI YAMLs)
- **Subgraphs**: `skills/superfluid/references/subgraphs/` (query-patterns, 5 `.graphql` schemas, 4 usage guides)
- **Guides**: `skills/superfluid/references/guides/` (super-apps, macro-forwarders, eip712-example)
- **Scripts**: `skills/superfluid/scripts/` (`metadata.mjs`, `tokenlist.mjs`, `balance.mjs`, `abi.mjs`)
- **Plugin version**: `.claude-plugin/plugin.json`
