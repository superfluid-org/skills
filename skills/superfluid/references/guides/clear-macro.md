# Clear Macro — EIP-712 Clear Signing with Relay Execution

> Prerequisite: read `macro-forwarders.md` for the `BlindMacroForwarder` / `IUserDefinedMacro`
> pattern and batch operation types. Clear Macro extends that system.

## What is Clear Macro

`ClearMacroForwarder` extends the base `BlindMacroForwarder` (legacy `MacroForwarder`) with four
capabilities the base system lacks:

1. **EIP-712 clear signing** — the user signs a human-readable typed-data message in their wallet
   (not raw calldata). The macro derives the EIP-712 type definitions on-chain via `IClearMacro`.
2. **Third-party relaying** — execution is not limited to `msg.sender`. A relay provider can submit
   the signed payload on the signer's behalf; the signer becomes `msg.sender` inside the Host via
   EIP-2771.
3. **Replay + validity protection** — an ERC-4337-style nonce and a validity window (`validAfter`/
   `validBefore`) are carried in the signed payload and enforced on-chain.
4. **Optional Permit2 bundling** — `runPermit2AndMacro` combines a Uniswap Permit2 token pull with
   a macro call in one user signature (see [Optional: runPermit2AndMacro](#optional-runpermit2andmacro)).

**Shipped in `@sfpro/sdk` 0.2.1.** `ClearMacroForwarder` is deployed at a deterministic address
across ~16 networks. The underlying contract is `ClearMacroForwarderV1WithPermit2`.

When to use each forwarder:
- **ClearMacroForwarder** — signer ≠ tx sender (relay), need a human-readable wallet prompt, or
  need replay / validity-window protection.
- **BlindMacroForwarder** (legacy `MacroForwarder`) — caller submits the tx themselves, no relay
  required, raw calldata display in wallet is acceptable.

## Contracts & SDK Imports

```typescript
import {
  clearMacroForwarderAbi,
  clearMacroForwarderAddress,
} from '@sfpro/sdk/abi'

// Resolve address for a given chainId (e.g. 8453 for Base mainnet)
const forwarderAddr = clearMacroForwarderAddress[chainId]
// Deterministic: 0xC1EaB73855155D4e021f7EB4f866996Bac2fe25e across all supported networks
```

Resolve via `@superfluid-finance/metadata` instead:
```typescript
import metadata from '@superfluid-finance/metadata'
const forwarderAddr = metadata.networks
  .find(n => n.chainId === chainId)
  ?.contractsV1.clearMacroForwarderV1WithPermit2
```

Full ABI reference: `ClearMacroForwarder.abi.yaml`.

## Payload Shape

The `encodedPayload` argument to `runMacro` / `runPermit2AndMacro` is `abi.encode(Payload)`:

```
Payload {
  action: EncodedAction {
    params: bytes   // macro-specific; interpreted by the IClearMacro contract
  }
  security: Security {
    domain:        string   // relay provider identity (e.g. "macros.superfluid.eth")
    macroContract: address  // must match the m address passed to runMacro
    provider:      string   // provider role identifier, or "self" (SELF_PROVIDER) for self-submit
    validAfter:    uint256  // earliest valid block.timestamp (0 = no lower bound)
    validBefore:   uint256  // latest valid block.timestamp (0 = no upper bound)
    nonce:         uint256  // ERC-4337-style: (key << 64) | sequence; use getNonce
  }
}
```

`signer` is **not** in `Security` — it is passed as a separate argument to `runMacro` and bound by
ECDSA ecrecover (or ERC-1271 `isValidSignature` for smart-contract signers).

Build the encoded payload with the on-chain helper:

```typescript
const nonce = await publicClient.readContract({
  address: forwarderAddr,
  abi: clearMacroForwarderAbi,
  functionName: 'getNonce',
  args: [signerAddr, 0n], // key 0 = simple sequential nonce
})

const security = {
  domain: '',              // empty for self-submit; provider domain for relay
  macroContract: macroAddr,
  provider: 'self',        // or relay provider identifier
  validAfter: 0n,
  validBefore: 0n,         // 0 = no expiry; set to a timestamp for relay flows
  nonce,
}

const encodedPayload = await publicClient.readContract({
  address: forwarderAddr,
  abi: clearMacroForwarderAbi,
  functionName: 'encodeParams',
  args: [actionParams, security],
})
```

## EIP-712 Type Assembly

The `ClearMacroForwarder` uses EIP-712 domain `("ClearMacro", "1")`. Read the live domain from the
forwarder (do not hardcode `chainId` or `verifyingContract`):

```typescript
const [, name, version, domainChainId, verifyingContract] = await publicClient.readContract({
  address: forwarderAddr,
  abi: clearMacroForwarderAbi,
  functionName: 'eip712Domain',
})
const domain = { name, version, chainId: domainChainId, verifyingContract }
```

The type definition is **derived from the macro contract**, not the forwarder:

```typescript
// Full EIP-712 type string format:
// "<PrimaryTypeName>(Action action,Security security)<ActionTypeDef><SecurityTypeDef>"
// where ActionTypeDef and SecurityTypeDef come from the macro and are fixed strings.
const typeDef = await publicClient.readContract({
  address: forwarderAddr,
  abi: clearMacroForwarderAbi,
  functionName: 'getTypeDefinition',
  args: [macroAddr, encodedPayload],
})

const primaryType = await publicClient.readContract({
  address: macroAddr,
  abi: iClearMacroAbi, // IClearMacro ABI (see IClearMacro.abi.yaml)
  functionName: 'getPrimaryTypeName',
  args: [encodedPayload],
}) // e.g. "CreateStream"
```

Convert `typeDef` into a viem-compatible `types` object. `typeDef` is a concatenation of all type
definitions (no separators). Each token is `TypeName(field type, ...)`:

```typescript
function parseEIP712TypeDef(typeDef) {
  const types = {}
  // Match each TypeName(...) block; fields cannot contain ')'
  const re = /([A-Z]\w*)\(([^)]*)\)/g
  let m
  while ((m = re.exec(typeDef)) !== null) {
    const [, typeName, fields] = m
    types[typeName] = fields === ''
      ? []
      : fields.split(',').map(f => {
          const parts = f.trim().split(' ')
          return { type: parts[0], name: parts[1] }
        })
  }
  return types
}

const types = parseEIP712TypeDef(typeDef)
// e.g. { CreateStream: [{type:'Action',name:'action'},{type:'Security',name:'security'}],
//         Action: [{type:'bytes',name:'params'}],
//         Security: [{type:'string',name:'domain'}, ...] }
```

In practice you may also hardcode `types` for a specific macro rather than parsing at runtime.

## Execution Mode 1 — Self-Submit

Set `Security.provider = 'self'` (`SELF_PROVIDER`). The signer must be `msg.sender`; no relay
provider is involved. This is the simplest, most deterministic path.

```typescript
import { createPublicClient, createWalletClient, http } from 'viem'
import { clearMacroForwarderAbi, clearMacroForwarderAddress } from '@sfpro/sdk/abi'

const chainId = 8453 // Base mainnet (example)
const forwarderAddr = clearMacroForwarderAddress[chainId]
const macroAddr = '0x…' // user-supplied IClearMacro contract address

// 1. Get next nonce for the signer (key 0 = simple sequential)
const nonce = await publicClient.readContract({
  address: forwarderAddr,
  abi: clearMacroForwarderAbi,
  functionName: 'getNonce',
  args: [account.address, 0n],
})

// 2. Obtain actionParams from the macro's encode helper (macro-specific)
const actionParams = await publicClient.readContract({
  address: macroAddr,
  abi: macroHelperAbi,
  functionName: 'encodeAction',
  args: [/* macro-specific args */],
})

// 3. Build security struct (self-submit)
const security = {
  domain: '',
  macroContract: macroAddr,
  provider: 'self',
  validAfter: 0n,
  validBefore: 0n,
  nonce,
}

// 4. Encode payload
const encodedPayload = await publicClient.readContract({
  address: forwarderAddr,
  abi: clearMacroForwarderAbi,
  functionName: 'encodeParams',
  args: [actionParams, security],
})

// 5. Build EIP-712 domain + types from the forwarder + macro
const [, name, version, domainChainId, verifyingContract] = await publicClient.readContract({
  address: forwarderAddr,
  abi: clearMacroForwarderAbi,
  functionName: 'eip712Domain',
})
const eip712Domain = { name, version, chainId: domainChainId, verifyingContract }

const typeDef = await publicClient.readContract({
  address: forwarderAddr,
  abi: clearMacroForwarderAbi,
  functionName: 'getTypeDefinition',
  args: [macroAddr, encodedPayload],
})
const types = parseEIP712TypeDef(typeDef)

const primaryType = await publicClient.readContract({
  address: macroAddr,
  abi: iClearMacroAbi,
  functionName: 'getPrimaryTypeName',
  args: [encodedPayload],
})

// 6. Sign — wallet renders the human-readable clear-signing prompt
// Use signTypedData so the wallet shows the structured message.
// getDigest() is for verification/parity only — do NOT use it as the browser signing path.
const signature = await walletClient.signTypedData({
  domain: eip712Domain,
  types,
  primaryType,
  message: {
    // The message struct matches the primaryType; it contains action and security.
    action: { params: actionParams },
    security,
  },
})

// 7. Submit the transaction (signer == msg.sender for self-submit)
const hash = await walletClient.writeContract({
  address: forwarderAddr,
  abi: clearMacroForwarderAbi,
  functionName: 'runMacro',
  args: [macroAddr, encodedPayload, account.address, signature],
})
```

## Execution Mode 2 — Provider Relay (Gasless)

A relay provider submits the transaction on the signer's behalf. The signer only signs; gas is paid
by the provider and recovered from the signer's Super Token balance.

```
1. GET /v1/capabilities
   → discover which chains and macros the provider supports
   → get provider domain string for Security.domain / Security.provider

2. Build payload with Security.provider = <provider identifier from capabilities>
   Set a validity window (e.g. validBefore = now + 5 minutes)

3. wallet.signTypedData(domain, types, message)
   → user sees human-readable wallet prompt; returns signature

4. POST /v1/relay-executions
   → submit { kind, chainId, macroAddress, signerAddress, payload, signature }
   → receive { id }
   Note: validBefore/validAfter/nonce are ABI-encoded inside payload — do not flatten them

5. poll GET /v1/relay-executions/{id}
   → repeat with backoff until terminal state:
     succeeded | reverted | rejected | failed | expired | canceled
```

> Re-verify the live Provider API request schema against `/docs/json` before treating this
> example as canonical — the exact field names and shape may have changed.

**Provider API base URL**: `https://clearmacro-provider.superfluid.dev`

Chain support comes from `/v1/capabilities` — **not** from SDK metadata. Check the capabilities
response before prompting the user to sign.

```typescript
// 1. Fetch capabilities
const caps = await fetch(
  'https://clearmacro-provider.superfluid.dev/v1/capabilities'
).then(r => r.json())
// caps contains supported chains, macro allowlist, and provider identity

// 2–3. Build payload with provider domain, then sign (same as self-submit but
//      set security.provider and security.domain from caps, and add a validity window)
const security = {
  domain: caps.domain ?? '',
  macroContract: macroAddr,
  provider: caps.provider ?? '',
  validAfter: 0n,
  validBefore: BigInt(Math.floor(Date.now() / 1000) + 300), // 5-minute window
  nonce,
}
// ... build encodedPayload, types, and sign as in self-submit steps 4–6

// 4. Submit to relay
const relayRes = await fetch(
  'https://clearmacro-provider.superfluid.dev/v1/relay-executions',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      kind: 'clearMacroV1',
      chainId,
      macroAddress: macroAddr,
      signerAddress: signerAddr,
      payload: encodedPayload,
      signature,
    }),
  }
).then(r => r.json())
const { id } = relayRes

// 5. Poll for result (use exponential backoff in production)
async function waitForRelay(id) {
  const TERMINAL = new Set(['succeeded', 'reverted', 'rejected', 'failed', 'expired', 'canceled'])
  while (true) {
    const res = await fetch(
      `https://clearmacro-provider.superfluid.dev/v1/relay-executions/${id}`
    ).then(r => r.json())
    if (TERMINAL.has(res.status)) return res
    await new Promise(r => setTimeout(r, 2000))
  }
}
```

## Optional: runPermit2AndMacro

`runPermit2AndMacro` is an **optional** alternative to `runMacro`. It combines a Uniswap Permit2
token permit with the ClearMacro payload in **one user signature** — useful when the signer needs
to pull an underlying ERC-20 and upgrade it to a Super Token in the same operation.

The default path is `runMacro` with a plain EIP-712 signature. Only use `runPermit2AndMacro`
when the bundled Permit2 flow is specifically needed.

### Two sub-modes

- `Permit2Context.upgradeSuperToken != address(0)`: pulls underlying ERC-20 via Permit2 and
  upgrades to the specified Super Token before running the macro. Emits `Permit2UpgradeExecuted`.
  `Permit2Context.spender` **must** equal the `ClearMacroForwarder` address.
- `Permit2Context.upgradeSuperToken == address(0)`: witness-only — verifies the Permit2 signature
  without any token transfer or Permit2 nonce consumption. Binds a ClearMacro payload to a Permit2
  signature without an upgrade.

### Assembling the Permit2 witness signature

⚠️ The Permit2 witness type is **different** from the plain `runMacro` EIP-712 type. Do NOT
reuse `getTypeDefinition`. Use the witness-specific helpers from the forwarder:

```typescript
// The witness struct hash (pass as Permit2Context.witness)
const witnessStructHash = await publicClient.readContract({
  address: forwarderAddr,
  abi: clearMacroForwarderAbi,
  functionName: 'getPermit2WitnessStructHash',
  args: [macroAddr, encodedPayload, upgradeSuperTokenAddr],
})

// The witness type string (pass as Permit2Context.witnessTypeString)
// Constant witness type name is "ClearMacro"; includes TokenPermissions.
const witnessTypeString = await publicClient.readContract({
  address: forwarderAddr,
  abi: clearMacroForwarderAbi,
  functionName: 'getPermit2WitnessTypeString',
  args: [macroAddr, encodedPayload],
})

// Build and sign the Permit2 witness message using the Permit2 library or viem
// (one signature covers both the Permit2 token permission and the ClearMacro payload)

const permit2Context = {
  permit: {
    permitted: { token: underlyingTokenAddr, amount: upgradeAmount },
    nonce: permit2Nonce,
    deadline: permit2Deadline,
  },
  owner: signerAddr,
  witness: witnessStructHash,
  witnessTypeString,
  signature: permit2Signature, // single signature from the user
  spender: forwarderAddr,      // MUST be the ClearMacroForwarder address
  upgradeSuperToken: superTokenAddr, // or address(0) for witness-only mode
}

await walletClient.writeContract({
  address: forwarderAddr,
  abi: clearMacroForwarderAbi,
  functionName: 'runPermit2AndMacro',
  args: [permit2Context, macroAddr, encodedPayload],
})
```

## IClearMacro Interface

A Clear Macro contract must implement `IClearMacro`. It extends `IMacro` (the
`buildBatchOperations` / `postCheck` interface — same role as `IUserDefinedMacro` in
`BlindMacroForwarder`) with three EIP-712 type-derivation methods:

```solidity
interface IClearMacro is IMacro {
    function getPrimaryTypeName(bytes memory encodedPayload) external view returns (string memory);
    function getActionTypeDefinition(bytes memory encodedPayload) external view returns (string memory);
    function getActionStructHash(bytes memory actionParams) external view returns (bytes32);
}
```

- `getPrimaryTypeName` — returns the EIP-712 primary type name (e.g. `"CreateStream"`)
- `getActionTypeDefinition` — returns the action type definition string (e.g. `"Action(bytes params)"`)
- `getActionStructHash` — computes the struct hash for `actionParams`; used by the forwarder to
  assemble the full struct hash for signature verification

See `IClearMacro.abi.yaml` for the full interface documentation.

## DashboardClearMacro (Demo / Reference Implementation)

`DashboardClearMacro` is a **chain-specific demo and reference implementation** of `IClearMacro`.
It is not guaranteed to be deployed on every network — treat its address as user-supplied or
environment-specific.

Demo address (optimism-sepolia): `0x77232a2a953b570d1fee1fe16b1902299fe7b898`

Supported operations: Approve / Transfer / Upgrade / Downgrade Super Tokens; CreateFlow /
UpdateFlow / DeleteFlow (CFA); `describe*` view functions returning human-readable descriptions.

Use it as a reference when building your own `IClearMacro` contract.

## Notes

- **Signing path**: use `wallet.signTypedData` with the types from `getTypeDefinition` so the
  wallet renders the human-readable clear-signing prompt. `getDigest()` is for verification,
  parity checks, and private-key signing — do not use it as the browser UX signing path.
- **Replay protection**: the nonce in `Security` is consumed atomically on execution. The same
  signed payload cannot be re-submitted.
- **Provider binding**: `Security.domain` (and `Security.provider`) bind a signed payload to a
  specific relay provider. A payload signed for one provider cannot be relayed by another.
- **Signature scope**: the signed payload covers the full `Security` struct plus the action.
  The relay provider cannot alter what the macro does — only when to submit (within validity window).
- **Gasless from signer's perspective**: the relay provider pays native gas and recovers cost from
  the signer's Super Token balance. The signer must hold enough Super Token to cover the relay fee.
- **Self-submit gotcha**: `Security.provider = "self"` requires `msg.sender == signer`; any other
  sender gets `ProviderNotAuthorized`.

## Custom Errors

Errors emitted by `runMacro` / `runPermit2AndMacro` when execution is rejected:

| Error | Cause |
|---|---|
| `InvalidSignature` | EIP-712 signature does not match the signer address |
| `MacroContractMismatch` | `Security.macroContract` ≠ `m` argument to `runMacro` |
| `ProviderNotAuthorized` | `msg.sender` does not hold the required provider ACL role |
| `InvalidNonce` | nonce already consumed or sequence out of order |
| `OutsideValidityWindow` | `block.timestamp` outside `[validAfter, validBefore]` |
| `InvalidPayload` | payload structurally invalid (reserved for subcontracts) |
| `SafeERC20FailedOperation` | Permit2 token pull failed (`runPermit2AndMacro` only) |

## Links & Source

- [Demo app](https://tokens.superfluid.org/clear) — Clear Macro demo (chain-specific)
- [Superfluid Macros wiki](https://github.com/superfluid-org/protocol-monorepo/wiki/Superfluid-Macros) — design write-up
- [Provider README](https://raw.githubusercontent.com/d10r/clearmacro-provider/refs/heads/main/README.md) — provider setup and configuration
- [Provider API OpenAPI](https://clearmacro-provider.superfluid.dev/docs/json) — authoritative request/response schema (re-verify before integrating)
- `macro-forwarders.md` — BlindMacroForwarder (legacy MacroForwarder) pattern and batch operation types
- `ClearMacroForwarder.abi.yaml` — full forwarder ABI reference
- `IClearMacro.abi.yaml` — full interface ABI reference
