---
status: done
priority: medium
tags: [evals, enhancement, scripts]
created: 2026-06-09
resolved: 2026-06-09
---

# T054: Add Codex CLI support to the skill-eval runner

`claude -p` headless runs are no longer included in the Anthropic subscription, so every skill-eval run costs out of pocket. The Codex CLI (`codex exec`) supports headless runs covered by the user's Codex subscription. Make the runner able to run either role — generation ("run") and judge ("evaluator") — on Codex or Claude, selected independently, so the expensive work can move onto the Codex subscription.

## Scope

- `evals/runners/skill-eval-runner.mjs` — provider abstraction
- `evals/README.md` — document provider syntax + caveats
- `evals/configs/model-comparison.json` — add Codex example config
- `evals/configs/model-comparison-codex.json` — new Codex-judge comparison config

## Resolution

Provider is encoded as a prefix in the model string (`--model` / `--judge-model` and compare-config `model` / `judge_model`):

- `sonnet`, `opus` → Claude (bare names, backward compatible)
- `claude:opus` → Claude, explicit
- `codex` → Codex with its configured default model
- `codex:gpt-5-codex` → Codex with a specific model
- unknown prefix (e.g. `code:foo`) → fails fast

Implementation:
- `parseModelSpec()` → `{ provider, model, raw }`; `runModel()` dispatches to `runClaude` / `runCodex` (both normalized to `{ result, sessionId }`).
- `runCodex()` uses `codex exec` with `--ephemeral`, prompt over stdin (avoids ARG_MAX), `-o` temp file for the clean final message, `--sandbox read-only`, and `web_search="disabled"` (read-only is filesystem-only, not network isolation) for deterministic repo-local evals.
- Generation caveat: Claude auto-discovers the skill via `--plugin-dir`; Codex has no plugin mechanism, so Codex generation runs with `--cd` at the project root and a prompt line pointing it at `skills/superfluid/SKILL.md`. Tests skill *content*, not discovery — documented.
- Judge: Codex uses `--output-schema` (generated per case) so the verdict is guaranteed-parseable JSON; Claude keeps regex extraction. Codex judge timeout is 240s (slower than Claude's 90s).
- Provider preflight checks only the providers in use; Codex does a tiny `codex exec` auth probe so a missing `codex login` fails before the run, not mid-case.

Reviewed by Codex CLI (Pal MCP clink) before implementation; its findings (auth preflight, disable web search, output-schema judge, reject unknown prefixes) were folded into the design.

Verified on Codex+Codex and Codex-gen+Claude-judge; full 43-case suite ran at avg 93.5% with 2 judge timeouts, fixed by the 240s Codex judge timeout (reran the affected files — 11/11 scored, no errors).
