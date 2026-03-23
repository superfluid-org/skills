#!/usr/bin/env node
// Script Test Runner
// Zero-dependency. Runs test cases against the skill's scripts and reports pass/fail.
//
// Usage:
//   node script-runner.mjs                    # Run all script tests
//   node script-runner.mjs --file metadata    # Run only metadata.cases.json
//   node script-runner.mjs --tag smoke        # Run only cases tagged "smoke"
//   node script-runner.mjs --verbose          # Show full output on failure

import { execFile } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CASES_DIR = join(__dirname, "../cases/scripts");
const SCRIPTS_DIR = join(__dirname, "../../skills/superfluid/scripts");

// -- CLI args --

const args = process.argv.slice(2);
const fileFilter = args.includes("--file") ? args[args.indexOf("--file") + 1] : null;
const tagFilter = args.includes("--tag") ? args[args.indexOf("--tag") + 1] : null;
const verbose = args.includes("--verbose");

// -- Minimal JSONPath resolver --

function resolvePath(obj, path) {
  if (path === "$") return obj;
  const parts = path.replace(/^\$\.?/, "").split(/\.(?![^[]*\])/);
  let current = obj;
  for (const part of parts) {
    if (current == null) return undefined;
    const bracketMatch = part.match(/^([^[]*)\[(\d+)\]$/);
    if (bracketMatch) {
      if (bracketMatch[1]) {
        current = current[bracketMatch[1]];
        if (current == null) return undefined;
      }
      current = current[Number(bracketMatch[2])];
    } else {
      current = current[part];
    }
  }
  return current;
}

// -- Assertion evaluator --

function checkAssertion(data, assertion) {
  const value = resolvePath(data, assertion.path);

  if ("equals" in assertion) {
    if (value !== assertion.equals)
      return `Expected ${JSON.stringify(assertion.equals)}, got ${JSON.stringify(value)}`;
  }
  if ("matches" in assertion) {
    if (typeof value !== "string" || !new RegExp(assertion.matches).test(value))
      return `Expected to match /${assertion.matches}/, got ${JSON.stringify(value)}`;
  }
  if ("contains" in assertion) {
    if (typeof value !== "string" || !value.includes(assertion.contains))
      return `Expected to contain "${assertion.contains}", got ${JSON.stringify(value)}`;
  }
  if ("isArray" in assertion) {
    if (!Array.isArray(value))
      return `Expected array, got ${typeof value}`;
  }
  if ("minLength" in assertion) {
    const len = Array.isArray(value) ? value.length : typeof value === "string" ? value.length : 0;
    if (len < assertion.minLength)
      return `Expected length >= ${assertion.minLength}, got ${len}`;
  }
  if ("typeof" in assertion) {
    const actual = value === null ? "null" : typeof value;
    if (actual !== assertion.typeof)
      return `Expected typeof "${assertion.typeof}", got "${actual}"`;
  }
  if ("hasKey" in assertion) {
    if (value == null || typeof value !== "object" || !(assertion.hasKey in value))
      return `Expected object with key "${assertion.hasKey}"`;
  }
  return null;
}

// -- Run a single test case --

// Script → npm package required at runtime.
const SCRIPT_PACKAGES = {
  "metadata.mjs": "@superfluid-finance/metadata",
  "tokenlist.mjs": "@superfluid-finance/tokenlist",
  "balance.mjs": "@superfluid-finance/tokenlist",
  "abi.mjs": "@sfpro/sdk",
  "selectors.mjs": ["@sfpro/sdk", "js-sha3"],
};

function runScript(testCase) {
  const [script, ...scriptArgs] = testCase.command;
  const scriptPath = join(SCRIPTS_DIR, script);
  const pkg = SCRIPT_PACKAGES[script];
  const pkgFlags = Array.isArray(pkg) ? pkg.flatMap(p => ["-p", p]) : ["-p", pkg];
  return new Promise((resolve) => {
    execFile("bunx", [...pkgFlags, "bun", scriptPath, ...scriptArgs], { timeout: 30_000 }, (error, stdout, stderr) => {
      resolve({
        exitCode: error ? (error.code ?? 1) : 0,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
      });
    });
  });
}

function evaluateCase(testCase, result) {
  const failures = [];
  const expect = testCase.expect;

  // Exit code
  if (expect.exitCode !== undefined && result.exitCode !== expect.exitCode) {
    failures.push(`Expected exitCode ${expect.exitCode}, got ${result.exitCode}`);
  }

  // Stderr
  if (expect.stderr?.contains && !result.stderr.includes(expect.stderr.contains)) {
    failures.push(`stderr expected to contain "${expect.stderr.contains}"`);
    if (verbose && result.stderr) failures.push(`  stderr: ${result.stderr.slice(0, 200)}`);
  }

  // Stdout JSON assertions
  if (expect.stdout?.type === "json" && expect.stdout.assertions) {
    let data;
    try {
      data = JSON.parse(result.stdout);
    } catch {
      failures.push(`Expected JSON stdout, got parse error`);
      if (verbose) failures.push(`  stdout: ${result.stdout.slice(0, 200)}`);
      return failures;
    }
    for (const assertion of expect.stdout.assertions) {
      const err = checkAssertion(data, assertion);
      if (err) failures.push(`${assertion.path}: ${err}`);
    }
  }

  // Stdout text assertions
  if (expect.stdout?.type === "text" && expect.stdout.contains) {
    for (const needle of expect.stdout.contains) {
      if (!result.stdout.includes(needle)) {
        failures.push(`stdout expected to contain "${needle}"`);
      }
    }
  }

  return failures;
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

// -- Main --

const cases = loadCases();
if (!cases.length) {
  console.error("No test cases found" + (fileFilter ? ` for --file ${fileFilter}` : "") + (tagFilter ? ` with --tag ${tagFilter}` : ""));
  process.exit(1);
}

let passed = 0;
let failed = 0;
let currentFile = "";

for (const testCase of cases) {
  if (testCase.file !== currentFile) {
    currentFile = testCase.file;
    console.log(`\n${currentFile}`);
  }

  const result = await runScript(testCase);
  const failures = evaluateCase(testCase, result);

  if (failures.length === 0) {
    console.log(`  \x1b[32mPASS\x1b[0m  ${testCase.id} — ${testCase.description}`);
    passed++;
  } else {
    console.log(`  \x1b[31mFAIL\x1b[0m  ${testCase.id} — ${testCase.description}`);
    for (const f of failures) console.log(`        ${f}`);
    if (verbose && result.stderr) console.log(`        stderr: ${result.stderr.slice(0, 300)}`);
    failed++;
  }
}

console.log(`\nSummary: ${passed} passed, ${failed} failed (${passed + failed} total)`);
process.exit(failed > 0 ? 1 : 0);
