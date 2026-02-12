# Rich ABI YAML — Authoring Guide
# For Superfluid Protocol smart contract documentation

## What is a Rich ABI YAML?

A Rich ABI YAML is an enhanced representation of a Solidity contract's ABI.
It is a superset of ABI JSON and NatSpec, expressed in YAML, with
protocol-specific extensions.

Standard ABI JSON gives you a flat list of function signatures. NatSpec gives
you developer comments embedded in source code. Neither captures the
relationships that matter most when working with a contract: which events a
function emits, which errors it can throw, who can call it, and how functions
relate to each other conceptually.

Rich ABI YAML combines all three into a single file:

```
┌──────────────────────────────────────────┐
│           Rich ABI YAML                  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  ABI JSON fields                   │  │
│  │  mutability, inputs, outputs,      │  │
│  │  events, errors                    │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │  NatSpec documentation             │  │
│  │  descriptions, per-param notes,    │  │
│  │  developer warnings                │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │  Protocol context (new)            │  │
│  │  access, emits, errors per-fn,     │  │
│  │  implements, inherits,             │  │
│  │  deployments, glossary, grouping   │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

The format serves two audiences simultaneously:

- **Humans** scanning for function signatures, gotchas, and domain context
- **Machines (LLMs)** consuming contract interfaces with minimal token overhead
  while retaining the relationships and nuance that flat ABI JSON loses

Comments and descriptions should be **helpful, not redundant**. If a parameter
name is self-explanatory, don't describe it. If a function has a non-obvious
edge case, document it. The goal is to add signal, not noise. Comments can be
added freely wherever they improve clarity for either audience.

## Why YAML?

- **Native comments** (`#`) — descriptions and notes without workarounds
- **Token-efficient** — no quotes on keys, no braces/brackets/commas
- **Explicit key-value pairs** — LLMs parse fields unambiguously
- **Human-scannable** — clean indentation-based hierarchy
- **Programmatically parseable** — scripts can convert Rich ABI YAML back
  to standard ABI JSON

**Important:** YAML forbids tabs for indentation. Use 2 spaces per level, always.

## Relationship to Existing Specs

### ABI JSON → Rich ABI YAML (field mapping)

| ABI JSON field     | Rich ABI YAML equivalent                     |
|--------------------|-----------------------------------------------|
| `type`             | Inferred from root section (see Root Keys)    |
| `name`             | YAML key (function/event name)                |
| `stateMutability`  | `mutability` (shortened)                      |
| `inputs[]`         | `inputs:` (expanded, one per line)            |
| `outputs[]`        | `outputs:` (expanded, one per line)           |
| `indexed` (event)  | Split into `indexed:` and `data:` fields      |
| `anonymous` (event)| Omitted unless true (rare)                    |
| `components` (tuple)| Recursive nesting (see Struct/Tuple Types)   |

Any ABI JSON can be mechanically converted to a minimal Rich ABI YAML.
A Rich ABI YAML can be mechanically converted back to ABI JSON, losing only
the extensions (comments, access, emits, grouping, etc.).

### NatSpec → Rich ABI YAML (tag mapping)

| NatSpec tag         | Rich ABI YAML equivalent                     |
|---------------------|-----------------------------------------------|
| `@title`            | Header comment (first line)                   |
| `@notice`           | `# description` comment on function/event     |
| `@dev`              | `# GOTCHA:` comment or inline note            |
| `@param <name>`     | `# comment` next to the parameter             |
| `@return`           | `# comment` next to the output                |
| `@inheritdoc`       | Not applicable (each function documented)     |
| `@custom:<name>`    | `access`, `emits`, `errors` serve this role   |
| `@author`           | Could add to meta if needed (typically omitted)|

### What Rich ABI YAML adds beyond both specs

These fields have no equivalent in either ABI JSON or NatSpec:

| Field               | Value                                                     |
|---------------------|-----------------------------------------------------------|
| `access`            | Role-based access control labels                          |
| `emits`             | Which events a function emits                             |
| `errors` (per-fn)   | Which errors a function can throw, in execution order     |
| `implements`        | Interfaces the contract fulfills                          |
| `inherits`          | Base contracts                                            |
| `deployments`       | On-chain addresses per network                            |
| Abbreviations       | Protocol-specific abbreviation reference                  |
| Glossary            | Domain concept definitions                                |
| Section grouping    | Logical function organization by domain                   |
| GOTCHA comments     | Non-obvious behavior warnings                             |
| Ordering semantics  | emits/errors ordered by execution flow                    |

## File Structure

Every Rich ABI YAML follows this top-level structure, in order:

```yaml
# Title comment — contract name and one-line description
# NOTE comment — any caveats about the file's accuracy

meta:           # Contract metadata, lineage, and deployment addresses
# == Abbreviations ==
# == Glossary ==
# == Section 1 ==   # Grouped functions, ordered by domain priority
# == Section N ==
# == Events ==
# == Errors ==
```

### Root Keys

Three root keys are reserved: `meta`, `events`, and `errors`.
Everything else at the root level is a function.

This convention keeps the file flat and avoids an extra nesting level under
a `functions:` container, which would add ~10% token overhead across the
largest section of the file.

## Sections in Detail

### 1. Header Comment

```yaml
# Superfluid Constant Flow Agreement (CFA) v1
# Manages continuous token streams between accounts
#
# NOTE: emits/errors mappings are best-effort — verify against source.
```

Keep it to 2-3 lines. The NOTE line sets expectations that event/error
mappings come from source code analysis, not from the compiler.

### 2. Meta Block

```yaml
meta:
  name: ConstantFlowAgreementV1
  version: v1
  source: https://github.com/superfluid-finance/ethereum-contracts
  implements: [IConstantFlowAgreementV1, ISuperAgreement]
  inherits: [SuperfluidAgreementV1Base, UUPSProxiable]
  deployments:
    mainnet:
      eth-mainnet: "0x..."
      polygon-mainnet: "0x..."
    testnet:
      eth-sepolia: "0x..."
      base-sepolia: "0x..."
```

Fields:
- `name` — the Solidity contract name
- `version` — protocol version (v1, v2, etc.)
- `source` — link to the source repository
- `implements` — interfaces the contract fulfills (what callers can expect)
- `inherits` — base contracts it extends (where shared logic comes from)
- `deployments` — split into `mainnet` and `testnet` subgroups
  - Use canonical Superfluid network names (see appendix)
  - Addresses are quoted strings
  - Order mainnets by prominence (eth-mainnet first), testnets alphabetically

### 3. Abbreviations

```yaml
# == Abbreviations ==
# ACL — Access Control List
# CFA — Constant Flow Agreement
# ctx — context (Superfluid call context bytes)
```

- Comment-only section (no YAML structure)
- One abbreviation per line: `# ABBR — Full Name`
- Include protocol-specific and Solidity/EVM abbreviations used in the file
- Alphabetical within the section

### 4. Glossary

```yaml
# == Glossary ==
# flow / stream      — continuous per-second token transfer, used interchangeably
# flowRate           — tokens per second (int96, wei-denominated)
# deposit            — buffer locked when opening a flow, protects against insolvency
```

- Comment-only section
- One concept per line: `# term — definition`
- Align the dashes for readability
- Include synonyms where applicable (flow / stream)
- Mention Solidity types where helpful (int96, uint256)
- If a term appears in Abbreviations AND needs a conceptual explanation,
  put the short form in Abbreviations and the full explanation in Glossary

### 5. Function Sections

Functions are grouped by domain and ordered by priority within each group.

#### Section Headers

```yaml
# == Flow Management ==
```

Use `# == Name ==` format. Keep names short and descriptive.
Optionally add context lines below for the section:

```yaml
# == Operator Flow Management ==
# Act on behalf of another account. Requires ACL permissions.
```

Section-level comments are a good place to document patterns that apply to
all functions in the group, rather than repeating per function.

#### Section Ordering (by priority)

Order sections so the most commonly used functions appear first:

1. Core operations (create, update, delete)
2. Operator variants of core operations
3. Read functions / queries for the core domain
4. Access control / permissions
5. Access control queries
6. Specialized queries (liquidation, solvency)
7. Protocol constants
8. Protocol admin / internal plumbing

Within each section, order functions by usage frequency.

#### Function Entry Format

Full entry (state-changing function):

```yaml
createFlow:
  # Start a new stream from msg.sender to receiver
  mutability: nonpayable
  access: anyone
  inputs:
    - token: address
    - receiver: address
    - flowRate: int96       # must be > 0
    - ctx: bytes
  outputs:
    - newCtx: bytes
  emits:
    - FlowUpdated
    - FlowUpdatedExtension
  errors:
    - CFA_FLOW_ALREADY_EXISTS
    - CFA_INVALID_FLOW_RATE
    - CFA_NO_SELF_FLOW
```

Minimal entry (view function with no events/errors):

```yaml
getNetFlow:
  # Net flow rate for an account (inflows - outflows)
  mutability: view
  inputs:
    - token: address
    - account: address
  outputs:
    - flowRate: int96
```

Constant with no inputs:

```yaml
MAXIMUM_FLOW_RATE:
  mutability: view
  outputs:
    - uint256
```

#### Field Order

Fields within a function entry follow this order:

1. `# comment` — description, gotchas (optional, placed first)
2. `mutability` — always first structured field
3. `access` — who can call this function (optional)
4. `inputs` — omit if none
5. `outputs` — omit if none
6. `emits` — omit if none (typically omitted for view/pure)
7. `errors` — omit if none (typically omitted for view/pure)

Rationale: `mutability` first because it's the most important signal when
scanning — it tells you immediately whether a function reads or writes state.
`access` follows as the next most important context. Inputs/outputs are the
signature. Emits/errors are the side effects and failure modes.

#### Input/Output Syntax

All inputs and outputs use the expanded format, one parameter per line:

```yaml
inputs:
  - token: address
  - receiver: address
  - flowRate: int96       # wei per second, must be > 0
  - ctx: bytes
```

Each item is a `- name: type` mapping. Comments can be added inline to
any parameter that benefits from explanation.

For unnamed outputs (common for single return values or pure helpers),
use the type alone as a plain string:

```yaml
outputs:
  - uint256
```

Named and unnamed can be mixed:

```yaml
outputs:
  - flowRate: int96
  - uint256
```

A parser distinguishes them by type: a mapping (`name: type`) is named,
a plain string (`type`) is unnamed.

**Don't add comments to self-explanatory parameters.** A parameter called
`token: address` in a Superfluid contract doesn't need `# the SuperToken`.
A parameter called `permissions: uint8` benefits from `# bitmask: 1=create,
2=update, 4=delete` because the encoding is non-obvious.

#### Struct/Tuple Types

For complex parameters (structs), use recursive nesting:

```yaml
inputs:
  - config:
      type: tuple
      components:
        - token: address
        - sender: address
        - receiver: address
        - flowRate: int96
```

This mirrors how ABI JSON represents tuples with `components`, while staying
native to YAML's indentation structure.

For nested structs, the recursion continues:

```yaml
inputs:
  - request:
      type: tuple
      components:
        - config:
            type: tuple
            components:
              - token: address
              - flowRate: int96
        - userData: bytes
```

#### Access Labels

The `access` field documents who can call a function. Use these labels:

| Label        | Meaning                                  |
|--------------|------------------------------------------|
| `anyone`     | No access restriction                    |
| `host`       | Only the Superfluid host contract        |
| `self`       | Only the contract itself (internal)      |
| `admin`      | Only the contract admin                  |
| `governance` | Only Superfluid governance               |
| `sender`     | Only the flow/stream sender              |
| `receiver`   | Only the flow/stream receiver            |
| `operator`   | Only an authorized flow operator         |

Combine with `|` for multiple roles:

```yaml
access: sender | receiver
```

For conditional access, add a parenthetical:

```yaml
access: sender | receiver | anyone(if-critical)
```

Omit `access` when:
- The function is `view` or `pure` (reads are always unrestricted)
- The access is obvious from context (e.g. all functions in a
  "Protocol Admin" section are clearly admin-only)

#### Superfluid Host Routing and `ctx`

In Superfluid Protocol, state-changing functions on agreements (CFA, GDA)
are not called directly. They are routed through the **Host contract** via
`batchCall` or `forwardBatchCall`. The Host extracts the real sender from
the Superfluid context and passes it through the call chain.

**The `ctx: bytes` parameter is the marker.** If a function takes `ctx`,
it must be called through the Host. If it doesn't, it's called directly.

This routing also enables **batching** — multiple agreement operations can
be combined into a single transaction via `batchCall`.

The `access` field always reflects the **logical initiator** (who can start
the action), not the direct caller (which is the Host). Document this
pattern once per section:

```yaml
# == Flow Management ==
# Functions with ctx are called through the Host's batchCall/forwardBatchCall.
# The Host resolves msg.sender from the context.
# The access field reflects who can initiate the call, not the direct caller.
```

This convention generalizes across all Superfluid agreements.

#### Ordering Within `emits` and `errors`

List events and errors in the order they appear in the contract logic —
the earliest check or emission comes first in the list.

For errors, validation checks at the top of the function (zero-address
checks, existence checks) appear before errors deeper in the execution
(insufficient balance, deposit too big).

For events, events emitted earlier in the function body appear first.

This ordering carries semantic value: when debugging a reverted transaction,
the first errors in the list are the most likely causes. When tracing
execution, the event order reflects the actual emission sequence.

```yaml
# Good — ordered by logic flow
errors:
  - CFA_ZERO_ADDRESS_RECEIVER
  - CFA_NO_SELF_FLOW
  - CFA_FLOW_ALREADY_EXISTS
  - CFA_INSUFFICIENT_BALANCE

# Bad — alphabetical, loses execution context
errors:
  - CFA_FLOW_ALREADY_EXISTS
  - CFA_INSUFFICIENT_BALANCE
  - CFA_NO_SELF_FLOW
  - CFA_ZERO_ADDRESS_RECEIVER
```

#### Comments and Gotchas

Use `#` comments for:
- **Description**: What the function does (first line under the function key)
- **GOTCHA**: Non-obvious behavior, edge cases, common mistakes
- **Inline notes**: Per-parameter clarification

```yaml
deleteFlow:
  # Stop a stream.
  # GOTCHA: Third-party callers only succeed if sender is critical. During the
  # patrician period the reward goes to the bond account; after, to the caller.
  mutability: nonpayable
  access: sender | receiver | anyone(if-critical)
  inputs:
    - token: address
    - sender: address
    - receiver: address
    - ctx: bytes
```

Prefix gotchas with `GOTCHA:` so they stand out when scanning. Keep comments
concise — if an explanation needs more than 3 lines, link to external docs.

**Remember:** comments should add signal for humans and LLMs alike. If a
function is called `getNetFlow` and it gets the net flow, don't write
`# Gets the net flow`. Instead: `# Net flow rate for an account
(inflows - outflows)` — this tells you something the name alone doesn't.

### 6. Events Section

```yaml
# == Events ==

events:
  FlowUpdated:
    # Emitted on every create/update/delete
    indexed:
      - token: address
      - sender: address
      - receiver: address
    data:
      - flowRate: int96
      - totalSenderFlowRate: int256
      - userData: bytes

  FlowUpdatedExtension:
    # Companion to FlowUpdated, carries deposit and operator info
    indexed:
      - flowOperator: address
    data:
      - deposit: uint256
```

- Nested under the reserved `events:` root key
- Each event has `indexed:` and/or `data:` fields using the same
  `- name: type` expanded syntax
- `indexed` = log topics (filterable), `data` = log payload
- Add a comment if the event name isn't self-explanatory
- Events with no indexed fields can omit `indexed:`
- Order events by importance / emission frequency

### 7. Errors Section

```yaml
# == Errors ==

errors:
  # Flow
  - CFA_FLOW_ALREADY_EXISTS
  - CFA_FLOW_DOES_NOT_EXIST
  # ACL
  - CFA_ACL_NO_SENDER_CREATE
  # Other
  - AGREEMENT_BASE_ONLY_HOST
  - APP_RULE:
      inputs:
        - _code: uint256
```

- Flat list under the reserved `errors:` root key
- Group with comment headers (`# Flow`, `# ACL`, `# Other`)
- Alphabetical within each group
- Most errors are simple strings (no inputs)
- Errors with parameters use a nested mapping with `inputs:`
- This section is a **complete index** of all errors the contract can emit
- Per-function `errors:` fields provide localized context; this section
  is the reference

## Naming Conventions

- **Section names**: Title Case (`# == Flow Management ==`)
- **Function names**: Exactly as in Solidity (camelCase)
- **Event names**: Exactly as in Solidity (PascalCase)
- **Error names**: Exactly as in Solidity (SCREAMING_SNAKE_CASE)
- **Network names**: Canonical Superfluid names (see appendix)
- **Access labels**: lowercase with `|` separator (`sender | receiver`)

## Token Efficiency Tips

- Omit fields that don't apply (no empty `inputs:` with no items)
- Omit `access` for view/pure functions (reads are unrestricted)
- Keep comments concise — link to docs for longer explanations
- Use `# == Section ==` dividers, not decorative `# ----------` lines
- Don't duplicate information between comments and structured fields
- Don't describe parameters whose names are already clear
- Section-level comments avoid repeating the same note on every function

## Appendix

### Canonical Network Names

Mainnets:
- eth-mainnet
- polygon-mainnet
- xdai-mainnet
- base-mainnet
- optimism-mainnet
- arbitrum-one
- bsc-mainnet
- avalanche-c
- scroll-mainnet

Testnets:
- eth-sepolia
- optimism-sepolia
- base-sepolia
- scroll-sepolia
- avalanche-fuji

### Mutability Values

- `view` — reads state, no gas cost when called externally
- `pure` — no state access at all
- `nonpayable` — writes state, does not accept ETH
- `payable` — writes state, accepts ETH

### Permission Bitmask (CFA-specific)

- `1` — create
- `2` — update
- `4` — delete
- Combine with bitwise OR (e.g. `7` = full control)
