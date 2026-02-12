#!/usr/bin/env node
// Superfluid ABI Resolver
// Self-contained — no npm install required. Fetches JSON ABIs from the @sfpro/sdk
// package via CDN, caches locally for offline use.
//
// Usage:
//   node abi.mjs <contract>                 Full JSON ABI for a contract
//   node abi.mjs <contract> <function>      Single function/event/error fragment
//   node abi.mjs list                       List all available contracts
//
// Output: JSON to stdout. Errors to stderr.

import { writeFileSync, readFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = join(__dirname, ".cache");
const CDN_BASE = "https://cdn.jsdelivr.net/npm/@sfpro/sdk/dist/abi";

// Contract name → SDK module + export name.
// Module "main" = @sfpro/sdk/abi, others = @sfpro/sdk/abi/<module>.
const ABI_MAP = {
  // @sfpro/sdk/abi (main)
  CFAv1Forwarder:                 { module: "main",       export: "cfaForwarderAbi" },
  GDAv1Forwarder:                 { module: "main",       export: "gdaForwarderAbi" },
  SuperfluidPool:                 { module: "main",       export: "gdaPoolAbi" },
  SuperToken:                     { module: "main",       export: "superTokenAbi" },
  // @sfpro/sdk/abi/core
  Superfluid:                     { module: "core",       export: "hostAbi" },
  ConstantFlowAgreementV1:        { module: "core",       export: "cfaAbi" },
  GeneralDistributionAgreementV1: { module: "core",       export: "gdaAbi" },
  InstantDistributionAgreementV1: { module: "core",       export: "idaAbi" },
  SuperTokenFactory:              { module: "core",       export: "superTokenFactoryAbi" },
  BatchLiquidator:                { module: "core",       export: "batchLiquidatorAbi" },
  TOGA:                           { module: "core",       export: "togaAbi" },
  Governance:                     { module: "core",       export: "governanceAbi" },
  // @sfpro/sdk/abi/automation
  AutoWrapManager:                { module: "automation",  export: "autoWrapManagerAbi" },
  AutoWrapStrategy:               { module: "automation",  export: "autoWrapStrategyAbi" },
  FlowScheduler:                  { module: "automation",  export: "flowSchedulerAbi" },
  VestingSchedulerV3:             { module: "automation",  export: "vestingSchedulerV3Abi" },
};

// Shorthand aliases → canonical name.
const ALIASES = {
  cfaforwarder: "CFAv1Forwarder",
  gdaforwarder: "GDAv1Forwarder",
  pool: "SuperfluidPool",
  gdapool: "SuperfluidPool",
  supertoken: "SuperToken",
  token: "SuperToken",
  host: "Superfluid",
  cfa: "ConstantFlowAgreementV1",
  gda: "GeneralDistributionAgreementV1",
  ida: "InstantDistributionAgreementV1",
  supertokenfactory: "SuperTokenFactory",
  factory: "SuperTokenFactory",
  batchliquidator: "BatchLiquidator",
  liquidator: "BatchLiquidator",
  toga: "TOGA",
  governance: "Governance",
  autowrapmanager: "AutoWrapManager",
  autowrap: "AutoWrapManager",
  autowrapstrategy: "AutoWrapStrategy",
  flowscheduler: "FlowScheduler",
  vestingschedulerv3: "VestingSchedulerV3",
  vestingscheduler: "VestingSchedulerV3",
  vesting: "VestingSchedulerV3",
};

function resolveContract(query) {
  // Exact match on canonical name (case-insensitive).
  const byCanonical = Object.keys(ABI_MAP).find(k => k.toLowerCase() === query.toLowerCase());
  if (byCanonical) return byCanonical;
  // Alias match.
  return ALIASES[query.toLowerCase()] ?? null;
}

function cdnUrl(module) {
  return module === "main"
    ? `${CDN_BASE}/generated.js`
    : `${CDN_BASE}/${module}/generated.js`;
}

function cacheFile(module) {
  return join(CACHE_DIR, `abi-${module}.mjs`);
}

async function loadModule(module) {
  const url = cdnUrl(module);
  const cached = cacheFile(module);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const code = await res.text();
    try { mkdirSync(CACHE_DIR, { recursive: true }); writeFileSync(cached, code); } catch {}
    return import(pathToFileURL(cached).href);
  } catch (fetchErr) {
    try {
      return import(pathToFileURL(cached).href);
    } catch {}
    console.error(`Error: Could not fetch ABI module "${module}" from CDN and no local cache found.`);
    console.error(`CDN URL: ${url}`);
    console.error(`Fetch error: ${fetchErr.message}`);
    process.exit(1);
  }
}

function sdkImportPath(module) {
  return module === "main" ? "@sfpro/sdk/abi" : `@sfpro/sdk/abi/${module}`;
}

const out = o => console.log(JSON.stringify(o, null, 2));
const [command, ...args] = process.argv.slice(2);

switch (command) {
  case "list": {
    const entries = Object.entries(ABI_MAP).map(([name, { module, export: exp }]) => ({
      contract: name,
      sdkImport: sdkImportPath(module),
      sdkExport: exp,
    }));
    out(entries);
    break;
  }

  case undefined:
  case "help":
  case "--help":
  case "-h": {
    console.error(`Superfluid ABI Resolver — fetches JSON ABIs from @sfpro/sdk

Commands:
  <contract>               Full JSON ABI for a contract
  <contract> <function>    Single function/event/error fragment by name
  list                     List all available contracts with SDK import info

Contracts:
  ${Object.keys(ABI_MAP).join(", ")}

Aliases:
  cfa, gda, ida, host, pool, token, factory, toga, autowrap, vesting, liquidator, ...

Examples:
  node abi.mjs CFAv1Forwarder
  node abi.mjs cfa
  node abi.mjs SuperToken transfer
  node abi.mjs list`);
    process.exit(0);
    break;
  }

  default: {
    const name = resolveContract(command);
    if (!name) {
      // Check if it's a known contract not in the SDK.
      const notInSdk = ["CFASuperAppBase", "SuperTokenV1Library"];
      const match = notInSdk.find(n => n.toLowerCase() === command.toLowerCase());
      if (match) {
        console.error(`Error: ${match} is not available in @sfpro/sdk (${match === "CFASuperAppBase" ? "abstract base contract" : "Solidity library"}).`);
        console.error(`Refer to the Rich ABI YAML: references/contracts/${match}.rich-abi.yaml`);
      } else {
        console.error(`Error: Unknown contract "${command}".`);
        console.error(`Run "node abi.mjs list" to see available contracts.`);
      }
      process.exit(1);
    }

    const entry = ABI_MAP[name];
    const mod = await loadModule(entry.module);
    const abi = mod[entry.export];

    if (!abi) {
      console.error(`Error: Export "${entry.export}" not found in SDK module "${entry.module}".`);
      process.exit(1);
    }

    const fnName = args[0];
    if (fnName) {
      const fragments = abi.filter(item => item.name?.toLowerCase() === fnName.toLowerCase());
      if (!fragments.length) {
        console.error(`Error: No ABI entry named "${fnName}" in ${name}.`);
        console.error(`Hint: Names are case-insensitive. The ABI has ${abi.filter(i => i.name).map(i => i.name).filter((v, i, a) => a.indexOf(v) === i).length} named entries.`);
        process.exit(1);
      }
      out(fragments.length === 1 ? fragments[0] : fragments);
    } else {
      out({ contract: name, sdkImport: sdkImportPath(entry.module), sdkExport: entry.export, abi });
    }
    break;
  }
}
