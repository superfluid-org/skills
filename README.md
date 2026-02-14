# Superfluid Skills

An AI agent skill for the [Superfluid Protocol](https://superfluid.finance) — the real-time finance protocol for streaming payments on EVM chains.

This skill gives AI agents deep knowledge of Superfluid smart contract interfaces, enabling them to write integration code, debug reverts, and answer protocol questions accurately. It covers Super Tokens, CFA (1:1 streaming), GDA (many-to-many distribution pools), automation contracts (vesting, flow scheduling, auto-wrap), Super App development, and sentinel/liquidation mechanics.

## Install

```
npx skills add https://github.com/superfluid-org/skills --skill superfluid
```

During install, you'll be prompted to choose which CLIs/IDEs to install the skill to (e.g. Claude Code, Cursor, Windsurf). The skill is symlinked across all selected targets, so a single update command refreshes everywhere:

```
npx skills update
```

## What's included

**SKILL.md** — The main skill file that Claude loads when a Superfluid-related task is detected. Maps use-cases to the right reference files and explains how to read them.

**Rich ABI references** — Self-contained YAML files documenting every public function, event, and error for each Superfluid contract, including parameter descriptions, access control, gotchas, and deployment addresses.

Covered contracts: CFAv1Forwarder, GDAv1Forwarder, ConstantFlowAgreementV1, GeneralDistributionAgreementV1, SuperToken, SuperTokenFactory, SuperfluidPool, Superfluid (Host), CFASuperAppBase, VestingSchedulerV3, FlowScheduler, AutoWrapManager, AutoWrapStrategy, BatchLiquidator, TOGA, and InstantDistributionAgreementV1 (legacy).

**Runtime scripts** — Node.js scripts for looking up token addresses and contract deployments across all Superfluid-supported chains:

- `tokenlist.mjs` — Resolve Super Token addresses, symbols, and types
- `metadata.mjs` — Look up contract addresses, subgraph endpoints, and network info

## License

MIT
