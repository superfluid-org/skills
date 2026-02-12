# Superfluid Agent Skill

Project vault for the Superfluid Protocol Claude Code skill (`superfluid-org/skills`).

## Vision

- [[roadmap]] -- Skill direction and priorities

## Decisions

- [[001-obsidian-vault-for-ai-project-management]] -- Use Obsidian vault for AI-driven project management

## Open Tickets

- [[T002-document-gda-adjustment-flow-rate]] -- Document GDA adjustment flow rate semantics (ratchet, three-level model)

## Resolved Tickets

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
- **Contracts**: `skills/superfluid/references/contracts/` (16 Rich ABI YAMLs)
- **Scripts**: `skills/superfluid/scripts/` (`metadata.mjs`, `tokenlist.mjs`, `balance.mjs`, `abi.mjs`)
- **Plugin version**: `.claude-plugin/plugin.json`
