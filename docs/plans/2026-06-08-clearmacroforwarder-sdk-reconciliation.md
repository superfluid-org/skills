# Reconcile Clear Macro docs with shipped @sfpro/sdk 0.2.1

## Overview

A prior autonomous run documented "Clear Macro" from an **unmerged PR (#2148) on OP Sepolia
testnet**, using a hand-authored ABI YAML routed through the `NON_SDK_ABIS` workaround in
`selectors.mjs`. The feature has since **shipped**: `@sfpro/sdk` 0.2.1 exports the forwarders, the
PR is merged to `dev`, and the contract is deployed at a **deterministic address across ~16
networks** — not testnet-only.

This plan reconciles the shipped docs with reality:
- Adopt the **skill-facing canonical name `ClearMacroForwarder`** (drop `V1`/`WithPermit2` from the
  name; note the underlying contract is `ClearMacroForwarderV1WithPermit2`). Plain `runMacro` is the
  first-class, simpler path; `runPermit2AndMacro` is an **optional** bundled Permit2 path, NOT the
  default usage.
- Migrate the ABI YAML off `NON_SDK_ABIS` onto the normal SDK `ABI_MAP` path now that
  `clearMacroForwarderAbi` is a real export.
- Remove all "TESTNET ONLY / OP Sepolia / PR #2148" framing; source addresses from the SDK /
  metadata, not the scraped provider endpoint.
- Fill the usage gaps so a developer can actually use it end-to-end (Payload shape, EIP-712
  assembly, `runMacro` vs `runPermit2AndMacro`, self-submit vs provider-relay).
- Note the legacy `MacroForwarder` is now SDK-exported as `BlindMacroForwarder`.

**Problem solved:** the skill currently gives false (testnet-only) and incomplete guidance for a
now-released contract. **Outcome:** accurate, SDK-aligned, usable Clear Macro documentation.

This is a documentation + reference repo (no application code / unit tests). "Verification" = YAML/
JSON parse, `selectors.mjs generate` zero-drift, eval runs, `grep` consistency, and SDK/metadata
spot-checks.

## Context (from discovery + Codex source review)

Files involved:
- `skills/superfluid/references/contracts/ClearMacroForwarderV1.abi.yaml` → rename to
  `ClearMacroForwarder.abi.yaml` (+ its `.selectors.yaml`).
- `skills/superfluid/references/contracts/IClearMacro.abi.yaml` (+ `.selectors.yaml`) — relax banner.
- `skills/superfluid/references/guides/clear-macro.md` — rewrite.
- `skills/superfluid/references/guides/macro-forwarders.md` — reframe legacy as `BlindMacroForwarder`.
- `skills/superfluid/scripts/selectors.mjs` — move ClearMacro from `NON_SDK_ABIS` to `ABI_MAP`.
- `skills/superfluid/scripts/abi.mjs` — add `ClearMacroForwarder` (+ `BlindMacroForwarder`).
- `skills/superfluid/SKILL.md` — routing, Apps, Ecosystem, Debugging Reverts, version frontmatter.
- `evals/cases/skill/{routing,correctness}.cases.json` — fix testnet assertions, add regression.
- `evals/cases/scripts/selectors.cases.json` — update for the renamed contract if it asserts names.
- Version files: `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`,
  `skills/superfluid/SKILL.md`, `landing-page/index.html`.
- `.vault/` — ticket T053, Home.md, roadmap.md.

## Reference (source-confirmed facts — for ralphex executor & reviewers)

Verified by Codex against `@sfpro/sdk` docs and the merged `dev` Solidity source. Reviewers:
re-confirm against the SDK package / `dev` source before approving; flag any drift.

**SDK 0.2.1 exports (both from `@sfpro/sdk/abi`, "main" module):**
- Clear: `clearMacroForwarderAbi`, `clearMacroForwarderAddress`. Contract
  `ClearMacroForwarderV1WithPermit2`. Metadata `contractsV1.clearMacroForwarderV1WithPermit2`.
  Address **`0xC1EaB73855155D4e021f7EB4f866996Bac2fe25e`** (deterministic, ~16 chains observed).
- Blind (legacy): `blindMacroForwarderAbi`, `blindMacroForwarderAddress`. Contract
  `BlindMacroForwarder` (legacy `MacroForwarder`). Metadata `contractsV1.macroForwarder`.
  Address **`0xFD0268E33111565dE546af2675351A4b1587F89F`**.

**ClearMacroForwarder surface:**
- Write: `runMacro(m, encodedPayload, signer, signature)`;
  `runPermit2AndMacro(...)` (Permit2 witness flow).
- Read/helpers: `getDigest(m, encodedPayload)`, `getNonce(signer, nonceKey)`,
  `getPermit2WitnessStructHash(m, encodedPayload, upgradeSuperToken)`,
  `getPermit2WitnessTypeString(m, encodedPayload)`, `encodeParams(actionParams, security)`.
- Constants/events to add to YAML: `PERMIT2`, event `Permit2UpgradeExecuted`, struct `Permit2Context`.

**Payload wire shape** (ABI-encoded `Payload`):
`{ action: { params: bytes }, security: { domain: string, macroContract: address,
provider: string, validAfter: uint256, validBefore: uint256, nonce: uint256 } }`.
`action.params` is macro-specific.

**EIP-712:** domain `EIP712("ClearMacro", "1")`, verifyingContract = forwarder address for the chain.
Full type string = `primaryType + "(Action action,Security security)" + actionTypeDef +
securityTypeDef`, where `primaryType = m.getPrimaryTypeName(encodedPayload)`,
`actionTypeDef = m.getActionTypeDefinition(encodedPayload)`,
`securityTypeDef = "Security(string domain,address macroContract,string provider,uint256 validAfter,uint256 validBefore,uint256 nonce)"`.
Struct hash = `keccak256(abi.encode(primaryTypeHash, m.getActionStructHash(action.params),
securityStructHash))`; dynamic strings (`domain`, `provider`) are `keccak256(bytes(...))`.
`signer` is NOT in `Security` (EOA bound by ecrecover; ERC-1271 binds inside `isValidSignature`).

**Two execution modes:**
- **Self-submit:** `security.provider = "self"` → tx executor must equal `signer`, else
  `ProviderNotAuthorized`. Simplest deterministic example.
- **Provider-relay:** non-`self` provider string is hashed to a Host SimpleACL role; the relayer
  (`msg.sender`) must hold that role. Gasless-for-signer path via the Provider API.

**`runPermit2AndMacro` (ONE signature — Permit2 witness binds the ClearMacro payload):**
- `upgradeSuperToken != address(0)` → pulls underlying via Permit2 and upgrades before running macro;
  `Permit2Context.spender` MUST be the ClearMacroForwarder address.
- `upgradeSuperToken == address(0)` → witness-only: verifies the Permit2 signature without token
  transfer or Permit2 nonce consumption.
- ⚠️ The Permit2 witness uses a DIFFERENT type string than the plain `runMacro` EIP-712 assembly
  above (constant witness type name `ClearMacro`, includes `upgradeSuperToken`, appends
  `TokenPermissions`). Do NOT hand-reuse the plain `primaryType + …` formula — call
  `getPermit2WitnessStructHash(m, encodedPayload, upgradeSuperToken)` and
  `getPermit2WitnessTypeString(m, encodedPayload)`.

**Signing for wallet UX:** user-facing examples MUST use EIP-712 `signTypedData` (macro-derived
type + message) so the wallet renders the human-readable clear-signing prompt. `getDigest` is for
verification, local/private-key signing, and parity checks — not the browser UX path.

**Remaining uncertainties (handle at implementation):**
- Re-check the live Provider API request schema against `https://clearmacro-provider.superfluid.dev/docs/json`.
- Use a concrete deployed `IClearMacro` macro address in examples (e.g. the demo macro) or clearly
  mark the macro address as user-supplied.

## Development Approach

- **Regular** (no unit-test framework). Per-task gate = the verification line in each task.
- Complete each task fully before the next; keep this plan in sync (`[x]`, ➕, ⚠️).
- Do not invent ABI signatures — derive from `clearMacroForwarderAbi` / merged `dev` source.

## Testing Strategy

- Parse checks on every edited YAML/JSON.
- `selectors.mjs generate` must run clean and produce zero drift after committing generated files.
- Eval cases run via `node evals/runners/skill-eval-runner.mjs --file routing` / `--file correctness`
  (model run; `--dry-run` acceptable mid-build, full run before completion).
- `grep` sweeps for stale `TESTNET`, `OP Sepolia`, `PR #2148`, `ClearMacroForwarderV1` naming, and
  version strings.

## Implementation Steps

### Task 1: Open ticket T053 + SDK/metadata reality check
- [x] create `.vault/tickets/T053-clear-macro-sdk-reconciliation.md` (frontmatter
      `status/priority/tags:[skill, contracts, scripts, enhancement]/created`) describing the
      SDK-0.2.1 reconciliation scope and decisions (canonical name `ClearMacroForwarder`, Permit2
      default, NON_SDK_ABIS removal, BlindMacroForwarder rename)
- [x] confirm the SDK exports + metadata key + address `0xC1Ea…` (record commands/output in the
      ticket); do not proceed to docs edits if exports differ from the Reference section
- [x] verify: ticket number unique/contiguous after T052; Home.md link resolves

### Task 2: Rename + expand the Clear ABI YAML to canonical `ClearMacroForwarder`
- [x] `git mv` `ClearMacroForwarderV1.abi.yaml` → `ClearMacroForwarder.abi.yaml`; set skill-facing
      name `ClearMacroForwarder`, note underlying contract `ClearMacroForwarderV1WithPermit2`
- [x] update `meta`: drop testnet/PR-2148 framing; `source` → SDK/`dev` URLs; add `meta.note` that
      address comes from `clearMacroForwarderAddress` / metadata `contractsV1.clearMacroForwarderV1WithPermit2`,
      deterministic across networks; EIP-712 domain `("ClearMacro","1")`
- [x] document functions per Reference: `runMacro`, `runPermit2AndMacro`, `getDigest`, `getNonce`,
      `getPermit2WitnessStructHash`, `getPermit2WitnessTypeString`, `encodeParams`; add `PERMIT2`
      constant, `Permit2Context` struct, `Permit2UpgradeExecuted` event; keep field-order convention
- [x] verify: YAML parses; the documented **functions, key events, and constants** match
      `clearMacroForwarderAbi` — including `runMacro`, `runPermit2AndMacro`, `getDigest`, `getNonce`,
      `getPermit2WitnessStructHash`, `getPermit2WitnessTypeString`, `PERMIT2`, `SELF_PROVIDER`,
      `eip712Domain`, events `Permit2UpgradeExecuted`/`EIP712DomainChanged` (not function names
      alone); grep shows no internal title claiming canonical name is `ClearMacroForwarderV1`

### Task 3: Relax the IClearMacro banner
- [x] remove TESTNET/OP-Sepolia/PR-2148 framing from `IClearMacro.abi.yaml`; keep the type-derivation
      guidance + flat `Action(...)` requirement
- [x] update the DashboardClearMacro note: it is a **chain-specific demo/reference macro** (do NOT
      claim it is deployed on every network / "mainnet-agnostic"); in examples, treat the macro
      address as **user-supplied**, with the demo address only as an optional pointer if confirmed
- [x] note: `IClearMacro` is an INTERFACE not exported by `@sfpro/sdk` — it stays in `NON_SDK_ABIS`
      (Task 4); only its stale testnet comments change here
- [x] verify: YAML parses; `grep -E "TESTNET|OP Sepolia|2148"` returns nothing in this file

### Task 4: Move Clear selectors to the SDK path
- [x] add `ClearMacroForwarder: { module: "main", export: "clearMacroForwarderAbi" }` to `ABI_MAP`
      in `selectors.mjs`; add an alias (`clearmacroforwarder`/`clearmacro`)
- [x] remove ONLY the `ClearMacroForwarderV1` entry from `NON_SDK_ABIS`; **keep `IClearMacro` in
      `NON_SDK_ABIS`** (the SDK does not export it) — just strip its stale testnet comments
- [x] verify: `selectors.mjs ClearMacroForwarder` prints selectors via the SDK; grep confirms no
      `ClearMacroForwarderV1` entry remains in `NON_SDK_ABIS` and `IClearMacro` is still present

### Task 5: Update the ABI resolver
- [x] add `ClearMacroForwarder` (+ aliases) to `abi.mjs` `ABI_MAP` using `clearMacroForwarderAbi`;
      add `BlindMacroForwarder` using `blindMacroForwarderAbi`; remove any "not in SDK" assumption
- [x] verify: `abi.mjs ClearMacroForwarder runMacro`, `... runPermit2AndMacro`, and
      `abi.mjs BlindMacroForwarder runMacro` return JSON

### Task 6: Regenerate selector sidecars
- [ ] `git mv ClearMacroForwarderV1.selectors.yaml ClearMacroForwarder.selectors.yaml` first (preserve
      history), THEN run `bunx -p @sfpro/sdk -p js-sha3 bun skills/superfluid/scripts/selectors.mjs
      generate` to rewrite its contents from the SDK ABI
- [ ] verify: command exits 0; `git status` clean after a second regenerate (zero drift); no
      `ClearMacroForwarderV1.*` files remain; every `*.abi.yaml` has a matching `*.selectors.yaml`

### Task 7: Rewrite the Clear Macro guide
- [ ] rewrite `clear-macro.md`: SDK-shipped wording, canonical `ClearMacroForwarder`, SDK import
      (`clearMacroForwarderAbi`/`clearMacroForwarderAddress`), address `0xC1Ea…`/metadata
- [ ] document end-to-end usage: Payload shape, EIP-712 type assembly, `getNonce`, security fields;
      a **self-submit** viem example AND a **provider-relay** flow (capabilities → sign → POST
      relay-executions → poll); the `runPermit2AndMacro` OPTIONAL one-signature witness flow (both
      `upgradeSuperToken` modes + the spender gotcha) framed as optional, not the default
- [ ] signing: examples MUST use `signTypedData` (macro-derived type + message) for the clear-signing
      wallet prompt; show `getDigest` only for verification/parity, not as the browser signing path;
      for Permit2 use the witness helpers, not the plain `runMacro` type formula
- [ ] addresses: forwarder from `clearMacroForwarderAddress`/metadata; **Provider API relay chain
      support comes from `/v1/capabilities`, not SDK metadata**; macro address is user-supplied
- [ ] keep a short "re-verify Provider API schema at /docs/json" note
- [ ] verify: markdown links resolve; `grep -E "TESTNET ONLY|OP Sepolia|PR #2148"` returns nothing;
      examples distinguish `signTypedData` from raw-digest signing

### Task 8: Reframe macro-forwarders.md (legacy → BlindMacroForwarder)
- [ ] note the legacy `MacroForwarder` is SDK-exported as `BlindMacroForwarder`
      (`blindMacroForwarderAbi`, addr `0xFD02…`); cross-link to `clear-macro.md`; explain when to use
      blind (caller-is-operator) vs clear (signed/relayed/Permit2)
- [ ] verify: grep consistency across `MacroForwarder`/`BlindMacroForwarder`/`ClearMacroForwarder`;
      no contradictory naming

### Task 9: Update SKILL.md routing, Apps, Ecosystem, Debugging Reverts, version
- [ ] Use-Case Map "Macro forwarders": route to `clear-macro.md`, `ClearMacroForwarder.abi.yaml`,
      `IClearMacro.abi.yaml`; drop testnet phrasing; add SDK-address/metadata + self-submit vs relay note
- [ ] Apps/Ecosystem: keep `tokens.superfluid.org/clear` as a demo link, not the address source;
      add Clear/Blind forwarder to any SDK/contract listing
- [ ] Debugging Reverts: ensure ClearMacroForwarder custom errors (`InvalidSignature`,
      `InvalidNonce`, `MacroContractMismatch`, `ProviderNotAuthorized`, `OutsideValidityWindow`,
      `InvalidPayload`) map correctly
- [ ] verify: all referenced files exist; `grep ClearMacroForwarderV1.abi.yaml SKILL.md` returns
      nothing (or only an intentional historical note)

### Task 10: Fix and extend eval cases
- [ ] rewrite `correctness-clear-macro-status` to assert SDK-shipped/multi-network status, canonical
      `ClearMacroForwarder`, `runMacro` (first-class) vs optional `runPermit2AndMacro` (one Permit2
      witness signature), and self vs provider modes
- [ ] in `evals/cases/skill/routing.cases.json`: remove the `flags_testnet_status` criteria and FLIP
      the testnet anti-patterns (testnet-only / OP-Sepolia-only / unmerged should now be the
      anti-pattern); repoint any `ClearMacroForwarderV1.abi.yaml` references to the new file name
- [ ] **`evals/cases/scripts/selectors.cases.json`**: this hard-codes `ClearMacroForwarderV1
      (non-SDK)` and `IClearMacro (non-SDK)` expectations — rewrite so `ClearMacroForwarder` is
      SDK-backed and `IClearMacro` remains non-SDK; update any `selectors.mjs list` expected output
- [ ] add a regression case (anti-pattern) that FAILS if an answer calls Clear Macro testnet-only /
      OP-Sepolia-only / unmerged; tag `regression-t053`
- [ ] verify: all touched JSON parses; run `skill-eval-runner --file routing` / `--file correctness`
      and `script-runner --file selectors`. **If the model eval cannot run after one attempt** (no
      credentials), fall back to `--dry-run`, record the exact failure in T053, and do NOT claim a
      full eval pass

### Task 11: Version bump + roadmap
- [ ] bump **1.2.0 → 1.2.1** (reconciliation/patch) across all four version files. This is the fixed
      default for autonomous execution — do NOT derive release policy from `git log`. (If the
      maintainer wants 1.3.0 or to fold into an unreleased 1.2.0, they edit this line before the run.)
- [ ] add the T053 entry to `.vault/vision/roadmap.md` (SDK reconciliation, canonical naming,
      selector migration, docs/eval refresh); update Home.md + `updated:` date
- [ ] verify: `grep -rn` the chosen version across the four files; no stale version; vault links resolve

### Task N-1: Verify acceptance criteria
- [ ] every Overview goal met; no `TESTNET`/`OP Sepolia`/`PR #2148`/`ClearMacroForwarderV1` naming
      remains except intentional historical notes
- [ ] all YAML/JSON parse; selectors zero-drift; every `*.abi.yaml` has a `*.selectors.yaml`
- [ ] `abi.mjs` + `selectors.mjs` resolve `ClearMacroForwarder`/`BlindMacroForwarder` via the SDK
- [ ] SKILL.md links resolve; version consistent; full eval run of changed/new cases passes

### Task N: Update repo docs
- [ ] update `CLAUDE.md` ONLY where applicable: if it states a contract count, adjust it; the
      `NON_SDK_ABIS` note now applies to remaining non-SDK contracts (`CFASuperAppBase`, `IClearMacro`,
      `SuperTokenV1Library`) — confirm/adjust wording. Skip silently if `CLAUDE.md` lacks these.

## Technical Details

See the **Reference** section for the Payload struct, EIP-712 assembly, the two execution modes, and
the Permit2 witness flow — those are the authoritative specs for Tasks 2 and 7.

- Rich ABI YAML conventions unchanged (reserved keys `meta`/`events`/`errors`; field order
  description→`notes`→`mutability`→`access`→`inputs`→`outputs`→`emits`→`errors`).
- `selectors.mjs`: `ABI_MAP` (SDK) vs `NON_SDK_ABIS` (hardcoded) — ClearMacro moves to the former.

## Post-Completion

*Manual / external — no checkboxes.*
- Re-verify the live Provider API schema (`/docs/json`) and a current deployed macro address before
  treating the relay example as canonical.
- If the bare `ClearMacroForwarderV1` (non-Permit2) is also deployed and worth surfacing separately,
  evaluate adding it as a secondary YAML in a later pass — out of scope here (SDK exposes only the
  Permit2 variant as `ClearMacroForwarder`).
- Confirm the ~16-network deployment list from metadata if a per-network address table is desired.

## Verification

- `bunx js-yaml <each edited *.yaml>` parses; `node -e "JSON.parse(...)"` on each eval file.
- `selectors.mjs ClearMacroForwarder` + `selectors.mjs generate` (zero drift on re-run).
- `abi.mjs ClearMacroForwarder runMacro` / `runPermit2AndMacro` / `BlindMacroForwarder runMacro`.
- `node evals/runners/skill-eval-runner.mjs --file routing` and `--file correctness`.
- `grep -rn -E "TESTNET|OP Sepolia|PR #2148|ClearMacroForwarderV1\.abi\.yaml" skills/ evals/` → only
  intentional historical references, if any.
- Version grep across the four version-bearing files.
