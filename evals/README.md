# Evaluation Tests

Two-tier eval system for the Superfluid skill: deterministic script tests and AI-as-judge skill evals.

## Quick Start

```bash
# Script tests (no API key needed)
node evals/runners/script-runner.mjs

# Skill evals (requires `claude` CLI installed and authenticated)
node evals/runners/skill-eval-runner.mjs --dry-run          # preview cases
node evals/runners/skill-eval-runner.mjs                     # run all

# Model comparison
node evals/runners/skill-eval-runner.mjs --compare evals/configs/model-comparison.json
```

## Directory Layout

```
evals/
  runners/
    script-runner.mjs        # Deterministic script test runner
    skill-eval-runner.mjs    # AI-as-judge skill eval runner (uses claude CLI)
  cases/
    scripts/                 # Script test cases (JSON)
      abi.cases.json         #   7 cases
      balance.cases.json     #   4 cases
      metadata.cases.json    #   8 cases
      tokenlist.cases.json   #   5 cases
    skill/                   # Skill eval cases (JSON)
      routing.cases.json     #   5 cases
      correctness.cases.json #   5 cases
      code-generation.cases.json  # 2 cases
  configs/
    model-comparison.json    # Multi-model comparison config
  results/                   # Output files (gitignored)
```

## Script Tests

**Runner:** `evals/runners/script-runner.mjs`

Spawns each script with the specified arguments, checks exit codes, stderr, and JSON stdout assertions. No network API calls — only the scripts themselves make network requests.

**CLI flags:**

- `--file <name>` — run only cases from `<name>.cases.json` (e.g. `--file balance`)
- `--tag <tag>` — run only cases with a matching tag
- `--verbose` — show full output on failure

### Case Format

```json
{
  "id": "unique-id",
  "description": "Human-readable description",
  "command": ["script.mjs", "arg1", "arg2"],
  "expect": {
    "exitCode": 0,
    "stderr": { "contains": "expected substring" },
    "stdout": {
      "type": "json",
      "assertions": [
        { "path": "$.field.nested", "equals": "value" }
      ]
    }
  },
  "tags": ["smoke", "script-name"]
}
```

### Assertion Operators

All assertions use a `path` field with JSONPath syntax (`$.field`, `$[0].field`).

| Operator | Description | Example |
|----------|-------------|---------|
| `equals` | Strict equality (`===`) | `{ "path": "$.chainId", "equals": 10 }` |
| `matches` | Regex match on string value | `{ "path": "$.address", "matches": "^0x[a-fA-F0-9]{40}$" }` |
| `contains` | Substring match on string value | `{ "path": "$.name", "contains": "mainnet" }` |
| `isArray` | Value is an array | `{ "path": "$", "isArray": true }` |
| `minLength` | Array or string length >= N | `{ "path": "$", "minLength": 5 }` |
| `typeof` | JavaScript typeof check | `{ "path": "$.count", "typeof": "number" }` |
| `hasKey` | Object contains a key | `{ "path": "$[0]", "hasKey": "contract" }` |

Multiple operators can be combined in a single assertion object.

## Skill Evals

**Runner:** `evals/runners/skill-eval-runner.mjs`

Runs prompts through the Claude Code CLI with `--plugin-dir` to load the local skill, then has a judge model score each response against a rubric. Both generation and judging use the CC subscription — no API key needed.

**Requires:** `claude` CLI installed and authenticated (Claude Code subscription).

**CLI flags:**

- `--file <name>` — filter by case file (e.g. `--file routing`)
- `--tag <tag>` — filter by tag
- `--dry-run` — preview cases without running
- `--model <alias>` — generation model (default: `sonnet`)
- `--judge-model <alias>` — judge model (default: `sonnet`)
- `--compare <config.json>` — run all cases across multiple models

Model aliases: `sonnet` and `opus` (the only aliases recognized by the `claude` CLI).

### Case Format

```json
{
  "id": "unique-id",
  "description": "What this tests",
  "prompt": "The question sent to the model",
  "criteria": [
    { "criterion": "short_name", "description": "What the judge checks", "weight": 3 }
  ],
  "golden_facts": ["Known correct facts the response should include"],
  "anti_patterns": ["Things that should NOT appear in the response"],
  "tags": ["routing", "cfa"]
}
```

### Scoring

- Each criterion has a `weight` (1-3). Judge assigns PASS or FAIL per criterion.
- Score = sum of passed weights / sum of all weights.
- Each anti-pattern found in the response deducts 1 point.
- Output shows per-criterion PASS/FAIL with the judge's reasoning.

### Compare Mode

`model-comparison.json` defines models to compare:

```json
{
  "judge_model": "opus",
  "configs": [
    { "label": "sonnet", "model": "sonnet" },
    { "label": "opus", "model": "opus" }
  ]
}
```

Runs every case once per config, all judged by the same judge model. Prints a side-by-side comparison table and saves per-config results plus a combined summary to `evals/results/`.

### Resilience

- Results save incrementally after each case (partial results are preserved if interrupted).
- Ctrl+C triggers a graceful save before exiting.

## Adding New Cases

**Script test cases** go in `evals/cases/scripts/<script-name>.cases.json`. Each file is a JSON array.

**Skill eval cases** go in `evals/cases/skill/<topic>.cases.json`. Each file is a JSON array.

**Tag conventions:**
- `smoke` — quick sanity check, should always pass
- `error-handling` — validates error messages and exit codes
- Script/topic name (e.g. `balance`, `metadata`, `cfa`, `gda`) — for filtering by area
- `regression-tNNN` — regression test for a specific vault ticket
