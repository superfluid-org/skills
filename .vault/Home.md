# Superfluid Agent Skill

Project vault for the Superfluid Protocol Claude Code skill (`superfluid-org/skills`).

## Vision

- [[roadmap]] -- Skill direction and priorities

## Decisions

- [[001-obsidian-vault-for-ai-project-management]] -- Use Obsidian vault for AI-driven project management

## Open Tickets

(none)

## Resolved Tickets

- [[T034-add-clear-signing-x402-campaigns-social]] -- Add Clear Signing preview, x402, Campaigns, and social links
- [[T033-add-landing-page]] -- Add landing page with FAQ, OG tags, and install instructions
- [[T032-bump-version-add-skill-metadata]] -- Bump version to 0.5.2, add skill version metadata
- [[T031-release-workflow-and-skill-keywords]] -- Add GitHub Actions release workflow and skill trigger keywords
- [[T030-add-gitattributes-export-ignore]] -- Add .gitattributes to exclude dev files from distribution archives
- [[T029-migrate-gotchas-to-notes-fields]] -- Migrate gotchas to structured `notes:` fields across all ABI YAMLs
- [[T028-refactor-scripts-add-gotchas-and-docs]] -- Refactor scripts to runtime imports, add gotchas and contributor docs
- [[T027-remove-llm-eval-runner]] -- Remove LLM eval runner in favor of skill-eval-runner
- [[T026-skill-eval-runner]] -- Custom Skills API eval runner for realistic skill traversal
- [[T025-model-comparison-evals]] -- Add model comparison and extended thinking support to LLM eval runner
- [[T024-add-evaluation-tests]] -- Add evaluation tests (script tests + skill evals)
- [[T023-replace-tables-with-lists]] -- Replace markdown tables with bullet lists for token efficiency
- [[T022-slim-skill-md-extract-guides]] -- Slim SKILL.md, extract content to dedicated guides for on-demand loading
- [[T021-fix-claude-md-script-count]] -- Fix CLAUDE.md script count (two → four) and add missing scripts to tree
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
- **Contracts**: `skills/superfluid/references/contracts/` (22 Rich ABI YAMLs + format spec)
- **Subgraphs**: `skills/superfluid/references/subgraphs/` (query-patterns, 6 `.graphql` schemas, 5 usage guides)
- **Guides**: `skills/superfluid/references/guides/` (architecture, super-apps, macro-forwarders, sdks, scripts, api-services, sup-and-dao)
- **Scripts**: `skills/superfluid/scripts/` (`metadata.mjs`, `tokenlist.mjs`, `balance.mjs`, `abi.mjs`)
- **Evals**: `evals/` (script tests + skill evals)
- **Landing page**: `landing-page/index.html` (Vercel-deployed static page)
- **Plugin version**: `.claude-plugin/marketplace.json` (`plugins[0].version`)
