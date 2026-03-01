---
status: done
priority: high
tags: [meta, enhancement]
created: 2026-02-27
resolved: 2026-02-27
---

# T025: Add Model Comparison to LLM Eval Runner

## Problem

The LLM eval framework (T024) runs 12 cases against a single model. No way to compare models — with and without extended thinking — to find the best fit for skill quality.

## Resolution

Extended the LLM eval runner with two new capabilities:

**Extended thinking support** (`--thinking <budget>`):
- Adds `thinking` parameter to Anthropic API requests
- Sets `max_tokens = budget_tokens + output_tokens` (thinking counts toward max_tokens)
- Extracts only `text` blocks from response, stores thinking content separately
- Thinking is only used for generation, never for judge calls

**Compare mode** (`--compare <config.json>`):
- Runs all filtered cases against multiple model configurations
- Config file specifies model, thinking budget, and label per config
- Uses consistent judge model across all configs
- Saves per-config results + combined comparison summary
- Prints side-by-side comparison table at end

**Default config** (`evals/configs/model-comparison.json`):
- Sonnet 4.5 (no thinking), Sonnet 4.5 (4k thinking), Sonnet 4.5 (10k thinking)

Files modified:
- `evals/runners/llm-eval-runner.mjs` — thinking support + compare mode
- `evals/configs/model-comparison.json` — default comparison config (new)
