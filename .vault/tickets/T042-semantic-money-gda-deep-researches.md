---
status: done
priority: normal
tags: [skill, enhancement]
created: 2026-03-24
resolved: 2026-03-24
---

# T042 — Add Semantic Money and GDA scalability deep researches

## Problem

The skill documents *what* CFA and GDA do but not *why* they work mathematically. Developers asking about the formal specification, BasicParticle, settle-on-write, or GDA's O(1) scalability get no structured guidance. The Semantic Money yellowpaper and Haskell formal spec are not referenced.

## Resolution

1. Created `references/deep-researches/semantic-money-yellowpaper.md` (~505 lines) — covers payment system model, conservation of value, BasicParticle, index abstraction, agreement framework, FRP connection, real-time balance formula, buffer-based solvency, key Haskell modules, links to yellowpaper PDF and spec source
2. Created `references/deep-researches/gda-scalability.md` (~395 lines) — covers the O(N) CFA problem, PDPoolIndex/PDPoolMember data structures, operation walkthroughs (distributeFlow, distribute, updateMemberUnits, connectPool, claimAll), rounding model with align2, universal index composition, settle-on-write, connected vs disconnected members, scalability summary, practical builder advice
3. Added keywords (`semantic money, yellowpaper, whitepaper`) to SKILL.md frontmatter
4. Added both files to ecosystem deep-dives and new "Formal specification and protocol theory" use-case map section
5. Added cross-reference from GDA use-case section and GDA rounding gotcha to gda-scalability.md
6. Added "Formal Foundations" section to architecture.md linking to yellowpaper deep research
