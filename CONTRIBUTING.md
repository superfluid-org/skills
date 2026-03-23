# Contributing

This skill is an AI knowledge base for the Superfluid Protocol. It gives AI
agents accurate, comprehensive Superfluid knowledge — contract interfaces,
architecture, tooling, debugging — so they produce correct code and answers
instead of hallucinating. There is no build step, test suite, or package
manager. The "code" is documentation and four standalone scripts.

## Architecture: SKILL.md Routes, Guides Deliver

SKILL.md is the only discovery surface. When the skill is triggered, the AI
reads SKILL.md first and it tells the AI exactly which reference file to load
for the current task. Guides and Rich ABI YAMLs are never browsed for
discovery — they're loaded on-demand only when SKILL.md routes to them.

Each guide is a mini-skill: self-contained and focused on one topic. Once the
AI is routed there, it should have everything it needs without cross-referencing
other guides.

This means:

- SKILL.md routing must be clear enough that the AI never opens a guide "to see
  what's in there"
- Each guide must be self-contained for its topic
- A guide without a SKILL.md route is invisible — always add the route

## Token Efficiency

Every character in this repo costs tokens when an AI reads it. Treat token
count as a first-class quality metric.

- Prefer plain text over markdown tables. Tables rarely justify their syntax
  overhead for the readability they add to an LLM.
- Skip `[text](url)` link syntax when a bare URL or no link at all is clearer.
  The primary reader is an LLM, not a browser.
- Comments should add signal, not restate what the name already says.
- Omit empty fields. No `inputs:` with nothing under it.
- Omit `access` for view/pure functions (reads are unrestricted).
- Use `# == Section ==` dividers, not decorative lines.
- If you can say it in 5 words instead of 15, use 5.

Before/after:

```
Bad:  # Gets the net flow rate for the given account address
Good: # Net flow rate (inflows - outflows)
```

## Content Types

**Rich ABI YAMLs** (`references/contracts/*.abi.yaml`) — The core content. One
file per contract documenting every public function, event, and error with
access control, notes, and deployment addresses. Format spec:
`references/contracts/_rich-abi-yaml-format.md`. Detailed authoring guide:
`.vault/resources/rich-abi-yaml-guide.md`.

**Guides** (`references/guides/*.md`) — Self-contained topic references
(architecture, super apps, SDKs, etc.). Written for AI extraction, not as
tutorials. Each must stand alone for its topic.

**Subgraph references** (`references/subgraphs/`) — Each subgraph has a
`.graphql` schema (source of truth for fields) and a `-guide.md` (query
patterns, gotchas, entity relationships).

**SKILL.md** — The routing map. Edit when adding/removing reference files or
changing use-case mappings. Keep entries concise: one line per use-case pointing
to a file path.

**Scripts** (`scripts/*.mjs`) — Standalone ESM scripts that import data from
their respective npm packages at runtime via `bunx -p <pkg> bun script.mjs`.
No `npm install` or local cache needed.

## Adding a Rich ABI YAML

1. Read the format spec at `references/contracts/_rich-abi-yaml-format.md`
2. Study an existing file as reference — `CFAv1Forwarder.abi.yaml` is a good
   starting point
3. Name the file `ContractName.abi.yaml`
4. Include: header comment, `meta` block (name, version, source URLs,
   deployments), abbreviations/glossary if the contract introduces domain
   terms, all public functions grouped by domain, events, errors
5. Get `emits` and `errors` per function from the Solidity source (linked in
   `meta.source`)
6. Get deployment addresses from `@superfluid-finance/metadata` or
   `bunx -p @superfluid-finance/metadata bun scripts/metadata.mjs contracts <chainId>`
7. Add a route in SKILL.md under the appropriate use-case section
8. Verify: every public function present, field order correct, no empty fields,
   comments add signal
9. Regenerate selector sidecar files:
   `bunx -p @sfpro/sdk -p js-sha3 bun scripts/selectors.mjs generate`

## Conventions

- 2-space YAML indentation, never tabs
- Section names: `# == Title Case ==`
- Functions: camelCase (as in Solidity)
- Events: PascalCase
- Errors: SCREAMING_SNAKE_CASE
- Network names: canonical Superfluid names — `eth-mainnet`, `polygon-mainnet`,
  `base-mainnet`, `optimism-mainnet`, `arbitrum-one`, etc.
- Function field order: description comment, `notes`, `mutability`, `access`,
  `inputs`, `outputs`, `emits`, `errors`
- `notes:` field (YAML list) for non-obvious behavior or common mistakes.
  Prefix gotcha items with "Gotcha: " inside quotes: `- "Gotcha: ..."`
- `ctx: bytes` parameter means the function is called through the Host, never
  directly
- `emits` and `errors` ordered by execution flow, not alphabetically
- Plugin version in `.claude-plugin/plugin.json` and `marketplace.json` must
  stay in sync

## Pull Requests

- Describe what changed and why
- For new YAMLs: cite which Solidity source files you referenced
- For guide changes: explain what was missing or incorrect
- Keep diffs minimal — don't reformat files you didn't meaningfully change

## Don'ts

- Don't fabricate addresses, selectors, or function signatures — verify against
  Solidity source
- Don't duplicate content between SKILL.md and reference files. SKILL.md
  routes, reference files contain.
- Don't add markdown tables or link syntax for "readability" — the primary
  reader is an LLM paying per token
- Don't add dependencies to scripts
- Don't create guides without adding their route in SKILL.md
