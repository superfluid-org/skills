# Rich ABI YAML — Alignment with ABI & NatSpec Standards

## The Three Existing Specs

### 1. Solidity ABI JSON (compiler output)
Flat array of objects. No grouping, no comments, no relationships.

```json
[
  {
    "type": "function",
    "name": "createFlow",
    "stateMutability": "nonpayable",
    "inputs": [
      { "name": "token", "type": "address" },
      { "name": "receiver", "type": "address" },
      { "name": "flowRate", "type": "int96" },
      { "name": "ctx", "type": "bytes" }
    ],
    "outputs": [
      { "name": "newCtx", "type": "bytes" }
    ]
  },
  {
    "type": "event",
    "name": "FlowUpdated",
    "anonymous": false,
    "inputs": [
      { "name": "token", "type": "address", "indexed": true },
      { "name": "sender", "type": "address", "indexed": true },
      { "name": "flowRate", "type": "int96", "indexed": false }
    ]
  },
  {
    "type": "error",
    "name": "CFA_FLOW_ALREADY_EXISTS",
    "inputs": []
  }
]
```

**Key fields per type:**

| type        | fields                                                    |
|-------------|-----------------------------------------------------------|
| function    | name, stateMutability, inputs[], outputs[]                |
| constructor | stateMutability, inputs[]                                 |
| event       | name, inputs[] (with indexed), anonymous                  |
| error       | name, inputs[]                                            |
| receive     | stateMutability (payable)                                 |
| fallback    | stateMutability                                           |

Each input/output: `{ name, type, components?, indexed?, internalType? }`
- `components` — used for tuple types (structs)
- `internalType` — Solidity-specific type info (e.g. `contract ISuperToken`)

### 2. NatSpec (in-source documentation → JSON output)

**In-source tags:**

| Tag              | Where                  | Purpose                              |
|------------------|------------------------|--------------------------------------|
| @title           | contract               | Title of the contract                |
| @author          | contract, function     | Author name                          |
| @notice          | contract, function, event, error, enum | User-facing description   |
| @dev             | contract, function, event, error, enum | Developer-facing notes    |
| @param           | function               | Describes a parameter                |
| @return          | function               | Describes a return value             |
| @inheritdoc      | function               | Inherit docs from base contract      |
| @custom:\<name\> | anywhere               | Custom annotation for third-party tools |

**Compiler output (two separate JSON files):**

User doc (`userdoc`):
```json
{
  "kind": "user",
  "version": 1,
  "methods": {
    "createFlow(address,address,int96,bytes)": {
      "notice": "Start a new stream from msg.sender to receiver"
    }
  }
}
```

Dev doc (`devdoc`):
```json
{
  "kind": "dev",
  "version": 1,
  "title": "Constant Flow Agreement v1",
  "author": "Superfluid",
  "methods": {
    "createFlow(address,address,int96,bytes)": {
      "details": "Requires sufficient balance for deposit...",
      "params": {
        "token": "The SuperToken to stream",
        "flowRate": "Tokens per second in wei"
      },
      "returns": {
        "newCtx": "Updated Superfluid context"
      }
    }
  }
}
```

**Key observation:** NatSpec keys functions by canonical signature (`name(type,type,...)`),
not by name alone. This matters for overloaded functions.

### 3. ethers.js Human-Readable ABI

```js
[
  "function createFlow(address token, address receiver, int96 flowRate, bytes ctx) returns (bytes newCtx)",
  "event FlowUpdated(address indexed token, address indexed sender, int96 flowRate)",
  "error CFA_FLOW_ALREADY_EXISTS()"
]
```

Compact, single-line per item. Includes names, types, modifiers, indexed markers.
No comments or descriptions. Designed for code, not documentation.

---

## Rich ABI YAML — What It Combines

Our format is the **union** of all three, plus protocol-specific context:

```
Rich ABI YAML = ABI structure + NatSpec documentation + protocol context
```

### Field-by-Field Mapping

#### Meta (contract-level)

| Rich ABI YAML      | ABI JSON    | NatSpec              | Rich ABI extension  |
|---------------------|-------------|----------------------|---------------------|
| meta.name           | —           | —                    | ✓ new               |
| meta.version        | —           | —                    | ✓ new               |
| meta.source         | —           | —                    | ✓ new               |
| meta.implements     | —           | —                    | ✓ new               |
| meta.inherits       | —           | —                    | ✓ new               |
| meta.deployments    | —           | —                    | ✓ new               |
| # title comment     | —           | @title               | maps to NatSpec     |
| # NOTE comment      | —           | @dev (contract)      | maps to NatSpec     |

#### Functions

| Rich ABI YAML       | ABI JSON           | NatSpec              | Rich ABI extension  |
|----------------------|--------------------|----------------------|---------------------|
| (key = fn name)      | name               | method key (sig)     | same data, YAML key |
| mutability           | stateMutability    | —                    | renamed for brevity |
| selector             | —                  | —                    | ✓ new (derivable)   |
| access               | —                  | —                    | ✓ new               |
| inputs               | inputs[]           | @param               | merged              |
| outputs              | outputs[]          | @return              | merged              |
| emits                | —                  | —                    | ✓ new               |
| errors (per-fn)      | —                  | —                    | ✓ new               |
| # description        | —                  | @notice              | maps to NatSpec     |
| # GOTCHA             | —                  | @dev                 | maps to NatSpec     |
| # per-param comment  | —                  | @param \<name\>      | maps to NatSpec     |

#### Events

| Rich ABI YAML       | ABI JSON           | NatSpec              | Rich ABI extension  |
|----------------------|--------------------|----------------------|---------------------|
| events.\<name\>      | name + type:event  | —                    | same                |
| indexed              | indexed: true      | —                    | split into own field|
| data                 | indexed: false     | —                    | split into own field|
| anonymous            | anonymous          | —                    | omitted (rare)      |
| # comment            | —                  | @notice              | maps to NatSpec     |

#### Errors

| Rich ABI YAML       | ABI JSON           | NatSpec              | Rich ABI extension  |
|----------------------|--------------------|----------------------|---------------------|
| errors list          | name + type:error  | —                    | same                |
| inputs (on error)    | inputs[]           | —                    | same                |
| # group comments     | —                  | —                    | ✓ new               |

---

## Naming Alignment Decisions

### `mutability` vs `stateMutability`

The ABI spec uses `stateMutability`. We shortened to `mutability`.

**Recommendation:** Keep `mutability` — it's unambiguous in context and saves 5 chars
per function. Any tooling converting to/from ABI JSON can map trivially.

### `inputs` as `[name: type]` vs `[{name, type}]`

ABI JSON uses verbose objects: `[{"name": "token", "type": "address"}]`
We use compact YAML: `[token: address, receiver: address]`

They carry the same information. The YAML form is ~60% fewer tokens.

**For tuple/struct types**, we'd need to extend our syntax:

```yaml
# ABI JSON for a struct parameter:
# { "name": "config", "type": "tuple", "components": [{"name": "a", "type": "uint256"}, ...] }

# Rich ABI YAML equivalent:
inputs:
  - config:
      type: tuple
      components: [a: uint256, b: address]
```

This handles the ABI's `components` field while staying YAML-native.

### Function key vs canonical signature

NatSpec uses `createFlow(address,address,int96,bytes)` as the key.
We use `createFlow` as the YAML key.

**Trade-off:**
- YAML key: cleaner, scannable, but doesn't handle overloaded functions
- Canonical signature: unambiguous, but noisy

**Recommendation:** Use the function name as key. For the rare overloaded function,
append a disambiguator: `transfer_address_uint256` or use the selector.

### `indexed` split into separate fields

ABI JSON mixes indexed and non-indexed params in one array with a boolean flag.
We split into `indexed` and `data` fields.

**Advantage:** Immediately clear which fields are filterable (topics) vs payload.
**Round-trip:** Trivially convertible — merge both arrays, set `indexed` boolean.

---

## What Rich ABI YAML Adds Beyond Both Specs

These fields have **no equivalent** in either ABI JSON or NatSpec:

| Field               | Value                                                        |
|---------------------|--------------------------------------------------------------|
| `selector`          | 4-byte function selector (derivable but convenient)          |
| `access`            | Role-based access control labels                             |
| `emits`             | Which events a function emits                                |
| `errors` (per-fn)   | Which errors a function can throw                            |
| `implements`        | Interfaces the contract fulfills                             |
| `inherits`          | Base contracts                                               |
| `deployments`       | On-chain addresses per network                               |
| Abbreviations       | Protocol-specific abbreviation reference                     |
| Glossary            | Domain concept definitions                                   |
| Section grouping    | Logical function organization by domain                      |
| GOTCHA comments     | Non-obvious behavior warnings                                |
| Ordering semantics  | emits/errors ordered by execution flow                       |

This is the core value proposition: **these relationships exist in the source code
and developer knowledge, but are not captured by any standard format.**

---

## Round-Trip Conversion Compatibility

### Rich ABI YAML → ABI JSON (lossless for ABI fields)

Every ABI JSON field is present in Rich ABI YAML:
- `type` → inferred from section (functions, events, errors)
- `stateMutability` → `mutability`
- `inputs/outputs` → parse `[name: type]` syntax
- `indexed` → reconstruct from `indexed` + `data` fields
- `anonymous` → assumed false unless annotated

The reverse direction (ABI JSON → Rich ABI YAML) produces a valid but
impoverished file — no comments, no grouping, no emits/errors/access.

### Rich ABI YAML → NatSpec JSON (partial)

- `# description` → `notice`
- `# GOTCHA / dev notes` → `details`
- `# per-param comments` → `params`
- Contract-level `# title` → `title`

NatSpec fields we don't explicitly model:
- `@author` — could add to meta if needed (low value for AI context)
- `@inheritdoc` — not applicable (we document each function directly)
- `@custom:<name>` — our `access`, `emits`, `errors` serve this role

---

## Struct/Tuple Handling (Gap to Address)

The current Rich ABI YAML doesn't have a convention for struct types.
ABI JSON handles this with `type: "tuple"` and `components`.

**Proposed convention:**

For simple structs inline:
```yaml
inputs: [config: "(uint256 a, address b)"]
```

For complex/nested structs, use a types section:
```yaml
# == Types ==
types:
  FlowConfig:
    components: [token: address, sender: address, receiver: address, flowRate: int96]

# Then reference by name:
inputs: [config: FlowConfig]
```

This would mirror Solidity's `internalType` field from the ABI JSON, which
already carries the struct name (e.g. `struct IFlowNFTBase.FlowConfig`).

---

## Summary: What the Format Actually Is

Rich ABI YAML is a **superset** of ABI JSON + NatSpec, expressed in YAML,
with protocol-specific extensions:

```
┌─────────────────────────────────────────────┐
│           Rich ABI YAML                     │
│  ┌───────────────────────────────────────┐  │
│  │  ABI JSON fields                      │  │
│  │  (mutability, inputs, outputs,        │  │
│  │   events, errors)                     │  │
│  └───────────────────────────────────────┘  │
│  ┌───────────────────────────────────────┐  │
│  │  NatSpec documentation                │  │
│  │  (notice → comments, dev → GOTCHA,    │  │
│  │   param → per-param comments)         │  │
│  └───────────────────────────────────────┘  │
│  ┌───────────────────────────────────────┐  │
│  │  Protocol context (new)               │  │
│  │  (selector, access, emits, errors     │  │
│  │   per-fn, implements, inherits,       │  │
│  │   deployments, glossary, grouping)    │  │
│  └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

It's designed so that:
1. Any ABI JSON can be **mechanically converted** to a minimal Rich ABI YAML
2. A Rich ABI YAML can be **mechanically converted back** to ABI JSON (losing only the extensions)
3. NatSpec can be **ingested** during authoring to pre-populate comments
4. The extensions (emits, errors, access) require **human or AI analysis** of source code
