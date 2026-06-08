#!/usr/bin/env node
// Skill Eval Runner — Claude Code / Codex CLI
// Zero-dependency. Evaluates skill quality by running prompts through a CLI (Claude
// Code with --plugin-dir, or Codex pointed at the skill files), then judging the
// response with a second CLI call. Uses the chosen provider's subscription — no API
// key needed.
//
// Provider+model are selected per role via a prefix in the model string:
//   sonnet | opus            -> Claude (bare names, backward compatible)
//   claude:opus              -> Claude, explicit
//   codex                    -> Codex with its configured default model
//   codex:gpt-5-codex        -> Codex with a specific model
//
// Requires: the `claude` and/or `codex` CLI installed and authenticated for whichever
// providers you use (`claude` login, or `codex login`).
//
// Usage:
//   node skill-eval-runner.mjs                              # Run all cases (sonnet gen + judge)
//   node skill-eval-runner.mjs --file routing               # Filter by case file
//   node skill-eval-runner.mjs --tag core                   # Filter by tag
//   node skill-eval-runner.mjs --dry-run                    # Preview what would run
//   node skill-eval-runner.mjs --model sonnet               # Override generation model
//   node skill-eval-runner.mjs --judge-model opus           # Override judge model
//   node skill-eval-runner.mjs --judge-model codex          # Judge on Codex (subscription)
//   node skill-eval-runner.mjs --model codex --judge-model codex   # Both roles on Codex
//   node skill-eval-runner.mjs --compare configs.json       # Multi-model comparison

import { readdirSync, readFileSync, writeFileSync, mkdirSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { spawn, execFileSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CASES_DIR = join(__dirname, "../cases/skill");
const RESULTS_DIR = join(__dirname, "../results");
const PLUGIN_DIR = join(__dirname, "../.."); // project root (where .claude-plugin/ lives)

const MAX_TURNS = 20;

function elapsed(startMs) {
  const s = ((Date.now() - startMs) / 1000).toFixed(1);
  return `${s}s`;
}

// -- CLI args --

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const flagVal = (name) => flag(name) ? argv[argv.indexOf(name) + 1] : null;

const fileFilter = flagVal("--file");
const tagFilter = flagVal("--tag");
const dryRun = flag("--dry-run");
const cliModel = flagVal("--model") || "sonnet";
const cliJudgeModel = flagVal("--judge-model") || "sonnet";
const comparePath = flagVal("--compare");

// -- Model spec parsing (provider:model) --

// "opus"|"sonnet"        -> { provider: "claude", model: "opus" }   (bare, back-compat)
// "claude:opus"          -> { provider: "claude", model: "opus" }
// "codex"                -> { provider: "codex",  model: null }      (codex default model)
// "codex:gpt-5-codex"    -> { provider: "codex",  model: "gpt-5-codex" }
// Unknown prefix (e.g. "code:foo") throws — fail fast on typos.
function parseModelSpec(spec) {
  const i = spec.indexOf(":");
  if (i !== -1) {
    const p = spec.slice(0, i);
    if (p === "codex" || p === "claude") return { provider: p, model: spec.slice(i + 1) || null, raw: spec };
    throw new Error(`Unsupported provider prefix "${p}" in "${spec}" (expected "codex:" or "claude:")`);
  }
  if (spec === "codex") return { provider: "codex", model: null, raw: spec };
  return { provider: "claude", model: spec, raw: spec };
}

// -- Check provider CLIs --

async function checkProvider(provider) {
  if (provider === "codex") {
    try {
      execFileSync("codex", ["--version"], { timeout: 5000, stdio: "ignore" });
    } catch {
      console.error("Error: `codex` CLI not found. Install it and authenticate first (`codex login`).");
      process.exit(1);
    }
    // `codex --version` only proves it's installed — verify auth/headless readiness
    // with a tiny exec probe so a missing login fails now, not mid-run.
    try {
      await runCodex("Reply with: OK", null, { sandbox: "read-only", timeout: 30_000 });
    } catch (err) {
      console.error(`Error: \`codex exec\` probe failed — is Codex authenticated? Run \`codex login\`.\n  ${err.message}`);
      process.exit(1);
    }
    return;
  }
  // claude
  try {
    execFileSync("claude", ["--version"], { timeout: 5000, stdio: "ignore" });
  } catch {
    console.error("Error: `claude` CLI not found. Install it and authenticate first.");
    console.error("See: https://docs.anthropic.com/en/docs/claude-code");
    process.exit(1);
  }
}

// -- Run claude CLI --

function runClaude(prompt, model, opts = {}) {
  const args = [
    "-p", prompt,
    "--model", model,
    "--output-format", "json",
    "--no-session-persistence",
  ];
  if (opts.pluginDir)    args.push("--plugin-dir", opts.pluginDir);
  if (opts.allowedTools) args.push("--allowedTools", opts.allowedTools.join(","));
  if (opts.maxTurns)     args.push("--max-turns", String(opts.maxTurns));

  return new Promise((resolve, reject) => {
    const child = spawn("claude", args, {
      stdio: ["ignore", "pipe", "pipe"],
      cwd: opts.cwd,
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => { stdout += d; });
    child.stderr.on("data", (d) => { stderr += d; });

    const timer = setTimeout(() => {
      child.kill();
      reject(new Error(`claude CLI timed out after ${opts.timeout || 120_000}ms`));
    }, opts.timeout || 120_000);

    child.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        const detail = stderr.trim() || stdout.trim().slice(0, 300);
        return reject(new Error(`claude CLI exited ${code}: ${detail}`));
      }
      try {
        const data = JSON.parse(stdout);
        // CC returns is_error=true with errors array on failure
        if (data.is_error) {
          const msg = data.errors?.map(e => e.message || e).join("; ") || "unknown error";
          return reject(new Error(`claude CLI error: ${msg}`));
        }
        resolve({ result: data.result, sessionId: data.session_id });
      } catch {
        reject(new Error(`claude CLI returned non-JSON: ${stdout.slice(0, 300)}`));
      }
    });

    child.on("error", (err) => {
      clearTimeout(timer);
      reject(new Error(`claude CLI spawn failed: ${err.message}`));
    });
  });
}

// -- Run codex CLI --
// Mirrors runClaude. Prompt is passed over stdin (avoids ARG_MAX on big judge
// prompts). The final assistant message is captured via --output-last-message.
// read-only sandbox protects the filesystem but NOT the network, so web search is
// disabled to keep evals deterministic and repo-local.

function runCodex(prompt, model, opts = {}) {
  const outFile = join(tmpdir(), `codex-out-${randomUUID()}.txt`);
  const args = [
    "exec",
    "--ephemeral",
    "--skip-git-repo-check",
    "--color", "never",
    "-s", opts.sandbox || "read-only",
    "-c", 'web_search="disabled"',
    "-o", outFile,
  ];
  if (model)          args.push("-m", model);
  if (opts.cwd)       args.push("-C", opts.cwd);
  if (opts.schemaFile) args.push("--output-schema", opts.schemaFile);

  const cleanup = () => { try { unlinkSync(outFile); } catch {} };

  return new Promise((resolve, reject) => {
    const child = spawn("codex", args, {
      stdio: ["pipe", "pipe", "pipe"],
      cwd: opts.cwd,
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => { stdout += d; });
    child.stderr.on("data", (d) => { stderr += d; });

    const timer = setTimeout(() => {
      child.kill();
      cleanup();
      reject(new Error(`codex CLI timed out after ${opts.timeout || 120_000}ms`));
    }, opts.timeout || 120_000);

    child.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        const detail = stderr.trim() || stdout.trim().slice(0, 300);
        cleanup();
        return reject(new Error(`codex CLI exited ${code}: ${detail}`));
      }
      let text;
      try {
        text = readFileSync(outFile, "utf-8").trim();
      } catch {
        cleanup();
        return reject(new Error(`codex CLI produced no output file (${outFile})`));
      }
      cleanup();
      if (!text) return reject(new Error("codex CLI returned an empty final message"));
      resolve({ result: text, sessionId: null });
    });

    child.on("error", (err) => {
      clearTimeout(timer);
      cleanup();
      reject(new Error(`codex CLI spawn failed: ${err.message}`));
    });

    child.stdin.write(prompt);
    child.stdin.end();
  });
}

// -- Provider dispatcher --

function runModel(spec, prompt, opts = {}) {
  return spec.provider === "codex"
    ? runCodex(prompt, spec.model, opts)
    : runClaude(prompt, spec.model, opts);
}

// -- Generate with skill via CC CLI --

async function generate(prompt, spec) {
  const inline = "\n\nIMPORTANT: Respond with your complete answer directly in your message. Do not create plan files or say you've created a plan — include all content inline.";

  let fullPrompt;
  const opts = { timeout: 300_000 };
  if (spec.provider === "codex") {
    // Codex has no plugin/skill auto-discovery — point it at the skill files and
    // forbid network use (read-only sandbox does not block the network).
    fullPrompt =
      "A Superfluid knowledge-base skill lives in this repository at skills/superfluid/SKILL.md. " +
      "Read it and the files it references before answering. " +
      "Do not use web search or any network access; rely only on the repository files.\n\n" +
      prompt + inline;
    opts.cwd = PLUGIN_DIR;
    opts.sandbox = "read-only";
  } else {
    fullPrompt = prompt + inline;
    opts.pluginDir = PLUGIN_DIR;
    opts.allowedTools = ["Read", "Glob", "Grep", "Bash"];
    opts.maxTurns = MAX_TURNS;
  }

  const { result, sessionId } = await runModel(spec, fullPrompt, opts);
  if (!result?.trim()) {
    throw new Error(`${spec.provider} returned empty response (session: ${sessionId})`);
  }
  return { text: result, sessionId };
}

// -- Judge response via CC CLI --

// JSON Schema for the judge verdict — used with Codex's --output-schema so the final
// message is guaranteed-parseable JSON (no regex extraction needed).
function judgeSchema(criteriaCount) {
  return {
    type: "object",
    additionalProperties: false,
    required: ["criteria", "anti_patterns_found", "overall"],
    properties: {
      criteria: {
        type: "array",
        minItems: criteriaCount,
        maxItems: criteriaCount,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["index", "result", "reason"],
          properties: {
            index: { type: "integer" },
            result: { type: "string", enum: ["PASS", "FAIL"] },
            reason: { type: "string" },
          },
        },
      },
      anti_patterns_found: { type: "array", items: { type: "string" } },
      overall: { type: "string" },
    },
  };
}

async function judgeResponse(testCase, response, judgeSpec) {
  const criteriaList = testCase.criteria
    .map((c, i) => `${i + 1}. [weight: ${c.weight}] ${c.description}`)
    .join("\n");
  const goldenFacts = testCase.golden_facts.map(f => `- ${f}`).join("\n");
  const antiPatterns = testCase.anti_patterns.map(a => `- ${a}`).join("\n");

  const prompt = `You are evaluating an AI assistant's response about the Superfluid Protocol.

## User Question
${testCase.prompt}

## AI Response
${response}

## Evaluation Criteria
${criteriaList}

## Ground Truth Facts
IMPORTANT: The facts below are VERIFIED GROUND TRUTH from the protocol documentation. Do NOT contradict them with your own knowledge. If the AI response is consistent with these facts, that is CORRECT — even if it contradicts what you believe to be true.
${goldenFacts}

## Known Anti-Patterns (should NOT appear)
IMPORTANT: Only flag an anti-pattern if the AI response actually matches one listed below. Do NOT invent new anti-patterns based on your own domain assumptions.
${antiPatterns}

For each criterion, determine PASS or FAIL with a brief reason.
Then list any anti-patterns from the list above that you found in the response.

Respond in this exact JSON format (no markdown fences):
{
  "criteria": [
    { "index": 1, "result": "PASS", "reason": "brief explanation" }
  ],
  "anti_patterns_found": [],
  "overall": "brief overall assessment"
}`;

  if (judgeSpec.provider === "codex") {
    // Force a schema-conforming JSON final message, then parse it whole.
    // Codex judging is slower than Claude's (reasoning + schema) — allow more time.
    const schemaFile = join(tmpdir(), `codex-judge-schema-${randomUUID()}.json`);
    writeFileSync(schemaFile, JSON.stringify(judgeSchema(testCase.criteria.length)));
    try {
      const { result } = await runModel(judgeSpec, prompt, { timeout: 240_000, schemaFile });
      if (!result) throw new Error("Judge returned no result");
      return JSON.parse(result);
    } finally {
      try { unlinkSync(schemaFile); } catch {}
    }
  }

  const { result: raw } = await runModel(judgeSpec, prompt, { timeout: 90_000 });
  if (!raw) throw new Error("Judge returned no result");
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`Judge did not return valid JSON: ${raw.slice(0, 200)}`);
  return JSON.parse(jsonMatch[0]);
}

// -- Scoring --

function computeScore(testCase, judgeResult) {
  if (judgeResult.criteria.length !== testCase.criteria.length) {
    console.warn(`  Warning: judge returned ${judgeResult.criteria.length} criteria, expected ${testCase.criteria.length}`);
  }
  let earned = 0;
  let possible = 0;
  for (let i = 0; i < testCase.criteria.length; i++) {
    const weight = testCase.criteria[i].weight;
    possible += weight;
    if (judgeResult.criteria[i]?.result === "PASS") earned += weight;
  }
  const penalty = judgeResult.anti_patterns_found.length;
  const adjusted = Math.max(0, earned - penalty);
  return {
    earned: adjusted,
    possible,
    percentage: (adjusted / possible * 100).toFixed(1),
  };
}

// -- Load and filter cases --

function loadCases() {
  const files = readdirSync(CASES_DIR).filter(f => f.endsWith(".cases.json"));
  const result = [];
  for (const file of files) {
    const name = file.replace(".cases.json", "");
    if (fileFilter && name !== fileFilter) continue;
    const cases = JSON.parse(readFileSync(join(CASES_DIR, file), "utf-8"));
    for (const c of cases) {
      if (tagFilter && !c.tags?.includes(tagFilter)) continue;
      result.push({ file, ...c });
    }
  }
  return result;
}

// -- Run all cases for a single config --

function buildRunSummary(results, totalScore, totalPossible) {
  const scored = results.filter(r => r.score).length;
  const errors = results.filter(r => r.error).length;
  const avgScore = totalPossible > 0 ? (totalScore / totalPossible * 100).toFixed(1) : "N/A";
  return { results, totalScore, totalPossible, avgScore: Number(avgScore), scored, errors };
}

async function runCases(cases, genSpec, judgeSpec, onProgress) {
  const results = [];
  let currentFile = "";
  let totalScore = 0;
  let totalPossible = 0;

  for (const testCase of cases) {
    if (testCase.file !== currentFile) { currentFile = testCase.file; console.log(`\n${currentFile}`); }

    const t0 = Date.now();
    process.stdout.write(`  ${testCase.id} — generating...`);

    try {
      const { text: response, sessionId } = await generate(testCase.prompt, genSpec);
      process.stdout.write(` ${elapsed(t0)} — judging...`);
      const judgeResult = await judgeResponse(testCase, response, judgeSpec);
      process.stdout.write(` ${elapsed(t0)}\n`);
      const score = computeScore(testCase, judgeResult);

      totalScore += score.earned;
      totalPossible += score.possible;

      console.log(`    score: ${score.earned}/${score.possible} = ${score.percentage}%`);

      for (let i = 0; i < testCase.criteria.length; i++) {
        const cr = testCase.criteria[i];
        const jr = judgeResult.criteria[i];
        const icon = jr?.result === "PASS" ? "\x1b[32mPASS\x1b[0m" : "\x1b[31mFAIL\x1b[0m";
        console.log(`    ${icon} [${cr.weight}] ${cr.criterion} — ${jr?.reason || "no reason"}`);
      }
      if (judgeResult.anti_patterns_found.length) {
        console.log(`    Anti-patterns: ${judgeResult.anti_patterns_found.join("; ")}`);
      }

      results.push({
        id: testCase.id,
        file: testCase.file,
        response,
        sessionId,
        judge_result: judgeResult,
        score,
      });
    } catch (err) {
      console.log(` ${elapsed(t0)} ERROR: ${err.message}`);
      results.push({ id: testCase.id, file: testCase.file, error: err.message });
    }

    if (onProgress) onProgress(buildRunSummary(results, totalScore, totalPossible));
  }

  return buildRunSummary(results, totalScore, totalPossible);
}

// -- Save results --

function saveResults(timestamp, label, config, run, { silent = false } = {}) {
  const suffix = label ? `-${label}` : "";
  const output = {
    timestamp: new Date().toISOString(),
    runner: "skill-eval-cc",
    gen_model: config.model,
    judge_model: config.judgeModel,
    cases: run.results,
    summary: {
      total: run.results.length,
      scored: run.scored,
      errors: run.errors,
      avg_score: run.avgScore,
      total_earned: run.totalScore,
      total_possible: run.totalPossible,
    },
  };

  mkdirSync(RESULTS_DIR, { recursive: true });
  const outPath = join(RESULTS_DIR, `${timestamp}-skill${suffix}.json`);
  writeFileSync(outPath, JSON.stringify(output, null, 2));
  if (!silent) console.log(`Results saved to ${outPath}`);
  return outPath;
}

// -- Print comparison table --

function printComparison(configResults) {
  const allCaseIds = [...new Set(configResults.flatMap(cr => cr.run.results.map(r => r.id)))];
  const labels = configResults.map(cr => cr.label);
  const colWidth = Math.max(20, ...labels.map(l => l.length + 2));
  const tableWidth = 30 + labels.length * (colWidth + 3);

  console.log("\n" + "=".repeat(tableWidth));
  console.log("Skill Eval — Model Comparison Summary");
  console.log("=".repeat(tableWidth));

  const header = "Case".padEnd(30) + labels.map(l => l.padStart(colWidth)).join(" | ");
  console.log(header);
  console.log("-".repeat(tableWidth));

  for (const caseId of allCaseIds) {
    let row = caseId.padEnd(30);
    for (const cr of configResults) {
      const result = cr.run.results.find(r => r.id === caseId);
      const cell = result?.score
        ? `${result.score.earned}/${result.score.possible} (${result.score.percentage}%)`
        : result?.error ? "ERROR" : "—";
      row += cell.padStart(colWidth) + " | ";
    }
    console.log(row);
  }

  console.log("-".repeat(tableWidth));
  let avgRow = "AVERAGE".padEnd(30);
  for (const cr of configResults) {
    avgRow += `${cr.run.avgScore}%`.padStart(colWidth) + " | ";
  }
  console.log(avgRow);
}

// -- Main --

const cases = loadCases();
if (!cases.length) {
  console.error("No eval cases found" + (fileFilter ? ` for --file ${fileFilter}` : "") + (tagFilter ? ` with --tag ${tagFilter}` : ""));
  process.exit(1);
}

function printSummary(totalCases, run) {
  const remaining = totalCases - run.results.length;
  const parts = [`${run.scored} scored`];
  if (run.errors) parts.push(`${run.errors} errors`);
  if (remaining) parts.push(`${remaining} remaining`);
  console.log(`\nSummary: ${totalCases} cases (${parts.join(", ")}), avg score ${run.avgScore}%`);
}

async function checkProviders(providers) {
  for (const p of [...new Set(providers)]) await checkProvider(p);
}

if (comparePath) {
  // -- Compare mode --
  const configFile = JSON.parse(readFileSync(comparePath, "utf-8"));
  const configs = configFile.configs;
  const judgeSpec = parseModelSpec(configFile.judge_model || cliJudgeModel);
  // Parse all generation specs up front so bad prefixes fail fast (even on --dry-run).
  for (const config of configs) config.genSpec = parseModelSpec(config.model);

  console.log(`Skill Eval Runner — Compare Mode`);
  console.log(`  Configs: ${configs.length} (${configs.map(c => c.label).join(", ")})`);
  console.log(`  Judge model: ${judgeSpec.raw}`);
  console.log(`  Cases: ${cases.length}`);
  console.log(`  Mode: ${dryRun ? "DRY RUN" : "LIVE"}`);

  if (dryRun) {
    for (const config of configs) {
      console.log(`\n[${config.label}] model=${config.model}`);
    }
    let currentFile = "";
    for (const c of cases) {
      if (c.file !== currentFile) { currentFile = c.file; console.log(`\n  ${currentFile}`); }
      console.log(`    ${c.id} — ${c.description}`);
    }
    console.log(`\nDry run complete. ${configs.length} configs × ${cases.length} cases = ${configs.length * cases.length} total runs.`);
    process.exit(0);
  }

  await checkProviders([...configs.map(c => c.genSpec.provider), judgeSpec.provider]);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const configResults = [];

  for (const config of configs) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`Config: ${config.label} (model=${config.model})`);
    console.log("=".repeat(60));

    const saveFn = (run) => {
      try { saveResults(timestamp, config.label, { model: config.model, judgeModel: judgeSpec.raw }, run, { silent: true }); } catch {}
    };

    // Save partial results on Ctrl+C
    let latestRun = null;
    const sigHandler = () => {
      if (latestRun) {
        saveFn(latestRun);
        printSummary(cases.length, latestRun);
      }
      process.exit(1);
    };
    process.on("SIGINT", sigHandler);

    const run = await runCases(cases, config.genSpec, judgeSpec, (partialRun) => {
      latestRun = partialRun;
      saveFn(partialRun);
    });

    process.off("SIGINT", sigHandler);

    printSummary(cases.length, run);

    try {
      saveResults(timestamp, config.label, { model: config.model, judgeModel: judgeSpec.raw }, run);
    } catch (err) {
      console.error(`  Could not save results for ${config.label}: ${err.message}`);
    }

    configResults.push({ label: config.label, config, run });
  }

  printComparison(configResults);

  // Save comparison summary
  try {
    const summary = {
      timestamp: new Date().toISOString(),
      runner: "skill-eval-cc",
      judge_model: judgeSpec.raw,
      configs: configResults.map(cr => {
        const perCase = {};
        for (const r of cr.run.results) {
          if (r.score) {
            perCase[r.id] = { earned: r.score.earned, possible: r.score.possible, percentage: r.score.percentage };
          }
        }
        return {
          label: cr.label,
          model: cr.config.model,
          avg_score: cr.run.avgScore,
          per_case: perCase,
        };
      }),
    };

    mkdirSync(RESULTS_DIR, { recursive: true });
    const summaryPath = join(RESULTS_DIR, `${timestamp}-skill-comparison.json`);
    writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`\nComparison summary saved to ${summaryPath}`);
  } catch (err) {
    console.error(`Could not save comparison summary: ${err.message}`);
  }

  const hasErrors = configResults.some(cr => cr.run.results.some(r => r.error));
  process.exit(hasErrors ? 1 : 0);

} else {
  // -- Single model mode --
  const genSpec = parseModelSpec(cliModel);
  const judgeSpec = parseModelSpec(cliJudgeModel);

  console.log(`Skill Eval Runner`);
  console.log(`  Generation model: ${genSpec.raw}`);
  console.log(`  Judge model: ${judgeSpec.raw}`);
  console.log(`  Cases: ${cases.length}`);
  console.log(`  Mode: ${dryRun ? "DRY RUN" : "LIVE"}\n`);

  if (dryRun) {
    let currentFile = "";
    for (const c of cases) {
      if (c.file !== currentFile) { currentFile = c.file; console.log(currentFile); }
      console.log(`  ${c.id} — ${c.description}`);
      console.log(`    Prompt: ${c.prompt.slice(0, 80)}...`);
      console.log(`    Criteria: ${c.criteria.length} (total weight: ${c.criteria.reduce((s, cr) => s + cr.weight, 0)})`);
    }
    console.log(`\nDry run complete. Install the ${genSpec.provider === judgeSpec.provider ? `\`${genSpec.provider}\`` : `\`${genSpec.provider}\`/\`${judgeSpec.provider}\``} CLI and remove --dry-run to execute.`);
    process.exit(0);
  }

  await checkProviders([genSpec.provider, judgeSpec.provider]);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const config = { model: genSpec.raw, judgeModel: judgeSpec.raw };
  const saveFn = (run) => {
    try { saveResults(timestamp, null, config, run, { silent: true }); } catch {}
  };

  // Save partial results on Ctrl+C
  let latestRun = null;
  process.on("SIGINT", () => {
    if (latestRun) {
      saveFn(latestRun);
      printSummary(cases.length, latestRun);
    }
    process.exit(1);
  });

  const run = await runCases(cases, genSpec, judgeSpec, (partialRun) => {
    latestRun = partialRun;
    saveFn(partialRun);
  });

  printSummary(cases.length, run);

  try {
    saveResults(timestamp, null, config, run);
  } catch (err) {
    console.error(`Could not save results: ${err.message}`);
  }

  process.exit(run.results.some(r => r.error) ? 1 : 0);
}
