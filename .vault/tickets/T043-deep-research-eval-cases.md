---
status: done
priority: normal
tags: [skill, enhancement]
created: 2026-03-24
resolved: 2026-03-24
---

# T043 — Add deep-research eval cases

## Problem

The two new deep researches (semantic-money-yellowpaper, gda-scalability) have no eval coverage to verify the skill correctly routes to and extracts information from them.

## Resolution

1. Added 2 correctness eval cases to `evals/cases/skill/correctness.cases.json`:
   - `correct-basic-particle-rtb-formula` — tests BasicParticle formula and settle-on-write knowledge (targets yellowpaper research)
   - `correct-gda-o1-scalability` — tests O(1) distribution via PDPoolIndex knowledge (targets GDA scalability research)
2. Both cases scored 100% on initial run (sonnet gen + sonnet judge)
