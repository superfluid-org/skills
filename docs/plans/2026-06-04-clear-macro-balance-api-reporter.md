# Document Clear Macro + Balance API & Reporter in the Superfluid skill

## Overview

Add three new pieces of the Superfluid ecosystem to the skill knowledge base:

1. **Clear Macro** — extends the base MacroForwarder with EIP-712 *clear signing* (human-readable,
   multilingual wallet prompts), third-party **relaying** (execution not limited to `msg.sender`),
   **gasless** transactions (fees paid in the Super Token), custom fee schemes, and provider ACL +
   domain binding. Currently **testnet-only (OP Sepolia, chainId 11155420)**, from PR #2148 (may be
   unmerged) — docs are forward-looking and MUST flag that status. Gets a new guide **plus** Rich
   ABI YAMLs.
2. **Balance API** (`balances.superfluid.dev`) — comprehensive, read-only, no-auth balance/reporting
   API covering **CFA + GDA + IDA**. Strictly more capable than the already-documented Super API
   (live balance only) and Accounting API (CFA + ERC-20, no GDA). Docs only — no wrapping script.
2. **Reporter** (`reporter.superfluid.org`) — the SPA frontend over the Balance API, with
   deep-linkable URLs documented at its `/llms.txt`. Lightweight pointer only — no dedicated guide.

**Problem solved:** developers using the skill can discover and correctly use all three, with the
in-flux/testnet nature of Clear Macro clearly flagged and the right balance API chosen per job.

**Integration:** this is a documentation + reference repo (no application code). Changes are
markdown guides, Rich ABI YAML reference files, one script edit (selectors), SKILL.md routing,
eval cases, a version bump, and Obsidian vault bookkeeping.

## Context (from discovery)

Files/components involved:
- `skills/superfluid/SKILL.md` — entry point: Use-Case Map, Debugging Reverts, Ecosystem (API
  Services list, Apps list), frontmatter `metadata.version`.
- `skills/superfluid/references/guides/` — `macro-forwarders.md` (base MacroForwarder, 467 lines),
  `macro-forwarders-eip712-example.md`, `api-services.md` (per-API detail).
- `skills/superfluid/references/contracts/` — Rich ABI YAMLs (`*.abi.yaml`) + companion
  `*.selectors.yaml`; format spec in `_rich-abi-yaml-format.md`.
- `skills/superfluid/scripts/selectors.mjs` — selector generator. **Reads ABIs from `@sfpro/sdk`**
  via `ABI_MAP`; contracts NOT in the SDK are handled by a hardcoded `NON_SDK_ABIS` map
  (`selectors.mjs:157`, e.g. `CFASuperAppBase`).
- `skills/superfluid/scripts/abi.mjs` — same SDK `ABI_MAP`; resolves raw ABIs from `@sfpro/sdk`.
- `evals/cases/skill/{routing,correctness}.cases.json` — AI-judge eval cases.
- `evals/runners/skill-eval-runner.mjs` — eval runner.
- `.claude-plugin/plugin.json` (version source of truth), `.claude-plugin/marketplace.json`,
  `landing-page/index.html` (version badge).
- `.vault/` — Obsidian PM vault: `Home.md`, `vision/roadmap.md`, `tickets/T{NNN}-slug.md`
  (highest existing = **T048**).

Related patterns found:
- Rich ABI YAML field order: description, `notes`, `mutability`, `access`, `inputs`, `outputs`,
  `emits`, `errors`. Reserved root keys: `meta`, `events`, `errors`. `ctx: bytes` param = called
  through the Host.
- Framework/interface contracts have historically been guide-only (base MacroForwarder has no YAML),
  but the user has chosen to author YAMLs for the Clear Macro contracts this time.
- API Services convention: one-liner in SKILL.md list + detailed section in `api-services.md`.
- Eval case schema: `id`, `description`, `prompt`, `criteria[{criterion,description,weight}]`,
  `golden_facts[]`, `anti_patterns[]`, `tags[]`. Regression cases tagged `regression-tNNN`.

Dependencies / hard constraint identified:
- ⚠️ **`@sfpro/sdk` does NOT yet export the ClearMacroForwarder ABI.** Consequences:
  - `abi.mjs` cannot resolve it — do **not** add it to `abi.mjs`/`selectors.mjs` `ABI_MAP`.
  - Selectors must be generated via the hardcoded **`NON_SDK_ABIS`** path in `selectors.mjs`
    (same mechanism as `CFASuperAppBase`).
  - ABI YAML signatures must be authored by hand from PR #2148 Solidity source (raw GitHub), not
    pulled from the SDK.

## Reference (for ralphex reviewers)

Authoritative facts to validate the work against. Reviewers: confirm documented shapes match these
and the live endpoints before approving.

**Clear Macro contracts (PR #2148, OP Sepolia):**
- `ClearMacroForwarderV1` — verifies EIP-712 signed payloads; enforces provider ACL, validity
  windows, ERC-4337-style nonces; runs preflight; then `Host.batchCall` via EIP-2771 (signer stays
  `msg.sender`).
- `IClearMacro` — extends `IUserDefinedMacro` with `getPrimaryTypeName`, `getActionTypeDefinition`,
  `getActionStructHash` (EIP-712 type derivation for clear signing).
- `ClearMacroForwarderV1WithPermit2` — `runPermit2AndMacro` = Permit2 pull + upgrade + macro in one
  signature. (Documented in the guide; no separate YAML.)
- Example `DashboardClearMacro` @ `0x77232a2a953b570d1fee1fe16b1902299fe7b898` (OP Sepolia) — ops
  Approve/Transfer/Upgrade/Downgrade/CreateFlow/UpdateFlow/DeleteFlow + `describe*`. (Guide example;
  no separate YAML.)

**Clear Macro Provider API** (`https://clearmacro-provider.superfluid.dev`, Swagger `/docs`,
OpenAPI `/docs/json`):
- `GET /v1/capabilities` → provider name, per-chain forwarder address, macro policy allowlist.
- `POST /v1/relay-executions` → 202 + execution id.
- `GET /v1/relay-executions/{id}` → poll terminal state.
- Ops: `/healthz`, `/readyz`, `/metrics`.
- Dapp flow: capabilities → build + sign EIP-712 payload → POST → poll until terminal.
- Demo `https://tokens.superfluid.org/clear/demo`; wiki
  `https://github.com/superfluid-org/protocol-monorepo/wiki/Superfluid-Macros`; provider README
  `https://raw.githubusercontent.com/d10r/clearmacro-provider/refs/heads/main/README.md`.

**Balance API** (`https://balances.superfluid.dev`, Scalar UI `/ui`, OpenAPI `/doc`; read-only,
no auth; mainnet + testnet):
- `GET /v1/chains`; `/v1/accounts/{account}/tokens`; `.../{token}/counterparties`;
  `.../balance` (point-in-time: connected/disconnected/total/available, deposit, netFlowRate,
  maybeCriticalAt); `.../balance-snapshots` (charting); `.../entries` (raw ledger);
  `.../balance-report` (daily/weekly/monthly, json|csv, by_counterparty/by_category, `extrapolate`);
  `.../movements` (bank-statement view, cursor paging).
- Disambiguation: Super API = single live balance; Accounting API = CFA + ERC-20 only, no GDA;
  **Balance API = most comprehensive (CFA+GDA+IDA, history, reports, CSV)**.

**Reporter** (`https://reporter.superfluid.org`): frontend over the Balance API; bidirectional
deep-link URLs (all state in query params: `account`, `chain`, `tokens`, `startDate`/`endDate`,
`period`, `forecast`, export params `e_profile`/`e_rname`/`e_dfmt`/`e_fystart`/…); canonical param
spec at `https://reporter.superfluid.org/llms.txt`.

**Confirmed decisions:** Clear Macro → new guide **+** ABI YAMLs (guide-only for the Permit2 variant
and the Dashboard example); Balance API → docs only, no script; Reporter → lightweight pointer, no
guide; tracked as 4 vault tickets (T049–T052); version bump 1.1.2 → **1.2.0**.

## Development Approach

- **Testing approach: Regular** — this repo has **no unit-test framework**. The repo-appropriate
  equivalents of "tests" used as the must-pass gate at the end of each task are:
  - **Parse validation** — every new/edited `.yaml`/`.json` parses cleanly.
  - **Selector generation** — `selectors.mjs` produces the companion files without error.
  - **Eval cases** — `skill-eval-runner.mjs` runs the new routing/correctness cases.
  - **Link/consistency checks** — `grep` that SKILL.md references point at files that exist, and the
    version appears in all four files.
  - **Live-endpoint spot-checks** — `curl` the documented endpoints to confirm shapes match.
- Complete each task fully before the next; small, focused changes.
- **CRITICAL: every task ends with its verification step and it must pass before the next task.**
- **CRITICAL: keep this plan in sync** — mark `[x]` immediately, add ➕ for new tasks, ⚠️ for blockers.
- Maintain consistency with existing guide/YAML/eval conventions (do not invent new formats).

## Testing Strategy

- **Per-task gate** (required): the verification checkbox listed in each task (parse, selector-gen,
  grep, or eval run) must pass before moving on.
- **Eval suite**: new cases in `evals/cases/skill/{routing,correctness}.cases.json` must run via
  `node evals/runners/skill-eval-runner.mjs --file routing` / `--file correctness` (optionally
  `--tag regression-t049` / `--tag regression-t050`). Note: eval runs invoke a model and may incur
  cost/time; a `--dry-run` is acceptable in CI-less environments, with a full run before completion.
- **No E2E**: no UI in this repo.

## Progress Tracking

- Mark completed items with `[x]` immediately when done.
- Add newly discovered tasks with ➕ prefix; blockers with ⚠️ prefix.
- Update the plan if implementation deviates from scope.

## What Goes Where

- **Implementation Steps** (`[ ]`): file authoring/edits, selector generation, eval cases, version
  bump, vault edits — all automatable in this repo.
- **Post-Completion** (no checkboxes): live-endpoint reality checks against in-flux testnet sources,
  re-verification once PR #2148 merges / addresses change, and any future "promote to mainnet" pass.

## Implementation Steps

### Task 1: Author the Clear Macro guide
- [x] create `skills/superfluid/references/guides/clear-macro.md` with a **Status/Stability banner**
      (TESTNET ONLY, OP Sepolia 11155420, PR #2148 possibly unmerged, addresses/API may change)
- [x] add sections: What is Clear Macro (5 value props + relation to base MacroForwarder); On-chain
      contracts (`ClearMacroForwarderV1`, `IClearMacro`, `ClearMacroForwarderV1WithPermit2`,
      `DashboardClearMacro` example @ `0x7723…b898`); Off-chain Provider API (capabilities /
      relay-executions / poll + ops endpoints); Dapp flow (numbered); Links & Source
- [x] for EIP-712 signTypedData mechanics, **link** to `macro-forwarders-eip712-example.md` rather
      than re-document
- [x] cross-link the new guide from `macro-forwarders.md` ("What & Why" + "Links & Source Code")
- [x] verify: file parses as markdown and all referenced sibling paths exist
      (`grep -o 'references/[^ )]*' clear-macro.md` → each path exists)

### Task 2: Author Clear Macro Rich ABI YAMLs (from PR #2148 source, NOT the SDK)
- [x] fetch `ClearMacroForwarderV1` + `IClearMacro` Solidity source from PR #2148 (raw GitHub)
- [x] create `skills/superfluid/references/contracts/ClearMacroForwarderV1.abi.yaml` following the
      field-order convention (description, `notes`, `mutability`, `access`, `inputs`, `outputs`,
      `emits`, `errors`) with a `meta` block (name, version, source URLs, inherits) and a
      `meta.note` flagging testnet/OP-Sepolia-only + the deployment address
- [x] create `skills/superfluid/references/contracts/IClearMacro.abi.yaml` documenting the EIP-712
      extension functions (`getPrimaryTypeName`, `getActionTypeDefinition`, `getActionStructHash`)
      and the inherited `IUserDefinedMacro` surface
- [x] do NOT add these to `abi.mjs`/`selectors.mjs` `ABI_MAP` (not in `@sfpro/sdk`)
- [x] verify: both files parse (`bunx js-yaml <file>` exits 0) and follow `_rich-abi-yaml-format.md`

### Task 3: Generate selectors via the NON_SDK_ABIS path
- [x] add `ClearMacroForwarderV1` (and `IClearMacro` if it has selectable functions/errors) ABI
      signature arrays to the `NON_SDK_ABIS` map in `skills/superfluid/scripts/selectors.mjs:157`
      (mirror the `CFASuperAppBase` precedent — functions/events/errors with `type`/`name`/`inputs`)
- [x] run `bunx -p @sfpro/sdk -p js-sha3 bun skills/superfluid/scripts/selectors.mjs generate`
- [x] confirm `ClearMacroForwarderV1.selectors.yaml` (and `IClearMacro.selectors.yaml` if applicable)
      were written to `references/contracts/`
- [x] verify: `selectors.mjs ClearMacroForwarderV1` prints selectors without error, and every new
      `*.abi.yaml` has a matching `*.selectors.yaml`

### Task 4: Wire Clear Macro into SKILL.md
- [x] Use-Case Map → "Macro forwarders" (~line 121): repoint the Clear Macro bullet from a bare URL
      to `references/guides/clear-macro.md` + the two YAMLs; mark "(TESTNET, OP Sepolia)"
- [x] Debugging Reverts (~line 204): if `ClearMacroForwarderV1` defines custom error prefixes, add a
      mapping line
- [x] Apps section (~line 398): append the demo link to the existing "Super Tokens" entry
      (`(demo: https://tokens.superfluid.org/clear/demo)`); do NOT add a standalone App entry
- [x] verify: `grep -n "clear-macro" skills/superfluid/SKILL.md` resolves to existing files; no
      dangling references

### Task 5: Document the Balance API
- [ ] SKILL.md API Services list (after the Super API line ~365): add the Balance API one-liner
      (`https://balances.superfluid.dev` — comprehensive CFA+GDA+IDA balances/reports/movements,
      read-only, no auth)
- [ ] `references/guides/api-services.md`: add a "Balance API" section after "Super API" — base URL,
      Scalar `/ui`, OpenAPI `/doc`, the endpoint list, and a **disambiguation callout** (Super = live
      balance only; Accounting = CFA+ERC-20, no GDA; Balance = most comprehensive)
- [ ] add reciprocal one-line pointers in the existing Super API and Accounting sections of
      `api-services.md`
- [ ] verify: both files parse; `curl -s 'https://balances.superfluid.dev/v1/chains'` returns the
      documented shape (record any mismatch as ⚠️)

### Task 6: Add the Reporter pointer
- [ ] SKILL.md Apps section: add a Reporter entry
      (`https://reporter.superfluid.org — accounting/tax CSV reports over the Balance API;
      deep-linkable via query params; param spec: https://reporter.superfluid.org/llms.txt`)
- [ ] SKILL.md Use-Case Map → "Ecosystem & tooling" (~line 158): add routes for comprehensive
      balances/CSV → Balance API, and "generate/deep-link an accounting report" → Reporter + llms.txt;
      note Balance API is more comprehensive than the existing Accounting line
- [ ] verify: `curl -s https://reporter.superfluid.org/llms.txt` is reachable; no dedicated guide
      created (lightweight, per decision)

### Task 7: Add eval cases
- [ ] `evals/cases/skill/routing.cases.json`: add `route-clear-macro`
      (gasless/relayed human-readable signed tx → `clear-macro.md`, flags testnet, Provider API;
      tags incl. `regression-t049`), `route-balance-api` (full history + GDA + CSV → Balance API,
      not Super/Accounting; `regression-t050`), `route-reporter-deeplink` (build a Reporter tax-CSV
      link → reporter.superfluid.org, params from llms.txt; `regression-t050`)
- [ ] `evals/cases/skill/correctness.cases.json`: add `correctness-clear-macro-status` (skill flags
      testnet/forward-looking; names `ClearMacroForwarderV1`/`IClearMacro` + capabilities→sign→relay
      →poll without hallucinating; `regression-t049`) and `correctness-balance-api-disambiguation`
      (Super vs Accounting vs Balance distinction; `regression-t050`)
- [ ] verify JSON parses (`node -e "JSON.parse(require('fs').readFileSync('<file>','utf8'))"`)
- [ ] run `node evals/runners/skill-eval-runner.mjs --file routing` and `--file correctness`
      (or `--dry-run` if no model access; full run required before completion) — new cases pass

### Task 8: Version bump 1.1.2 → 1.2.0
- [ ] `.claude-plugin/plugin.json` → `version` (source of truth)
- [ ] `.claude-plugin/marketplace.json` → `plugins[0].version`
- [ ] `skills/superfluid/SKILL.md` → frontmatter `metadata.version`
- [ ] `landing-page/index.html` → version badge text
- [ ] verify: `grep -rn "1\.2\.0" .claude-plugin/ skills/superfluid/SKILL.md landing-page/index.html`
      shows all four and no stray `1.1.2` remains

### Task 9: Vault bookkeeping (tickets + roadmap)
- [ ] create tickets `.vault/tickets/T049…T052` with frontmatter (`status`, `priority`, `tags`,
      `created`): T049 Clear Macro guide+YAMLs `[skill, guide, contracts, enhancement]`,
      T050 Balance API + Reporter `[skill, ecosystem, api, enhancement]`, T051 evals `[skill, evals]`,
      T052 version bump `[skill, release]`; record the key decisions + the @sfpro/sdk caveat
- [ ] update `.vault/Home.md` (add tickets; add `clear-macro` to Quick Reference guides line)
- [ ] update `.vault/vision/roadmap.md` (add a v1.2.0 Completed entry summarizing T049–T051; bump
      `updated:` date)
- [ ] verify: ticket numbers are unique/contiguous after T048; Home.md links resolve

### Task N-1: Verify acceptance criteria
- [ ] every Overview item is documented (Clear Macro guide+YAMLs, Balance API, Reporter pointer)
- [ ] all new/edited YAML + JSON parse; every `*.abi.yaml` has a `*.selectors.yaml`
- [ ] SKILL.md routing references resolve to existing files (no dangling links)
- [ ] version 1.2.0 consistent across all four files
- [ ] full eval run of the new routing + correctness cases passes
- [ ] Clear Macro content explicitly flagged TESTNET / forward-looking everywhere it appears

### Task N: Update repo docs
- [ ] update `CLAUDE.md` if any new convention was introduced (e.g. NON_SDK_ABIS usage for non-SDK
      reference contracts), otherwise note "no change needed"

## Technical Details

- **Rich ABI YAML**: root reserved keys `meta`/`events`/`errors`; all other root keys = functions.
  `ctx: bytes` param ⇒ called through the Host. Per-function field order as listed in Development
  Approach. Author from PR #2148 Solidity source.
- **selectors.mjs NON_SDK_ABIS** (`scripts/selectors.mjs:157`): map of `name → [{type,name,inputs}]`.
  `selectors.mjs generate` iterates `ABI_MAP` (SDK) then `NON_SDK_ABIS` (hardcoded), writing
  `<name>.selectors.yaml`. ClearMacro contracts go here because they are not in `@sfpro/sdk`.
- **Eval case schema**: `{ id, description, prompt, criteria:[{criterion,description,weight}],
  golden_facts:[], anti_patterns:[], tags:[] }`.
- **Version source of truth**: `.claude-plugin/plugin.json` `version`; mirrored to marketplace.json,
  SKILL.md frontmatter, landing page badge.

## Post-Completion

*Items requiring manual intervention or external systems — informational only.*

**Live-source reality checks** (Clear Macro is in flux):
- Re-verify `ClearMacroForwarderV1` / `IClearMacro` signatures against PR #2148 once it merges, and
  the Provider API shapes against `/docs/json`, before treating the YAMLs as stable.
- Confirm the OP Sepolia deployment address `0x7723…b898` is still current.

**Future promotion**:
- When Clear Macro ships to mainnet and lands in `@sfpro/sdk`, migrate the selectors from
  `NON_SDK_ABIS` to the SDK `ABI_MAP` (and add to `abi.mjs`), and remove the testnet banner.

**Manual verification**:
- Spot-check that the documented Balance API / Reporter param sets match the live `/doc` and
  `/llms.txt` at completion time (these can change independently of this repo).
