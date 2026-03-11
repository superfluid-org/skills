---
status: done
priority: normal
tags: [skill, enhancement]
created: 2026-03-11
resolved: 2026-03-11
---

# T036 — Add ERC-8004 Agent Pool support

## Problem

The skill does not document the AgentPoolDistributor contract (deployed on Base) or the ERC-8004 integration. Users asking about AI agent pools, ERC-8004, or the 8004-demo get no structured guidance.

## Resolution

1. Created `references/deep-researches/erc8004-agent-pools.md` (172 lines) — covers ERC-8004 standard (all 3 registries), Identity Registry wallet lifecycle, Reputation Registry Sybil-aware design, deployed addresses, AgentPoolDistributor mechanics, demo app tiered pools, building opportunities, ecosystem context
2. Added "ERC-8004 Agent Pools" use-case routing section to SKILL.md
3. Added ecosystem deep-dives entry, app entry, repo link, error prefixes, and keywords (`ERC-8004, agent pool, AI agent`) to SKILL.md
4. Updated Home.md
