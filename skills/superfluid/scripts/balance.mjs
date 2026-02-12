#!/usr/bin/env node
// Superfluid Super Token Balance Resolver
// Self-contained — no npm install required. Resolves token symbols via CDN
// token list (cached locally), then queries the Super API for real-time balances.
//
// Usage:
//   node balance.mjs balance <chain-id> <token-symbol-or-address> <account>
//
// Output: JSON to stdout. Errors to stderr.

import { writeFileSync, readFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = join(__dirname, ".cache");
const CACHE_FILE = join(CACHE_DIR, "tokenlist.json");
const CDN_URL = "https://cdn.jsdelivr.net/npm/@superfluid-finance/tokenlist/dist/superfluid.extended.tokenlist.json";
const API_URL = "https://superapi.kazpi.com/super-token-balance";

async function loadTokens() {
  try {
    const res = await fetch(CDN_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    try { mkdirSync(CACHE_DIR, { recursive: true }); writeFileSync(CACHE_FILE, JSON.stringify(data)); } catch {}
    return data.tokens;
  } catch (fetchErr) {
    try { return JSON.parse(readFileSync(CACHE_FILE, "utf-8")).tokens; } catch {}
    console.error(`Error: Could not fetch token list from CDN and no local cache found.`);
    console.error(`CDN URL: ${CDN_URL}`);
    console.error(`Fetch error: ${fetchErr.message}`);
    process.exit(1);
  }
}

function resolveToken(tokens, chainId, symbolOrAddress) {
  const query = symbolOrAddress.toLowerCase();
  const chainTokens = tokens.filter(t => t.chainId === chainId);
  const byAddr = chainTokens.find(t => t.tags?.includes("supertoken") && t.address.toLowerCase() === query);
  if (byAddr) return byAddr;
  const bySym = chainTokens.find(t => t.tags?.includes("supertoken") && t.symbol.toLowerCase() === query);
  if (bySym) return bySym;
  return null;
}

async function fetchBalance(chain, token, account) {
  const params = new URLSearchParams({ chain: String(chain), token, account });
  const url = `${API_URL}?${params}`;
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`Error: Super API returned HTTP ${res.status}${body ? ` — ${body}` : ""}`);
    console.error(`URL: ${url}`);
    process.exit(1);
  }
  return res.json();
}

function formatBalance(wei, decimals = 18) {
  if (wei == null) return null;
  const num = Number(wei) / 10 ** decimals;
  return { wei, formatted: num.toFixed(decimals > 8 ? 8 : decimals) };
}

function formatFlowRate(weiPerSecond, decimals = 18) {
  if (!weiPerSecond || weiPerSecond === "0") return null;
  const sign = weiPerSecond.startsWith("-") ? "-" : "";
  const abs = weiPerSecond.replace("-", "");
  const perSecond = Number(abs) / 10 ** decimals;
  const perMonth = perSecond * 2592000; // 30 days
  return {
    wei_per_second: weiPerSecond,
    tokens_per_second: `${sign}${perSecond.toFixed(decimals > 8 ? 8 : decimals)}`,
    tokens_per_month: `${sign}${perMonth.toFixed(4)}`,
  };
}

function formatTimestamp(ts) {
  if (!ts) return null;
  const n = Number(ts);
  return { unix: ts, iso: new Date(n * 1000).toISOString() };
}

const tokens = await loadTokens();

const out = o => console.log(JSON.stringify(o, null, 2));
const [command, ...args] = process.argv.slice(2);

switch (command) {
  case "balance": {
    if (!args[0] || !args[1] || !args[2]) {
      console.error("Usage: balance.mjs balance <chain-id> <token-symbol-or-address> <account>");
      process.exit(1);
    }
    const chainId = Number(args[0]);
    if (isNaN(chainId)) { console.error("Error: chain-id must be a number"); process.exit(1); }

    let tokenAddress = args[1];
    let tokenMeta = null;

    if (!args[1].startsWith("0x")) {
      const resolved = resolveToken(tokens, chainId, args[1]);
      if (!resolved) {
        console.error(`Error: No Super Token found on chain ${chainId} matching "${args[1]}"`);
        console.error(`Hint: Use "node tokenlist.mjs by-chain ${chainId} --super" to see available tokens.`);
        process.exit(1);
      }
      tokenAddress = resolved.address;
      tokenMeta = resolved;
    } else {
      tokenMeta = resolveToken(tokens, chainId, args[1]);
    }

    const account = args[2];
    const data = await fetchBalance(chainId, tokenAddress, account);

    const superTokenDecimals = tokenMeta?.decimals ?? 18;
    const underlyingDecimals = data.underlyingToken?.decimals ?? null;

    const result = {
      chain: data.chain,
      account: data.account,
      superToken: {
        address: data.token,
        ...(tokenMeta ? { symbol: tokenMeta.symbol, name: tokenMeta.name, decimals: tokenMeta.decimals } : {}),
        ...(tokenMeta?.extensions?.superTokenInfo ? { type: tokenMeta.extensions.superTokenInfo.type } : {}),
      },
      balance: {
        connected: formatBalance(data.connectedBalance, superTokenDecimals),
        unconnected: formatBalance(data.unconnectedBalance, superTokenDecimals),
      },
      netFlow: formatFlowRate(data.connectedNetFlow, superTokenDecimals),
      timestamp: formatTimestamp(data.timestamp),
      maybeCriticalAt: formatTimestamp(data.maybeCriticalAt),
      underlyingToken: data.underlyingToken ? {
        address: data.underlyingToken.address,
        ...(underlyingDecimals != null ? { decimals: underlyingDecimals } : {}),
        balance: formatBalance(data.underlyingToken.balance, underlyingDecimals ?? 18),
      } : null,
    };

    out(result);
    break;
  }

  default:
    console.error(`Superfluid Super Token Balance Resolver

Commands:
  balance <chain-id> <token-symbol-or-address> <account>   Get real-time Super Token balance

Examples:
  node balance.mjs balance 8453 USDCx 0xYourAddress
  node balance.mjs balance 10 0x1efF3Dd78F4A14aBfa9Fa66579bD3Ce9E1B30529 0xYourAddress`);
    process.exit(command ? 1 : 0);
}
