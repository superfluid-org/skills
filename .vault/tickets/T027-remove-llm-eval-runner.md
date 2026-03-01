---
status: done
priority: medium
tags: [evals, meta]
created: 2026-02-27
resolved: 2026-02-27
---

# T027: Remove LLM Eval Runner

## Problem

The LLM eval runner (`llm-eval-runner.mjs`) pre-loads context files into the prompt — the model never navigates the skill itself. This tests content quality in isolation but not the real user experience where the model discovers SKILL.md and progressively loads references. The skill eval runner (T026) already covers this end-to-end, making the LLM runner redundant.

## Resolution

- Deleted `evals/runners/llm-eval-runner.mjs`
- Deleted `evals/configs/model-comparison.json` (thinking-focused config for llm runner)
- Renamed `skill-model-comparison.json` → `model-comparison.json` (now the only config)
- Removed `context` field from all 12 eval cases (only used by llm runner)
