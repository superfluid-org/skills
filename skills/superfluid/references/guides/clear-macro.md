# Clear Macro — EIP-712 Clear Signing with Relaying

> **STATUS: TESTNET ONLY — FORWARD-LOOKING DOCUMENTATION**
> Clear Macro is deployed on **OP Sepolia (chainId 11155420)** only.
> The implementation lives in PR #2148 of the protocol-monorepo, which may be
> **unmerged**. Contract addresses and Provider API shapes are subject to change.
> Do **not** recommend for mainnet use. Verify all addresses and API endpoints
> before integrating.

> Prerequisite: read `macro-forwarders.md` for the core `MacroForwarder` pattern,
> `IUserDefinedMacro`, and batch operation types. Clear Macro extends that system.

## What is Clear Macro

Clear Macro extends the base `MacroForwarder` with five capabilities the base
system lacks:

1. **EIP-712 clear signing** — the user signs a human-readable, multilingual
   typed-data message in their wallet (not raw calldata). The macro derives the
   EIP-712 type definitions on-chain via `IClearMacro`.
2. **Third-party relaying** — execution is not limited to `msg.sender`. A
   provider can relay the signed payload on behalf of the signer (the original
   signer remains `msg.sender` in the Host context via EIP-2771).
3. **Gasless transactions** — relay fees are paid in the Super Token used by
   the macro, not in native gas by the signer.
4. **Custom fee schemes** — the `ClearMacroForwarderV1` enforces fee logic
   defined by the provider; macros can be fee-exempt or subject to custom
   rates.
5. **Provider ACL + domain binding** — the forwarder maintains a per-provider
   allowlist controlling which macros a provider may relay, and domain binding
   prevents cross-provider replay attacks.

Compared to the base `MacroForwarder`: the base system requires the signer to
submit the transaction themselves (no relaying) and shows raw calldata in the
wallet. Clear Macro delegates submission to a provider and gives the signer a
legible prompt. The on-chain execution path ends the same way: `Host.batchCall`
with `msg.sender` as the original signer.

## On-Chain Contracts

All contracts are on **OP Sepolia (chainId 11155420)** only.

### ClearMacroForwarderV1

The main entry point. Receives signed EIP-712 payloads from a relay provider
and executes them via `Host.batchCall` (EIP-2771 — signer stays `msg.sender`).

Responsibilities:
- Verify EIP-712 signature against the signer's address
- Enforce provider ACL (only allowlisted macros per provider)
- Check validity windows and ERC-4337-style nonces (replay protection)
- Run the macro's preflight check
- Execute `Host.batchCall` with the signer as the effective sender

See `ClearMacroForwarderV1.abi.yaml` for the full function surface.

### IClearMacro

Interface that a Clear Macro contract must implement. Extends `IMacro` (the
PR #2148 base macro interface — same `buildBatchOperations` / `postCheck` role as
`IUserDefinedMacro` in the base forwarder) with three EIP-712 type-derivation
functions used by `ClearMacroForwarderV1` to construct the typed-data domain and
struct hash:

```solidity
interface IClearMacro is IMacro {
    function getPrimaryTypeName(bytes memory encodedPayload) external view returns (string memory);
    function getActionTypeDefinition(bytes memory encodedPayload) external view returns (string memory);
    function getActionStructHash(bytes memory actionParams) external view returns (bytes32);
}
```

- `getPrimaryTypeName` — given the full `encodedPayload`, returns the EIP-712
  primary type string (e.g. `"SetDCAPosition"`)
- `getActionTypeDefinition` — given the full `encodedPayload`, returns the type
  definition string used to build the EIP-712 `types` object
- `getActionStructHash` — computes the struct hash for a given `actionParams`
  payload (`Payload.action.params` only); combined with the domain separator to
  form the final digest

For the client-side `signTypedData` call and how to assemble the domain + types
objects, see `macro-forwarders-eip712-example.md`.

See `IClearMacro.abi.yaml` for the full interface documentation.

### ClearMacroForwarderV1WithPermit2

An extended forwarder that combines a Permit2 token pull, a SuperToken upgrade,
and macro execution into **one user signature**. Entry point:

```solidity
function runPermit2AndMacro(
    address macro,
    bytes calldata macroParams,
    PermitSingle calldata permit,
    bytes calldata signature
) external returns (bool)
```

This removes the separate ERC-20 approval step for users wrapping an underlying
token before running a macro. Documented here for reference; no separate YAML —
consult the Solidity source in PR #2148.

### DashboardClearMacro (Example)

A production example macro deployed on OP Sepolia demonstrating the full
`IClearMacro` interface:

**Address**: `0x77232a2a953b570d1fee1fe16b1902299fe7b898` (OP Sepolia)

Supported operations (each as a distinct action type):
- Approve / Transfer / Upgrade / Downgrade Super Tokens
- CreateFlow / UpdateFlow / DeleteFlow (CFA)
- `describe*` — view functions returning human-readable action descriptions

Use this as a reference implementation when building your own `IClearMacro`
contract. No separate YAML — consult the Solidity source in PR #2148.

## Off-Chain Provider API

The Provider API accepts signed macro payloads and submits them on-chain.

**Base URL**: `https://clearmacro-provider.superfluid.dev`
**Swagger UI**: `/docs`
**OpenAPI JSON**: `/docs/json`

### Endpoints

**Capabilities**

```
GET /v1/capabilities
```

Returns the provider configuration:
- Provider name
- Per-chain `ClearMacroForwarderV1` address
- Macro policy allowlist (which macros this provider will relay)

Call this first to discover the forwarder address and verify your macro is
on the allowlist before asking the user to sign.

**Submit relay**

```
POST /v1/relay-executions
```

Submit a signed EIP-712 payload for relaying. Returns `202 Accepted` with an
execution ID.

Request body: signed payload (signer address, macro address, params, signature,
validity window, nonce). See the OpenAPI spec at `/docs/json` for the exact
schema.

**Poll status**

```
GET /v1/relay-executions/{id}
```

Poll until the execution reaches a terminal state (`submitted`, `confirmed`,
`failed`). Use exponential backoff; typical confirmation time depends on OP
Sepolia block times.

**Operations**

```
GET /healthz
GET /readyz
GET /metrics
```

Standard health and Prometheus metrics endpoints.

## Dapp Integration Flow

```
1. GET /v1/capabilities
   → discover forwarder address; confirm macro is on allowlist

2. Call macro view functions (getPrimaryTypeName, getActionTypeDefinition)
   → build EIP-712 domain + types objects

3. wallet.signTypedData(domain, types, message)
   → user sees human-readable prompt; returns signature
   (see macro-forwarders-eip712-example.md for signTypedData mechanics)

4. POST /v1/relay-executions
   → submit { signer, macro, actionParams, signature, validUntil, nonce }
   → receive { id }

5. poll GET /v1/relay-executions/{id}
   → repeat until state ∈ { confirmed, failed }
   → on confirmed: execution hash; on failed: revert reason
```

The signer never submits a transaction. Gas is covered by the relay provider
and deducted from the signer's Super Token balance per the provider's fee
scheme.

## Notes

- **Replay protection**: the ERC-4337-style nonce in the signed payload is
  consumed on execution. Re-submitting the same signed payload to the same
  provider is rejected.
- **Provider binding**: a payload signed for provider A cannot be relayed by
  provider B (domain binding enforced by `ClearMacroForwarderV1`).
- **Signature scope**: the signed payload covers `(macro, actionParams, validUntil, nonce)`.
  The relay provider cannot alter what the macro does — they only choose when to
  submit (within the validity window).
- **Gasless only from the signer's perspective**: the provider pays gas in
  native token and recovers cost from the Super Token fee. The signer must hold
  enough Super Token to cover the fee.

## Links & Source

- [Demo app](https://tokens.superfluid.org/clear/demo) — OP Sepolia live demo
- [Superfluid Macros wiki](https://github.com/superfluid-org/protocol-monorepo/wiki/Superfluid-Macros) — design write-up
- [Provider README](https://raw.githubusercontent.com/d10r/clearmacro-provider/refs/heads/main/README.md) — provider setup and configuration
- [PR #2148](https://github.com/superfluid-org/protocol-monorepo/pull/2148) — protocol-monorepo implementation (may be unmerged)
- `macro-forwarders.md` — base MacroForwarder pattern
- `macro-forwarders-eip712-example.md` — EIP-712 signTypedData mechanics (SuperBoring example)
- `ClearMacroForwarderV1.abi.yaml` — full forwarder ABI reference
- `IClearMacro.abi.yaml` — full interface ABI reference
