---
status: done
priority: medium
tags: [guides, frontend, enhancement]
created: 2026-03-20
resolved: 2026-03-20
---

# T038: Add flowing balances guide and eval

Add a framework-agnostic guide for displaying real-time streaming token balances, plus evaluation tests.

## Scope

- New guide: `references/guides/flowing-balances.md`
  - Core algorithm (BigInt math, requestAnimationFrame, throttling, auto-decimal precision)
  - Visual polish (tabular-nums, integer/decimal split, thousand separators)
  - React reference implementation (FlowingBalance.tsx with hooks)
  - Other approaches (vanilla JS/DOM, Vue, Svelte, Solid pointers)
  - Formatting utilities (formatEtherAndRound, getPrettyShortNumber, etc.)
  - Flow rate display (per-second to monthly conversion)
  - Common mistakes
- New eval: `evals/cases/skill/flowing-balances.cases.json` (3 cases)
- SKILL.md: new "Displaying flowing balances (frontend)" use-case section
- Version bump: 0.6.1 → 0.7.0

## Resolution

Guide created with algorithm-first structure. React is presented as one reference implementation, not the primary approach. Vanilla JS snippet included for direct DOM manipulation. Eval cases cover routing/content quality, code generation, and layout shift gotcha. After eval-driven iteration: restructured "Preventing layout shift" to lead with consistent decimal places, replaced routing criterion with auto_decimal_precision, removed throttling criterion (visual preference, not correctness). All 3 cases now pass at 100%.
