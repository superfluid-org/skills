#!/usr/bin/env node
// Superfluid Protocol Metadata Resolver
// Self-contained — no npm install required. Fetches data from CDN on first run,
// caches locally for offline use.
//
// Usage:
//   node metadata.mjs networks                          # List all networks (summary)
//   node metadata.mjs networks --mainnets               # Only mainnets
//   node metadata.mjs networks --testnets               # Only testnets
//   node metadata.mjs network <chain-id-or-name>        # Full metadata for a network
//   node metadata.mjs contracts <chain-id-or-name>      # All contract addresses for a network
//   node metadata.mjs contract <chain-id-or-name> <key> # Single contract address
//   node metadata.mjs subgraph <chain-id-or-name>       # Subgraph endpoint for a network
//   node metadata.mjs automation <chain-id-or-name>     # Automation contract addresses
//
// Output: JSON to stdout. Errors to stderr.

import { writeFileSync, readFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = join(__dirname, ".cache");
const CACHE_FILE = join(CACHE_DIR, "networks.json");
const CDN_URL = "https://cdn.jsdelivr.net/npm/@superfluid-finance/metadata/networks.json";

async function loadNetworks() {
  try {
    const res = await fetch(CDN_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    try { mkdirSync(CACHE_DIR, { recursive: true }); writeFileSync(CACHE_FILE, JSON.stringify(data)); } catch {}
    return data;
  } catch (fetchErr) {
    try { return JSON.parse(readFileSync(CACHE_FILE, "utf-8")); } catch {}
    console.error(`Error: Could not fetch metadata from CDN and no local cache found.`);
    console.error(`CDN URL: ${CDN_URL}`);
    console.error(`Fetch error: ${fetchErr.message}`);
    process.exit(1);
  }
}

const networks = await loadNetworks();

function resolveNetwork(idOrName) {
  const asNum = Number(idOrName);
  if (!isNaN(asNum)) return networks.find(n => n.chainId === asNum);
  const lower = idOrName.toLowerCase();
  return networks.find(n => n.name === lower || n.shortName === lower);
}

function requireNetwork(idOrName) {
  const network = resolveNetwork(idOrName);
  if (!network) {
    console.error(`Error: Network not found for "${idOrName}".`);
    console.error(`Available: ${networks.map(n => `${n.name} (${n.chainId})`).join(", ")}`);
    process.exit(1);
  }
  return network;
}

function summary(n) {
  return { name: n.name, chainId: n.chainId, humanReadableName: n.humanReadableName, isTestnet: n.isTestnet, nativeTokenSymbol: n.nativeTokenSymbol };
}

const out = o => console.log(JSON.stringify(o, null, 2));
const [command, ...args] = process.argv.slice(2);

switch (command) {
  case "networks": {
    const flag = args[0];
    let list = networks;
    if (flag === "--mainnets") list = networks.filter(n => !n.isTestnet);
    else if (flag === "--testnets") list = networks.filter(n => n.isTestnet);
    out(list.map(summary));
    break;
  }

  case "network": {
    if (!args[0]) { console.error("Usage: metadata.mjs network <chain-id-or-name>"); process.exit(1); }
    out(requireNetwork(args[0]));
    break;
  }

  case "contracts": {
    if (!args[0]) { console.error("Usage: metadata.mjs contracts <chain-id-or-name>"); process.exit(1); }
    const n = requireNetwork(args[0]);
    out({ network: n.name, chainId: n.chainId, nativeTokenWrapper: n.nativeTokenWrapper, ...n.contractsV1 });
    break;
  }

  case "contract": {
    if (!args[0] || !args[1]) { console.error("Usage: metadata.mjs contract <chain-id-or-name> <key>"); process.exit(1); }
    const n = requireNetwork(args[0]);
    const key = args[1];
    const addr = n.contractsV1?.[key] || (key === "nativeTokenWrapper" ? n.nativeTokenWrapper : undefined);
    if (!addr) {
      console.error(`Error: Key "${key}" not found. Available: ${Object.keys(n.contractsV1).join(", ")}, nativeTokenWrapper`);
      process.exit(1);
    }
    out({ network: n.name, chainId: n.chainId, [key]: addr });
    break;
  }

  case "subgraph": {
    if (!args[0]) { console.error("Usage: metadata.mjs subgraph <chain-id-or-name>"); process.exit(1); }
    const n = requireNetwork(args[0]);
    out({
      network: n.name, chainId: n.chainId,
      protocol: `https://subgraph-endpoints.superfluid.dev/${n.name}/protocol-v1`,
      subgraphV1: n.subgraphV1 || null,
    });
    break;
  }

  case "automation": {
    if (!args[0]) { console.error("Usage: metadata.mjs automation <chain-id-or-name>"); process.exit(1); }
    const n = requireNetwork(args[0]);
    out({
      network: n.name, chainId: n.chainId,
      vestingScheduler: n.contractsV1?.vestingScheduler || null,
      flowScheduler: n.contractsV1?.flowScheduler || null,
      autowrap: n.autowrap || null,
      subgraphs: {
        vestingScheduler: `https://subgraph-endpoints.superfluid.dev/${n.name}/vesting-scheduler`,
        flowScheduler: `https://subgraph-endpoints.superfluid.dev/${n.name}/flow-scheduler`,
        autoWrap: `https://subgraph-endpoints.superfluid.dev/${n.name}/auto-wrap`,
      },
    });
    break;
  }

  default:
    console.error(`Superfluid Metadata Resolver

Commands:
  networks [--mainnets|--testnets]     List all networks (summary)
  network <chain-id-or-name>           Full metadata for a network
  contracts <chain-id-or-name>         All contract addresses
  contract <chain-id-or-name> <key>    Single contract address
  subgraph <chain-id-or-name>          Subgraph endpoint info
  automation <chain-id-or-name>        Automation contracts + subgraphs

Examples:
  node metadata.mjs networks --mainnets
  node metadata.mjs contracts 10
  node metadata.mjs contract optimism-mainnet host
  node metadata.mjs automation base-mainnet`);
    process.exit(command ? 1 : 0);
}
