# Privacy-Preserving x402 Facilitator

- **Author(s)**: Ryan (@ryanchristo)
- **Editor(s)**: NA
- **Date (created)**: 2026-01-20
- **Date (updated)**: NA
- **Sprint**: Cohort 11

## Short Description

Assess the technical requirements and viability of developing a privacy-preserving x402 facilitator, comparing EVM-native privacy improvements with more advanced integrations with privacy layers for shielded payments.

## Table of Contents

- [Executive Summary](#executive-summary)
- [Privacy Framework](#privacy-framework)
  - [Privacy and x402](#privacy-and-x402)
  - [Potential Adversaries](#potential-adversaries)
  - [Selective Disclosure](#selective-disclosure)
  - [Privacy Requirements](#privacy-requirements)
- [Baseline Implementation](#baseline-implementation)
  - [Current x402 Facilitator](#current-x402-facilitator)
  - [Planned x402 v2 Features](#planned-x402-v2-features)
  - [Architecture Considerations](#architecture-considerations)
- [Option A: EVM Improvements](#option-a-evm-improvements)
  - [High-Level Architecture](#option-a-high-level-architecture)
  - [EVM Exact Flow and What Changes](#option-a-evm-exact-flow-and-what-changes)
  - [Core Technical Requirements](#option-a-core-technical-requirements)
  - [Candidate Approaches](#option-a-candidate-approaches)
  - [Feasibility / Open Questions](#option-a-feasibility)
- [Option B: Aztec + Noir](#option-b-aztec--noir)
  - [High-Level Architecture](#option-b-high-level-architecture)
  - [EVM Exact Flow and What Changes](#option-b-evm-exact-flow-and-what-changes)
  - [Core Technical Requirements](#option-b-core-technical-requirements)
  - [Candidate Approaches](#option-b-candidate-approaches)
  - [Feasibility / Open Questions](#option-b-feasibility)
- [Facilitator Architecture Strategy](#facilitator-architecture-strategy)
  - [Strategy 1: Extend Existing Go Facilitator](#strategy-1-extend-existing-go-facilitator)
  - [Strategy 2: Build New Privacy-Preserving Facilitator](#strategy-2-build-new-privacy-preserving-facilitator)
- [Additional Requirements](#additional-requirements)
  - [Baseline Requirements](#baseline-requirements)
  - [Operation Requirements](#operation-requirements)
  - [Dashboard Requirements](#dashboard-requirements)
  - [Integration Requirements](#integration-requirements)
- [Recommendations](#recommendations)
  - [Phase 0: Define Privacy Target + Key Architecture Decisions](#phase-0-define-privacy-target--key-architecture-decisions)
  - [Phase 1: Deliver "Weak-to-Medium Privacy” Facilitator for EVM Chains](#phase-1-deliver-weak-to-medium-privacy-facilitator-for-evm-chains)
  - [Phase 2: Prototype "Strong Privacy" Facilitator with Aztec/Noir](#phase-2-prototype-strong-privacy-facilitator-with-aztecnoir)
- [References](#references)

## Executive Summary

Building a privacy-preserving x402 facilitator often means changing the **path to settlement**, and in stronger privacy designs it can also mean redefining “settlement”:

- On public EVM chains, settlement is **permissionless**, **trust-minimized**, and **publicly observable**.
  - Payment metadata is publicly visible and anyone can link relationships and behavior.
  - Weak-to-medium privacy typically keeps settlement public, but changes *how* it happens.
- On private EVM chains, settlement is **permissioned**, **trusted**, and **privately observable**.
  - Payment metadata is not publicly visible, but trusted operators can still link relationships and behavior.
  - Weak-to-medium privacy typically keeps settlement privately observable to trusted actors, but changes *how* it happens.
- With a privacy layer, "settlement" is **permissionless**, **trust-minimized**, and **privately verifiable**.
  - Payment metadata is not publicly visible and it becomes difficult for anyone to link relationships and behavior.
  - Strong privacy typically changes what “settlement” means and introduces stateful verification/reconciliation; the facilitator becomes a proof-verifier + state transition orchestrator rather than a simple "settlement" provider.

The implementation of privacy-preserving settlement depends on the threat model:

- Payer privacy only (weak-to-medium) can be approached on EVM chains with relayers + stealth addresses and careful UX, but payment amounts and timing remain linkable.
- Payer + amount + linkage privacy (strong) can be approached using a privacy layer that provides stronger privacy guarantees (shielded transfers), but it adds complexity.

This document attempts to address the following questions:

- What does "privacy-preserving" mean in the context of x402?
- What is the threat model for a privacy-preserving x402 facilitator?
- What must change in payment payload, verification, and settlement?
- What new components are required based on different approaches?
- What is feasible in the near-term and required for strong privacy?

Another important question to ask, but one that is not directly answered in this document: **At what point does this no longer fit the framing of "x402"?** x402 is an open protocol specification authored/maintained by Coinbase. Adding a privacy layer (and the resulting changes) may diverge from strict compliance with the current x402 specification. In this case, the privacy-preserving facilitator may be better described as **x402-like** rather than “x402” in the strict sense. This document still uses “x402” as a shorthand, but specification compliance and naming remain an open question and should be considered in further product development.

## Privacy Framework

This section defines privacy in the context of x402 and privacy objectives, identifies potential adversaries, and establishes the threat model used to evaluate multiple implementation options that are explored in the following sections of this document.

### Privacy and x402

The product lead of Aztec frames [“privacy on x402”](https://www.youtube.com/watch?v=MwZXCjcv8no) in two explicit questions:

- **What should be private?** (resource, agent/user, metadata, facilitator)
- **Who should it be private from?** (the resource, the agent/user, the facilitator, or public chain observers)

This is important to take into consideration because many properties are either:

- **Not desirable** to hide (e.g. resource/facilitator identity can be helpful for analytics/reputation), or
- **Not feasible** to hide without major trade-offs, so many approaches aim for "obfuscation" rather than absolute secrecy

The above framing reflects an important point reiterated throughout the talk: **privacy is a spectrum**. Not everything needs to be hidden, and different use cases require different approaches to privacy. In the context of x402 - and implementing a privacy-preserving facilitator - there are many trade-offs to consider and therefore multiple approaches should be considered.

Another important product/market observation from the talk: **x402 will most likely be dominated by agent↔company flows** (not "human wallet pays for content"), which increases the importance of hiding agent identity and payment metadata to avoid leakage of user patterns, proprietary agent strategies, and potential regulatory/data protection issues.

### Potential Adversaries

Determine which of the following adversaries are of the greatest concern:

- **Public chain observers**: see state (balances), transactions, logs, MEV ordering
- **Resource / API providers**: see request metadata (IP, agent/user, endpoint, timing)
- **Facilitator operators**: see payment metadata (payer, payee, token, amount)
- **Infrastructure providers**: see request headers/bodies, IPs, and timing in logs

### Selective Disclosure

One practical way to scope “privacy-preserving” is **selective disclosure**:

- **Agent / user**: generally must know the full payment metadata to construct the payment
- **Resource / API provider**: needs to know enough to price, apply rate limits, and reconcile revenue
- **Facilitator**: ideally learns the minimum metadata required to verify/settle payment and enforce anti-replay
- **Public / chain observers**: typically should not learn agent/user identity or granular payment metadata

### Privacy Requirements

At least one of the following should be an explicit product requirement:

- **Payer privacy**: the API provider cannot link an API request to a payer address
- **Payee privacy**: the payer cannot easily prove to third parties which API provider they paid
- **Amount privacy**: the amount paid per request is hidden (implies batching or commitments)
- **Usage privacy**: the frequency and/or timing is hidden (implies batching, delays, or network privacy)

In practice, a “privacy-preserving facilitator” should target the following:

- Stronger on-chain privacy (payer, payee, and possibly amount)
- Reasonable off-chain privacy (minimize what the facilitator logs/learns)

## Baseline Implementation

This section provides a brief overview of the current implementation (which is not a privacy-preserving facilitator), then highlights the announced x402 v2 features that are not yet implemented (which may be in tension with a privacy-preserving facilitator), and finally it introduces some critical questions related to the facilitator architecture that should be considered.

### Current x402 Facilitator

The current [x402 facilitator](https://github.com/raid-guild/x402-facilitator-go) is written in Go. It uses [go-ethereum](https://github.com/ethereum/go-ethereum) to handle network interactions. It verifies and settles payments using the exact payment scheme. It supports EVM chains, two main networks (Ethereum and Base) and two test networks (Sepolia and Base Sepolia), and support for additional EVM chains can be easily added by extending the codebase. Authorized payments are verified and settled using ERC-20 tokens that implement [EIP-3009](https://eips.ethereum.org/EIPS/eip-3009) (transfer with authorization).

The x402 facilitator exposes three endpoints and assumes the following:

- The server calls the facilitator's `/supported` endpoint to check scheme and network compatibility
- The server calls the facilitator's `/verify` endpoint with `paymentPayload` and `paymentRequirements`
- The server calls the facilitator's `/settle` endpoint with `paymentPayload` and `paymentRequirements`

The `paymentPayload` includes privacy-sensitive data that can be seen in the following example:

```json
"paymentPayload": {
  "accepted": {
    "scheme": "exact",
    "network": "eip155:11155111"
  },
   "payload": {
    "authorization": {
      "from": "0x354b5cBeEaE7751f2055BfC2d9d78556aD2E1c61",
      "to": "0x9a4e1A0BC77639Fdce69df88E1DF1D589e454811",
      "value": "1000",
      "validAfter": "1767140522",
      "validBefore": "1767141422",
      "nonce": "0x2454c8d9065ebdffd65226693448da75f3c1227fec5ed9c3d0043892cd593f84"
    },
    "signature": "0xdf3cac4be24a317e07b4374b5f1198fc9760c9849fe80f1383755c2d541c4e042b7b9f79aee3b67c236130127299609998a4b31be154963091dd1920a374b0201b"
  }
}
```

The `paymentRequirements` also includes privacy-sensitive data that can be seen in the following example:

```json
"paymentRequirements": {
  "scheme": "exact",
  "network": "eip155:11155111",
  "asset": "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
  "payTo": "0x9a4e1A0BC77639Fdce69df88E1DF1D589e454811",
  "amount": "1000",
  "maxTimeoutSeconds": 300,
  "extra": {
    "name": "USDC",
    "version": "2"
  }
}
```

Key characteristics of the current exact payment flow:

- **Public settlement**: payer, payee, amount, and timing are visible on chain
- **Authorized payment**: the transfer is authorized using [EIP-3009](https://eips.ethereum.org/EIPS/eip-3009) (transfer with authorization)
- **Facilitator liveness**: latency depends on network conditions but is relatively fast

### Planned x402 v2 Features

Features announced in [x402 v2](https://www.x402.org/writing/x402-v2-launch) that are not included in the current implementation (with notes on potential concerns for privacy):

- **Indexing / Discovery**: a “discovery extension” that enables facilitators to automatically index available endpoints/metadata
  - indexing can turn the facilitator into a metadata aggregation point (who offers what, at what price); facilitators should minimize collection and retention of discovery metadata, tightly restrict access, redact discovery metadata in logs/traces/errors by default, and avoid linking discovery data to payment flows
- **Unified payment interface**: a single payment format that spans chains with standardized network/asset identifiers
  - a unified payment format alongside indexed endpoint metadata can make the facilitator a cross-chain correlation point (mapping clients/requests to assets); facilitators should minimize collection and retention of identifiers, tightly restrict access, redact identifiers in logs/traces/errors by default, and avoid linking identifiers to payment flows
- **Dynamic recipients/pricing**: per-request routing to different recipients/roles/callback logic
  - routing inputs can encode sensitive business context and become identifying if forwarded to the facilitator and logged or correlated across requests; facilitators should minimize collection and retention of routing context, tightly restrict access, redact routing fields in logs/traces/errors by default, and avoid correlating routing signals across multiple requests
- **Multi-facilitator support**: clients/servers express preferences (chains/assets/facilitators) and the SDK selects the best match
  - multi-facilitator support expands the set of observers and can reveal client preferences if clients/servers probe multiple facilitators during selection or forward preferences to facilitators; facilitators should minimize collection and retention of preference signals, tightly restrict access, redact preference signals in logs/traces/errors by default, and avoid correlating preference signals across requests
- **Reusable access / sessions**: enables session-like access so clients can avoid the full payment flow on repeated requests
  - receipt/session identifiers can create cross-service correlators if the facilitator handles issuance/verification or receives forwarded receipt/session identifiers; facilitators should minimize collection and retention of receipt/session identifiers, tightly restrict access, redact receipt/session identifiers in logs/traces/errors by default, and avoid reusing identifiers across services or long time windows
- **Modular paywall package**: paywall extracted into a dedicated package with built-in backends and room for custom backends
  - modular paywall backends can leak “extra” request context into facilitator calls; facilitators should minimize collection and retention of "extra" request context, tightly restrict access, redact non-allowlisted fields in logs/traces/errors by default, and avoid linking "extra" request context to payment flows
- **Payment data moved to headers**: payment-related data is carried in HTTP headers
  - moving payment data into client↔server headers can increase leakage risk when the facilitator is in the request path (gateway/proxy/edge paywall) or when servers forward request context to the facilitator; facilitators should minimize collection and retention of header context, tightly restrict access, redact header values in logs/traces/errors by default, and avoid echoing header values in errors

### Architecture Considerations

The current x402 facilitator is designed for a **serverless environment** and therefore follows a **stateless** model, which strongly shapes what privacy improvements are practical and how much operational complexity is introduced.

- **Baseline implementation**: a serverless/stateless design favors easy deployment on serverless platforms, simple request parsing + verification + settlement, and a single language/runtime (currently Go).
- **EVM improvements (Option A)**: EVM-native privacy improvements can be delivered incrementally to the existing Go facilitator, but cross-cutting reliability requirements (durable receipt state tracking, idempotency, retries) and relayer/anti-replay mechanics may still push the implementation toward a stateful or hybrid architecture even if settlement remains EVM-native.
- **Aztec/Noir (Option B)**: strong privacy via a new settlement/privacy domain tends to require stateful receipt tracking, indexers, and key/bridge coordination, and it is constrained by ecosystem tooling that is primarily written in Rust and TypeScript, all of which can push against a purely serverless Go service.

How to map these constraints into an execution plan (extend the existing Go facilitator vs build a new stateful facilitator) is addressed in the [Facilitator Architecture Strategy](#facilitator-architecture-strategy) section after both options are presented.

## Option A: EVM Improvements

This option focuses on **incremental, EVM-native improvements** that can reduce linkage and metadata leakage without changing the underlying settlement domain. These approaches generally deliver **weak-to-medium privacy** (public chain observers can still see amounts/timing), but are simpler to integrate and can often be delivered in phases alongside operational hardening.

### High-Level Architecture <a id="option-a-high-level-architecture"></a>

EVM improvements keep settlement in an EVM environment, so `/verify` and `/settle` can stay close to the current "exact" flow. The privacy lever is primarily **who broadcasts**, **which addresses appear on-chain**, and (optionally) **whether the payer pre-deposits into a pool** and later spends via a receipt/nullifier model.

### EVM Exact Flow and What Changes <a id="option-a-evm-exact-flow-and-what-changes"></a>

Option A keeps settlement EVM-native, but changes vary by path (A1/A1.5/A2+/A3). The deltas below use the same framing as Option B and refer to the candidate approach sections for details.

`paymentPayload` structure changes:

- **A1/A1.5 (relayers/stealth/obfuscation)**: no structural change is required if the flow continues to use EIP-3009 authorization as the payment primitive.
- **A2+ (pool/receipt model)**: `paymentPayload` shifts from “EIP-3009 authorization” toward a receipt/nullifier/claim that proves a prepaid spend (the exact shape depends on the pool design).
- **A3 (network/privacy hygiene)**: no structural change is required; changes are primarily operational and transport-level.

`paymentRequirements` structure changes:

- **A1/A1.5**: `payTo` may remain a direct recipient or represent a stealth-derivation scheme; reconciliation requirements increase when one-time recipients are used.
- **A2+**: `paymentRequirements` may represent “credits/pricing for a spend” rather than “pay this recipient on this request,” depending on the pool and accounting model.
- **A3**: no structural change is required.

`/verify` processing changes:

- **A1/A1.5**: `/verify` remains close to the current exact flow (validate authorization against `paymentRequirements`), but may need additional policy around relayed broadcasts and stealth reconciliation.
- **A2+**: `/verify` validates receipt/nullifier/claim semantics (request binding, one-time use) rather than EIP-3009 authorization.
- **A3**: verification logic is unchanged, but logging/telemetry and metadata-handling requirements are stricter.

`/settle` processing changes:

- **A1/A1.5**: settlement can be broadcast by the payer or a relayer; `/settle` must accommodate relayer retries, confirmation thresholds, and replay/idempotency behavior.
- **A2+**: `/settle` may become “record/spend receipt” (or “mark credit consumed”) rather than “broadcast an ERC-20 authorization,” depending on the pool design.
- **A3**: settlement mechanics are unchanged; operational controls are tightened.

Failure modes and state:

- **A1/A1.5/A2+**: relayers and/or receipt models tend to introduce more retries and asynchronous confirmation patterns; durable state tracking and clear pending/finalized states may be required (see [Baseline Requirements](#baseline-requirements)).

### Core Technical Requirements <a id="option-a-core-technical-requirements"></a>

Regardless of which EVM improvement path is adopted (A1/A1.5/A2/A3), the facilitator needs:

- **Broadcast and confirmation strategy**: define who broadcasts (payer vs relayer), what evidence `/verify` accepts for gating, when `/settle` is invoked, and what confirmation/finality threshold applies.
- **Recipient model**: decide between direct recipients (status quo), stealth recipients (one-time addresses), or a pool/receipt model (A2+), and define the reconciliation/accounting path implied by the choice.
- **Relayer policy + economics (A1/A1.5)**: define relayer trust/allowlisting, fee sponsorship, rate limits/abuse controls, and privacy expectations for relayed broadcasts.
- **Shared reliability + operational hygiene**: see [Baseline Requirements](#baseline-requirements) and [Operation Requirements](#operation-requirements).

### Candidate Approaches <a id="option-a-candidate-approaches"></a>

#### A1) Relayer + stealth address settlement (medium privacy, low complexity)

- **Summary**: Relayer broadcast + stealth recipients to reduce direct payer attribution and recipient address reuse without changing the settlement domain.
- **Mechanism**:
  - Relayers (payer does not broadcast)
  - Stealth recipient addresses (provider receives to one-time addresses)
- **Privacy impact**:
  - Reduces direct payer attribution and recipient address reuse
  - Amounts/timing remain public; chain-level linkage remains possible
- **Operational impact**:
  - Requires relayer operations and retry/failure handling
  - Requires provider reconciliation for stealth recipients
- **Trade-offs / limitations**:
  - Transfer events remain public; sophisticated chain analysis can still correlate behavior

#### A1.5) Obfuscate the agent via shared broadcasters / common entrypoints (weak-to-medium privacy)

- **Summary**: Obfuscation via shared broadcasters/common entrypoints to reduce attribution to a specific agent on public EVM.
- **Mechanism**:
  - Route many agents through a common broadcaster/relayer/paymaster identity
- **Privacy impact**:
  - Reduces attribution to a specific underlying agent (obfuscation, not cryptographic privacy)
  - Payment metadata remains public; does not hide amounts/timing
- **Operational impact**:
  - Requires shared broadcaster/relayer operations and abuse controls
- **Trade-offs / limitations**:
  - Does not provide cryptographic privacy; only reduces casual linkage

#### A2) “Deposit then spend” (prepaid credits) using a privacy pool (stronger privacy, higher complexity)

- **Summary**: Prepaid pool model where deposits are later spent to produce per-request receipts, improving payer unlinkability at higher complexity.
- **Mechanism**:
  - Deposit into a pool; later spend anonymously (nullifiers) to generate receipts for API calls
  - Can be built on EVM (ZK pool contract + off-chain proving) or on an L2 with better proving UX
- **Privacy impact**:
  - Stronger payer unlinkability than stealth addresses alone
- **Operational impact**:
  - Introduces a pool contract, proving/circuit infrastructure, and long-lived operational maintenance
  - Increases compliance/abuse risk and requires explicit mitigation
- **Trade-offs / limitations**:
  - Higher complexity and maintenance burden than A1/A1.5

#### A2.5) Privacy pools / mixers as “EVM-adjacent” privacy domains (stronger unlinkability, UX trade-offs)

- **Summary**: Use a privacy pool/mixer as a mini “privacy domain” adjacent to the EVM payment flow.
- **Mechanism**:
  - Deposit into a pool
  - Later withdraw/spend to reduce linkability between deposit and payment
- **Privacy impact**:
  - Can improve unlinkability/linkage privacy compared to stealth addresses alone
- **Operational impact**:
  - Adds monitoring/compliance complexity and operational constraints (liquidity, timing)
- **Trade-offs / limitations**:
  - UX friction (deposits, withdrawal timing, liquidity considerations)

#### A2.6) Confidential transfers (hide amount/token metadata) via confidentiality primitives (medium privacy, specialized)

- **Summary**: Confidential transfer primitives to hide payment metadata (amount/token) while keeping participant identities more visible.
- **Mechanism**:
  - Confidential token/transfer primitives (e.g. FHE-style “confidential tokens”)
- **Privacy impact**:
  - Can hide amount/token metadata even on EVM-like environments
  - Does not, by itself, hide who is paying whom
- **Operational impact**:
  - Requires careful UX and integration constraints specific to the chosen confidentiality primitive
- **Trade-offs / limitations**:
  - Specialized approach with narrower applicability than A1/A2 paths

#### A3) Hide linkage at the application layer (network privacy)

- **Summary**: Application/network-layer hygiene to reduce off-chain linkage without changing on-chain visibility.
- **Mechanism**:
  - Tor/i2p / privacy-preserving RPC
  - Minimized facilitator logs (redaction, short retention)
  - Avoid embedding correlatable identifiers in payment payloads
- **Privacy impact**:
  - Improves privacy against API providers and infrastructure observers
  - Does not fix on-chain linkability on public EVM settlement
- **Operational impact**:
  - Requires careful logging/telemetry defaults and transport/network configuration
- **Trade-offs / limitations**:
  - Primarily mitigates off-chain leakage; on-chain metadata remains public

### Feasibility / Open Questions <a id="option-a-feasibility"></a>

- How much privacy is actually required (payer only vs payer+linkage vs amount)?
- Should the implementation stay strictly compatible with EIP-3009 (A1/A1.5), or introduce a new scheme/receipt model (A2+)?
- Who pays gas / runs the relayer, and what are the abuse controls for relayed broadcasts?
- If using stealth recipients: what is the provider reconciliation UX and how can new correlatable identifiers be avoided off-chain?

## Option B: Aztec + Noir

This section explores what an Aztec/Noir facilitator could look like for strong on-chain privacy, and the technical/product requirements to make it compatible with (or comparable to) x402.

### High-Level Architecture <a id="option-b-high-level-architecture"></a>

In an Aztec/Noir design, the “settlement” action moves from public EVM execution to a **private state transition** (shielded transfer and/or private application call), producing artifacts that the Aztec network accepts. The facilitator remains an API-facing service that abstracts away the complexity of network interactions, but additionally takes on privacy-layer responsibilities:

- **API-facing service**: still receives x402 payment requests from an API provider and mediates access
- **Proof verifier + state orchestrator**: coordinates private transactions/proofs and verifies receipt artifacts
- **Bridge coordinator (optional)**: if assets originate on an EVM network and must be bridged to Aztec network
- **Keyed recipient manager (optional)**: if receiving keys/accounts for API providers need to be managed

An important note about the available tooling and the programming language used for the facilitator: Aztec/Noir client/proving/broadcast tooling is primarily written in **Rust** and **TypeScript**. A facilitator written in **Go** will most likely need a Rust/TypeScript sidecar (HTTP/gRPC) for transaction/proof/inclusion/indexing, or to rewrite the Aztec-facing components in Go.

### EVM Exact Flow and What Changes <a id="option-b-evm-exact-flow-and-what-changes"></a>

The biggest change is **how a payment is authorized and proven**. In the current EVM “exact” flow, the client signs an **authorized transfer** (EIP-712 typed data + EIP-3009 signature), the API provider calls `/verify` to validate the authorization, and `/settle` to process the transfer. In an Aztec/Noir design, the client produces (or helps produce) a transaction/proof, the API provider calls `/verify` to validate a verifier-friendly private receipt/proof, and `/settle` to coordinate submission/finality in the privacy domain.

`paymentPayload` structure changes:

- **Authorization**: EVM: EIP-712 typed data + EIP-3009 signature → Aztec/Noir: privacy-domain transaction/proof
- **Receipt**: EVM: not included → Aztec/Noir: verifier-friendly private receipt material (e.g. proof, inclusion/finality evidence, note commitment)

`paymentRequirements` structure changes:

- (no changes): If Aztec/Noir requires extra structured data, it should be carried via `extra` rather than changing the base object shape.

`/verify` processing changes:

- **Validation target**: EVM: validate the EIP-712/EIP-3009 authorization against `paymentRequirements` (amount/asset/recipient) and request binding/expiry rules → Aztec/Noir: validate a private receipt/proof against `paymentRequirements` (and request binding), including anti-replay semantics (e.g. nullifier/unique note) if applicable
- **Backend selection**: EVM: select an EVM chain provider + token backend → Aztec/Noir: select an Aztec backend (node/prover/aggregator) and verification rules (receipt format, finality model)
- **Failure modes**: EVM: mostly synchronous signature/format/expiry failures → Aztec/Noir: proof/receipt format failures plus (potentially) “pending vs finalized” states if finality is asynchronous

`/settle` processing changes:

- **Submission target**: EVM: submit the EIP-3009-authorized transfer to an EVM chain → Aztec/Noir: submit/coordinate the privacy-domain transaction/proof (and any bridging/relaying) and track finality
- **Receipt production**: EVM: the public chain produces the tx hash/event evidence after settlement → Aztec/Noir: the privacy domain produces whatever receipt artifacts are needed to **re-verify the same payment** on subsequent `/verify` calls (e.g. if the initial verification returns “pending” and later re-checks for inclusion/finality), such as proofs, inclusion/finality evidence, and commitments

### Core Technical Requirements <a id="option-b-core-technical-requirements"></a>

Regardless of which Aztec/Noir approach is adopted, the facilitator needs:

- **Paid definition + receipt/claim format**: define what “paid” means for a single API request (private transfer, private deposit, or a receipt/claim primitive) and the receipt artifacts the facilitator will accept.
- **Request binding + anti-replay semantics**: ensure receipt artifacts are bound to request-specific context (e.g. a canonical request digest) and cannot be replayed (nullifier/unique spend semantics).
- **Verification and finality strategy**: define what evidence `/verify` accepts for gating (e.g. inclusion proof vs verifier-friendly proof) and how “pending vs finalized” states are represented when finality is asynchronous.
- **Settlement responsibilities**: define what `/settle` does (submit/broadcast private tx if needed, confirm inclusion, and mark receipt/claim spent/consumed), including withdrawal and batching strategy if providers ultimately want funds on EVM.
- **Provider onboarding + key/custody model**: define how providers receive privately (recipient identifiers, onboarding storage) and whether custody is non-custodial vs managed.
- **Indexing + reconciliation**: define what indexing is required to reconcile private receipts/commitments and what provider-facing reconciliation mechanism exists without exposing payer details.
- **Asset availability + bridging constraints**: ensure assets exist and are liquid in the privacy domain and define bridging/operational handling (liquidity, downtime, partial failures).
- **Shared reliability + operational hygiene**: see [Baseline Requirements](#baseline-requirements) and [Operation Requirements](#operation-requirements).

### Candidate Approaches <a id="option-b-candidate-approaches"></a>

#### B1) App-circuit receipt (public output used by `/verify`)

- **Summary**: A custom Noir/Aztec app emits a verifier-friendly public output that the facilitator uses as the “paid” receipt signal.
- **Mechanism**:
  - Private payment/app execution produces a public output (receipt/claim) suitable for `/verify`
  - Facilitator verifies receipt validity against `paymentRequirements` and anti-replay rules
- **Privacy impact**:
  - Can reduce on-chain visibility of payer/payee/amount compared to public EVM settlement
  - Public outputs can still become correlators unless receipt fields are carefully minimized
- **Operational impact**:
  - Requires circuit/app design, proving UX, and a verifier implementation
  - Requires clear receipt format/versioning and backwards compatibility plan
- **Trade-offs / limitations**:
  - Receipt design becomes a protocol surface; poor receipt design can reintroduce linkability

#### B2) Receipt-note + commitment (encrypted receipt note for providers)

- **Summary**: The payment creates an encrypted receipt note for the provider, and `/verify` relies on public commitments and/or inclusion evidence rather than a fully public receipt.
- **Mechanism**:
  - Transaction creates an encrypted receipt note for the provider (or provider-owned note set)
  - Facilitator verifies a public commitment/inclusion evidence and enforces one-time use semantics
- **Privacy impact**:
  - Limits what is revealed in public outputs, shifting more detail into encrypted receipt material
  - Provider note discovery and indexing must avoid creating new correlators
- **Operational impact**:
  - Requires note discovery/reconciliation UX for providers and likely indexing support
  - Requires a clear mapping between commitments and provider reconciliation without leaking payer details
- **Trade-offs / limitations**:
  - Higher reconciliation complexity than B1; operational correctness depends on indexing and provider workflows

#### B3) Inclusion-first vs proof-first verification (timing model)

- **Summary**: The gating model can require inclusion/finality evidence before access (higher latency, stronger finality) or allow a soft-verify then finalize model (lower latency, requires durable state and reconciliation).
- **Mechanism**:
  - **Inclusion-first**: `/verify` gates on a tx hash + inclusion/finality proof
  - **Proof-first / soft-verify**: `/verify` accepts a verifier-friendly proof/claim and reconciles inclusion/finality asynchronously
- **Privacy impact**:
  - Primarily affects timing/latency and reconciliation patterns rather than core cryptographic privacy
  - Different timing models can create distinct metadata patterns unless operational controls are applied
- **Operational impact**:
  - Soft-verify models require durable state tracking, retries, and explicit reconciliation flows
  - Inclusion-first models simplify reconciliation but increase end-user latency
- **Trade-offs / limitations**:
  - Finality vs latency trade-off; reconciliation complexity shifts depending on the chosen model

### Feasibility / Open Questions <a id="option-b-feasibility"></a>

Before committing, these must be answered with concrete Aztec capabilities and a prototype:

- Can a **fast enough** “verification artifact” be produced for API gating?
- What is the best “receipt” representation (public output vs inclusion vs note)?
- Does the design require users to hold assets on Aztec (UX impact)?
- What does bridging do to privacy (timing/linkability at entry/exit)?
- How can **note discovery** be handled cleanly for providers (i.e. how the recipient efficiently discovers encrypted receipts/notes that belong to them)?
- What latency budget is acceptable given that many privacy systems provide stronger privacy for **resting assets** (and may encourage batching/delays that trade off “instant” payments)?

## Facilitator Architecture Strategy <a id="facilitator-architecture-strategy"></a>

After evaluating Option A (EVM Improvements) and Option B (Aztec + Noir), a key architectural decision remains: should the **existing Go facilitator** be extended to support privacy-oriented flows, or should a **new privacy-preserving facilitator** be built (with the current Go facilitator remaining focused on EVM settlement)?

### Strategy 1: Extend Existing Go Facilitator

Extend the existing Go facilitator to deliver near-term privacy improvements while staying EVM-native (Option A), and keep the API-facing contract stable (`/verify`, `/settle`, auth, operational controls).

**Pros**:
- Reuses existing production surface area (auth, request parsing, operational controls)
- Keeps the existing integration story stable and can stay close to the current deployment model (serverless or lightly stateful/hybrid)
- Lower time-to-ship for “medium privacy” improvements (relayers, stealth recipients, network privacy hygiene)

**Cons**:
- Cannot deliver shielded/on-chain privacy guarantees (amount/linkage privacy) without leaving EVM settlement
- If Option B becomes necessary later, integrating Aztec/Noir deeply from the existing Go service will run into ecosystem/tooling constraints (Rust/TS-first) and statefulness/indexer/key-management requirements

### Strategy 2: Build New Privacy-Preserving Facilitator

Build a new, stateful facilitator optimized for Aztec/Noir (Option B). Keep the existing Go facilitator focused on EVM settlement (baseline + Option A improvements).

In practice this usually looks like:

- **Existing facilitator (Go)**: continues to serve EVM settlement and can adopt Option A improvements
- **New facilitator (Rust/TypeScript likely)**: owns Option B (Aztec/Noir) receipt verification, indexing, state transitions, key/bridging coordination

**Pros**:
- Each facilitator can be optimized for its requirements (serverless vs stateful, Go vs Rust/TypeScript)
- Independent scaling, deployment, and operational models
- Clear separation of concerns and maintenance boundaries
- Lower risk: Option A improvements can be deployed without blocking on Aztec research/prototyping

**Cons**:
- Requires operating a second service/codebase (and deciding how clients/providers select which facilitator)
- Potential duplication of shared concerns (auth/API contracts/monitoring) unless explicitly factored/shared

### Recommendation

**Build a new privacy-preserving facilitator (Strategy 2) is recommended** for the following reasons:

- **Clear separation of concerns**: Option B (Aztec + Noir) requires fundamentally different infrastructure (stateful, Rust/TypeScript, indexers) than an EVM-native Go facilitator.
- **Independent evolution**: Option A and Option B can evolve at different paces. Option A improvements can ship immediately without waiting for Option B maturity.
- **Risk mitigation**: If Option B proves unviable or requires significant pivots, Option A facilitator remains unaffected.
- **Operational simplicity**: Each facilitator can be deployed, scaled, and monitored independently with tools optimized for its architecture.

**Open questions**:
- How do providers/clients discover and select the appropriate facilitator?
- Can the dashboard/UI abstract away the facilitator choice, or must providers explicitly configure it?
- Should there be a "facilitator registry" or routing layer that directs requests to the appropriate facilitator based on scheme/network?

## Additional Requirements

### Baseline Requirements

These requirements are **cross-cutting** (apply to both Option A and Option B). They matter because privacy-oriented flows often introduce retries and asynchronous confirmation/finality, and production behavior will be unreliable without a minimal reliability baseline:

- **Receipt state tracking**: maintain a durable mapping of an idempotency key (e.g. `requestDigest`, or another stable request/payment binding) ↔ receipt/tx (e.g. tx hash, receipt ID) and explicit states for retries, reconciliation, and audits (often `pending -> finalized -> settled`).
- **Idempotency**: make `/verify` and `/settle` safely retryable using an idempotency key (e.g. `requestDigest`, or another stable request/payment binding) so repeated calls do not double-submit or produce inconsistent outcomes.

### Operation Requirements

These requirements are **cross-cutting** (apply regardless of whether settlement uses the current EVM implementation of `exact` (EIP-3009) or a privacy-preserving approach). They matter because privacy failures often happen via **observability and abuse paths**, not the cryptographic scheme itself.

#### Authentication, blast radius, and abuse controls

- Auth exists via `X-API-Key` (static key or DB-backed lookup) (see `x402-facilitator-go/auth/auth.go`).
- The current facilitator does not provide per-org/per-key rate limiting.
- Privacy tends to reduce attribution, so hosted deployments should treat rate limits and basic anomaly/replay detection as first-class requirements.

#### Logging, telemetry, and infrastructure capture

- Logging is minimal (mostly internal errors), but platform/infra logs may still capture request bodies/headers unless explicitly configured.
- Make redaction + safe logging patterns an explicit requirement so deployments don’t accidentally log `X-402-Payment` artifacts (or correlatable request IDs).

### Dashboard Requirements

These requirements are dashboard-facing (onboarding, UX states, and product controls). They matter for delivery, but are not directly relevant to evaluating the privacy-preserving facilitator’s protocol/security model.

#### Dashboard Requirements (baseline)

- **Scheme/network extensibility**: model `paymentRequirements` so multiple schemes/networks can coexist cleanly (the current EVM implementation of `exact` (EIP-3009) plus future privacy-oriented schemes).
- **Provider onboarding**: the org needs to configure a “recipient identity” for the chosen scheme (EVM address in the current flow; privacy-domain recipient identifier for Option B; stealth/prepaid config if pursued in Option A).
- **Lifecycle states**: UX should handle outcomes beyond “paid/not paid” (e.g. `pending`, `finalized`, retries, and reconciliation).

#### Option B: dashboard requirements

The current dashboard is tightly coupled to the EVM "exact / EIP-3009" flow (it constructs an `X-402-Payment` payload by signing an EIP-712 authorization, then retries). The baseline dashboard requirements still apply. Option B typically adds the following Aztec/Noir-specific needs:

- **Aztec recipient onboarding**: store an Aztec receiving identifier per org (address / recipient key / viewing key depending on primitives + custody model).
- **Client payment construction changes**:
  - Replace “sign EIP-712 `TransferWithAuthorization`” with “create Aztec private payment + produce a verifier-friendly receipt”.
  - Integrate an Aztec-compatible wallet/provider UX (or a hosted payment agent) so the client can produce the payment artifact.
  - Add UX for **bridging / funding the privacy domain** if assets must be moved into Aztec before spending.
- **Async finality UX**: surface “soft-verified vs finalized” outcomes cleanly to users/admins (especially if gating on pending receipts is allowed).

#### Option A: dashboard requirements

Compared to Option B, Option A can stay closer to the current dashboard implementation. The baseline dashboard requirements still apply. Option A typically adds privacy-aware controls and (optional) product paths:

- **Relayer-aware payment UX**: allow users to opt into relayed broadcasts (and show trade-offs: latency, failure modes, fee sponsorship).
- **Stealth recipient onboarding (if pursued)**: let an org configure the metadata needed to derive one-time recipient addresses and reconcile receipts.
- **Prepaid credits (if pursued)**: UI for deposits, balance, and spend receipts; this becomes the dashboard “source of truth” instead of per-request transfers.

### Integration requirements

These requirements are integration-facing (middleware/SDK, request binding, and dev tooling). They matter for delivery, but are not directly relevant to evaluating the privacy-preserving facilitator’s protocol/security model.

#### Integration requirements (baseline)

- **Server middleware / SDK** for common frameworks (e.g. Next.js, Express/Fastify, Go net/http):
  - Generate correct `402` responses with `paymentRequirements`.
  - Parse/validate `X-402-Payment` and call facilitator `/verify` (and `/settle` if required by the chosen flow).
  - Avoid leaking payment headers into logs by default (redaction utilities + safe examples).
- **Request binding / replay safety (server/middleware)**: in the current EVM implementation of `exact` (EIP-3009), replay protection largely comes from the token contract refusing to accept the same authorization nonce twice *at settlement time*. However, that on-chain nonce check does **not** automatically give “one payment unlocks exactly one HTTP request,” because the chain does not know the request semantics (method/path/body). If “one payment → one request” is required, the **resource server / middleware layer** must bind the payment/proof to request-specific context (e.g. a canonical `requestDigest` and/or per-request nonce) and enforce one-time use (a spent-store keyed by that binding).
- **Canonical request digest helper**:
  - Publish a single “request digest” algorithm so all integrators bind the same fields and don’t accidentally create replay vulnerabilities.
- **Local dev/test harness**:
  - Mock facilitator + fixtures, including “pending then finalized” flows, so teams can test gating logic without standing up chain/ZK tooling locally.

#### Option B: integration implications

The baseline integration requirements still apply. Option B typically adds:

- **Aztec-specific developer ergonomics**: local/test tooling that can produce realistic “receipt artifacts” without requiring every developer to run full Aztec infra.
- **Bridging-aware examples**: clear examples showing how to fund/spend/withdraw in the privacy domain without turning bridging events into accidental linkage via logs/telemetry.

#### Option A: integration implications

The baseline integration requirements still apply. Option A typically adds:

- **Relayer-friendly examples**: guidance on safe retries and failure handling when the broadcaster is not the payer.
- **Stealth reconciliation docs (if pursued)**: patterns for providers to reconcile one-time recipients without creating correlatable identifiers in logs.

## Recommendations

This section proposes a phased plan for selecting a concrete privacy target and shipping incremental improvements while de-risking a deeper Aztec/Noir integration.

### Phase 0: Define Privacy Target + Key Architecture Decisions

Phase 0 checklist (answer these or explicitly mark them open before starting Phase 1/2):

- **Privacy properties required**: payer? amount? usage patterns? See [Privacy Requirements](#privacy-requirements) and [Selective Disclosure](#selective-disclosure).
- **Adversaries / threat model**: which adversaries matter most? See [Potential Adversaries](#potential-adversaries).
- **UX constraints**: must work with existing EVM wallets? okay to bridge to Aztec?
- **Option B (Aztec) viability for API gating latency**: can `/verify` stay fast enough? See Option B’s verification and feasibility notes.
- **Facilitator strategy choice**: extend the existing facilitator or build a new one? Compare Strategy 1 vs Strategy 2 above (and the operational trade-offs each implies).
- **Statefulness requirements**: what must be stateful (receipt tracking, indexing, key management)? Option B introduces hard statefulness; Option A can be lighter but still benefits from idempotency and basic receipt/tx tracking for retries and reconciliation.
- **Language/tooling constraints**: what constraints exist for Aztec/Noir? See Option B’s [High-Level Architecture](#option-b-high-level-architecture).

### Phase 1: Deliver "Weak-to-Medium Privacy" Facilitator for EVM Chains

If the goal is near-term product value with reduced doxxing:

- Add relayer support + stealth recipient options to the existing Go facilitator (Option A improvements)
- Harden operational privacy (log redaction, minimal retention, metadata discipline)
- Keep the current `/verify` + `/settle` shape so integrations stay stable
- This phase aligns with Strategy 1: extend the existing Go facilitator to ship Option A improvements, while Option B work proceeds independently

### Phase 2: Prototype "Strong Privacy" Facilitator with Aztec/Noir

Build a thin vertical slice:

- Define an x402-like `paymentRequirements` variant for Aztec
- Implement a Noir/Aztec private payment that emits a receipt
- Implement `/verify` against that receipt (and decide inclusion vs proof)
- Measure latency and failure modes under load
- This phase aligns with Strategy 2: build the new, stateful privacy-preserving facilitator (Rust/TypeScript likely) independently from Phase 1 improvements

Only after this phase does the plan decide whether Aztec is viable for a hosted facilitator offering.

## References

- [Privacy on x402](https://www.youtube.com/watch?v=MwZXCjcv8no)
- [raid-guild/x402-facilitator-go](https://github.com/raid-guild/x402-facilitator-go)
- [go-ethereum](https://github.com/ethereum/go-ethereum)
- [EIP-3009](https://eips.ethereum.org/EIPS/eip-3009)
- [x402 V2 Launch](https://www.x402.org/writing/x402-v2-launch)
