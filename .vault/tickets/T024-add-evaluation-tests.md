---
status: done
priority: high
tags: [meta, enhancement]
created: 2026-02-27
resolved: 2026-02-27
---

# T024: Add Evaluation Tests

## Problem

The skill has zero automated quality checks. All 23 historical tickets (T001-T023)
were discovered through real conversations — hallucinated addresses, wrong routing,
incomplete coverage. No way to catch regressions or validate changes.

## Resolution

Added a two-category evaluation framework in `evals/`:

**Category 1: Script tests** (deterministic, 23 cases)
- `evals/cases/scripts/` — JSON test cases for all 4 scripts
- `evals/runners/script-runner.mjs` — zero-dep ESM runner, spawns scripts and checks assertions
- Covers: correct output structure, known addresses, error handling, aliases
- Run: `node evals/runners/script-runner.mjs`

**Category 2: LLM evals** (AI-as-judge, 12 cases)
- `evals/cases/skill/` — routing (5), correctness (5), code-generation (2)
- `evals/runners/llm-eval-runner.mjs` — two-phase: generate response, judge against rubric
- Regression tests for T001, T008, T009, T013
- Run: `ANTHROPIC_API_KEY=... node evals/runners/llm-eval-runner.mjs`

Both runners support `--file` and `--tag` filters. LLM runner supports `--dry-run`.
Results go to `evals/results/` (gitignored).
