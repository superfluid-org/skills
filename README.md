# Superfluid Skills

An AI agent skill for the [Superfluid Protocol](https://superfluid.finance) — the real-time finance protocol for streaming payments on EVM chains.

This skill gives AI agents deep knowledge of Superfluid smart contract interfaces, enabling them to write integration code, debug reverts, and answer protocol questions accurately. It covers Super Tokens, CFA (1:1 streaming), GDA (many-to-many distribution pools), automation contracts (vesting, flow scheduling, auto-wrap), Super App development, and sentinel/liquidation mechanics.

## Install

### Claude Code, Cursor, Copilot, and 15+ other agents

```
bunx skills add superfluid-org/skills
```

Installs the skill and prompts you to pick which agents to enable it for. Update with `bunx skills update`. See [skills.sh](https://skills.sh) for the full list of supported agents.

### Claude Desktop

**From GitHub (recommended):**

1. Customize → "+" (Add plugin) on "Personal plugins"
2. "Add marketplace from GitHub" → enter `superfluid-org/skills`
3. Find and install the Superfluid skill

**From ZIP:**

1. Download the latest ZIP from [Releases](https://github.com/superfluid-org/skills/releases)
2. Customize → Skills → "+" → "Upload a skill" → select the ZIP

### OpenClaw

```
clawhub install superfluid
```

## What's included

**SKILL.md** — The main skill file that Claude loads when a Superfluid-related task is detected. Maps use-cases to the right reference files and explains how to read them.

**Rich ABI references** — Self-contained YAML files documenting every public function, event, and error for each Superfluid contract, including parameter descriptions, access control, notes, and deployment addresses.

Covered contracts: CFAv1Forwarder, GDAv1Forwarder, ConstantFlowAgreementV1, GeneralDistributionAgreementV1, SuperToken, SuperTokenV1Library, SuperTokenFactory, SuperfluidPool, Superfluid (Host), CFASuperAppBase, VestingSchedulerV3, FlowScheduler, AutoWrapManager, AutoWrapStrategy, BatchLiquidator, TOGA, InstantDistributionAgreementV1 (legacy), FluidLocker, FluidLockerFactory, FluidEPProgramManager, Fontaine, and StakingRewardController.

**Runtime scripts** — Node.js scripts for looking up token addresses, contract deployments, and ABIs across all Superfluid-supported chains:

- `tokenlist.mjs` — Resolve Super Token addresses, symbols, and types
- `metadata.mjs` — Look up contract addresses, subgraph endpoints, and network info
- `balance.mjs` — Check Super Token balances (real-time balance, deposits, net flow)
- `abi.mjs` — Resolve raw contract ABIs from the Superfluid SDK

## License

MIT
