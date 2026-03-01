---
status: done
priority: high
tags: [evals, enhancement]
created: 2026-02-27
resolved: 2026-02-27
---

# T026: Custom Skills API Eval Runner

Add a new eval runner that uses the Anthropic Custom Skills API (`container.skills`) for realistic skill traversal in a clean sandbox. Unlike the existing LLM eval runner which pre-loads context, this runner uploads the skill and lets the model navigate it with native progressive disclosure.

## Scope

- New runner: `evals/runners/skill-eval-runner.mjs`
- New config: `evals/configs/skill-model-comparison.json`
- Skill upload + caching, multi-turn `pause_turn` loop, same judge/score logic

## Resolution

Created `skill-eval-runner.mjs` with:
- Skill upload via `POST /v1/skills` with FormData, cached to `evals/.cache/skill-id.json`
- Multi-turn generation via `container.skills` with `pause_turn` loop (max 20 turns)
- Same judge rubric and scoring as `llm-eval-runner.mjs`
- CLI flags: `--file`, `--tag`, `--dry-run`, `--model`, `--judge-model`, `--compare`, `--skill-id`, `--reupload`
- Comparison mode with table output
- Result files tagged with `runner: "skill-eval"` and include `turns` + `usage` data
