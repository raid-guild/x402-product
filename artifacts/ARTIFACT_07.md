# Privacy-Preserving x402 Facilitator

- **Author(s)**: Ryan (@ryanchristo)
- **Editor(s)**: NA
- **Date (created)**: 2026-01-20
- **Date (updated)**: NA
- **Sprint**: Cohort 11

## Short Description

Assess the technical requirements and viability of implementing a privacy-preserving x402 facilitator using Aztec + Noir for shielded payments and compare alternative approaches.

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
- [Option A: Aztec + Noir](#option-a-aztec--noir)
  - [High-Level Architecture](#option-a-high-level-architecture)
  - [EVM Exact Flow and What Changes](#option-a-evm-exact-flow-and-what-changes)
  - [Core technical requirements](#option-a-core-technical-requirements)
  - [Candidate approaches](#option-a-candidate-approaches)
  - [Feasibility notes / open questions](#option-a-feasibility)
- [Option B: EVM Alternatives](#option-b-evm-alternatives)
  - [High-Level Architecture](#option-b-high-level-architecture)
  - [EVM Exact Flow and What Changes](#option-b-evm-exact-flow-and-what-changes)
  - [Core technical requirements](#option-b-core-technical-requirements)
  - [Candidate approaches](#option-b-candidate-approaches)
  - [Feasibility notes / open questions](#option-b-feasibility)
- [Facilitator Architecture Strategy](#facilitator-architecture-strategy)
  - [Strategy 1: Extend the existing Go facilitator](#strategy-1-extend-the-existing-go-facilitator)
  - [Strategy 2: Build a new privacy-preserving facilitator](#strategy-2-build-a-new-privacy-preserving-facilitator)
- [Additional Requirements](#additional-requirements)
  - [Baseline requirements](#baseline-requirements)
  - [Operation requirements](#operation-requirements)
  - [Dashboard requirements](#dashboard-requirements)
  - [Integration requirements](#integration-requirements)
- [Recommendations](#recommendations)
  - [Phase 0: Define privacy target + key architecture decisions (must-do)](#phase-0-define-privacy-target--key-architecture-decisions-must-do)
  - [Phase 1: Deliver “medium privacy” on EVM (fast path)](#phase-1-deliver-medium-privacy-on-evm-fast-path)
  - [Phase 2: Prototype Aztec/Noir receipt-based gating (research-to-prod bridge)](#phase-2-prototype-aztecnoir-receipt-based-gating-research-to-prod-bridge)
- [References](#references)

## Executive Summary

Building a privacy-preserving x402 facilitator requires redefining "settlement":

- On public EVM chains, settlement is **permissionless**, **trust-minimized**, and **publicly observable**. Payment metadata is publicly visible, enabling anyone to link relationships and behavior.
- On private EVM chains, settlement is **permissioned**, **trusted**, and **privately observable**. Only trusted actors with special access can read payment metadata and link relationships and behavior.
- With a privacy layer, "settlement" is **permissionless**, **trust-minimized**, and **privately verifiable**. Payment validity can be proven without making sensitive payment metadata publicly readable (although some metadata may still be inferable depending on the design). In this model, the facilitator becomes a proof-verifier + state transition orchestrator.

The implementation of privacy-preserving settlement depends on the threat model:

- Payer privacy only (weak-to-medium) can be approached on public EVM chains with relayers + stealth addresses and careful UX, but payment amounts and timing remain linkable.
- Payer + amount + linkage privacy (strong) can be approached using a privacy layer (Aztec + Noir) that provides stronger privacy guarantees (shielded transfers), but it adds complexity.

This document attempts to address the following questions:

- What does "privacy-preserving" mean in the context of x402?
- What is the threat model for a privacy-preserving x402 facilitator?
- What must change in payment payload, verification, and settlement?
- What new components are required based on different approaches?
- What is feasible in the near-term and required for strong privacy?

Another important question to ask, but one that is not directly answered in this document: **At what point does this no longer fit the framing of "x402"?** x402 is an open protocol specification authored/maintained by Coinbase. Adding a privacy layer (and the resulting changes) may diverge from strict compliance with the current x402 specification. For that reason, the privacy-preserving facilitator may be better described as **x402-like** rather than “x402” in the strict sense. This document still uses “x402” as a shorthand, but specification compliance and naming remain an open question.

## Privacy Framework

This section defines privacy objectives, identifies potential adversaries, and establishes the threat model used to evaluate implementation options.

### Privacy and x402

The product lead of Aztec frames [“privacy on x402”](https://www.youtube.com/watch?v=MwZXCjcv8no) in two explicit questions:

- **What should be private?** (resource, agent/user, metadata, facilitator)
- **Who should it be private from?** (the resource, the agent, the facilitator, or the public/chain observers)

This is important to take into consideration because many properties are either:

- **Not desirable** to hide (e.g. resource/facilitator identity can be helpful for analytics/reputation), or
- **Not feasible** to hide without major trade-offs, so you often aim for "obfuscation" rather than absolute secrecy

This reflects an important point reiterated throughout the talk: **privacy is a spectrum**. Not everything needs to be hidden, and different use cases require different privacy levels. In the context of x402 - and implementing a privacy-preserving facilitator - there are many trade-offs to consider, so this document explores multiple implementation options.

Another important product/market observation from the talk: x402 will most likely be dominated by agent <-> company flows (not "human wallet pays for content"), which increases the importance of hiding agent identity and payment metadata to avoid leakage of user patterns, proprietary agent strategies, and potential regulatory/data protection issues.

### Potential Adversaries

Determine which of the following adversaries are of the greatest concern:

- **Public chain observers**: see state, transactions, logs, MEV ordering
- **API providers**: see request metadata (IP, user-agent, endpoint, timing)
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

- Stronger on-chain privacy (payer, payeee, and possibly amount)
- Reasonable off-chain privacy (minimize what the facilitator logs/learns)

## Baseline Implementation

This section provides a brief overview of the current implementation (which is not a privacy-preserving facilitator), then highlights the announced x402 v2 features that are not yet implemented (which may be in tension with a privacy-preserving facilitator), and finally it introduces some critical questions related to archtecture that should be considered.

### Current x402 Facilitator

The current [x402 facilitator](https://github.com/raid-guild/x402-facilitator-go) is written in Go. It uses [go-ethereum](https://github.com/ethereum/go-ethereum) to handle network interactions. It verifies and settles payments using the exact payment scheme. It supports EVM chains, two main networks (Ethereum and Base) and two test networks (Sepolia and Base Sepolia), and support for additional EVM chains can be easily added by extending the codebase. Authorized payments are verified and settled using ERC-20 tokens that implement [EIP-3009](https://eips.ethereum.org/EIPS/eip-3009).

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

- **Indexing / Discovery**: a “discovery extension” that enables facilitators to automatically index available endpoints (and associated pricing/routes/metadata)
  - indexing can turn the facilitator into a metadata aggregation point (who offers what, at what price), so it should minimize stored discovery metadata, tightly restrict access, and avoid logging/linking discovery queries to request/payment flows
- **Unified payment interface**: a single payment format that spans chains and legacy rails, with standardized network/asset identifiers
  - if the facilitator normalizes identifiers and/or routes across rails, it can become a cross-rail correlation point (mapping the same client/request across networks/assets); minimize collected routing inputs, avoid stable cross-rail identifiers in logs/telemetry, and keep routing decisions as ephemeral as possible
- **Dynamic recipients/pricing**: per-request routing to different recipients/roles/callback logic (useful for marketplaces and multi-tenant APIs)
  - routing inputs can encode sensitive business context (tenant, segment, workload) and become highly identifying if the facilitator logs them or links them across requests; treat routing signals as sensitive, minimize retention, and avoid using them as durable keys/labels in metrics
- **Multi-facilitator support**: clients/servers can express preferences (chains/assets/facilitators) and the SDK selects the best match
  - multi-facilitator designs expand the set of observers; if clients probe multiple facilitators or send rich preference lists, each facilitator can learn client intent/capabilities and preference patterns can become a fingerprint unless those signals are narrowly scoped and not logged/retained
- **Reusable access / wallet-based sessions**: enables session-like access so clients can avoid the full payment flow on repeated requests
  - if the facilitator participates in issuing/verifying access receipts, it must avoid minting stable identifiers that work across services; use short-lived, audience-scoped tokens/receipts and avoid durable user identifiers in facilitator-visible state
- **Modular paywall package**: paywall extracted into a dedicated package with built-in backends (EVM/Solana) and room for custom backends
  - while this is primarily a server/paywall concern, it can indirectly impact facilitator privacy if paywall backends forward “extra” context into facilitator calls (tenant IDs, user handles, request metadata); keep facilitator interfaces “minimum necessary data” and enforce redaction/allowlists across all backend integrations
- **Payment data moved to headers + modernized header conventions**: payment-related data is moved into HTTP headers and header naming is modernized
  - headers are frequently captured by gateways/proxies and app logs; the facilitator should treat payment headers as sensitive (redact at ingress, avoid echoing back in errors, and be explicit about logging/retention boundaries)

### Architecture Considerations

The current x402 facilitator is designed for a **serverless environment** and follows a stateless model. The Aztec/Noir design approach introduce requirements that may be incompatible with this architecture, such as stateful receipt tracking, indexer dependencies, and key management. Additionally, the current facilitator is written in **Go**, while Aztec/Noir tooling is primarily available in Rust and TypeScript.

**Key questions to resolve**: Should the **existing Go facilitator** be extended to deliver privacy improvements (EVM-first approaches), or should a **new privacy-preserving facilitator** be built to support stronger privacy guarantees with Aztec/Noir? What changes require a stateful server and what changes can remain serverless? What programming language is most appropriate given Aztec/Noir ecosystem constraints?

These architectural decisions are further explored in the [Facilitator Architecture Strategy](#facilitator-architecture-strategy) section after both privacy implementation options are presented.

## Option A: Aztec + Noir

This section explores what an Aztec/Noir facilitator could look like for strong on-chain privacy, and the technical/product requirements to make it compatible with (or comparable to) x402.

### High-Level Architecture <a id="option-a-high-level-architecture"></a>

In an Aztec/Noir design, the “settlement” action moves from public EVM execution to a **private state transition** (shielded transfer and/or private application call), producing artifacts that the Aztec network accepts. The facilitator remains an API-facing service that abstracts away the complexity of network interactions, but additionally takes on privacy-layer responsibilities:

- **API-facing service**: still receives x402 payment requests from an API provider and mediates access
- **Proof verifier + state orchestrator**: coordinates private transactions/proofs and verifies receipt artifacts
- **Bridge coordinator (optional)**: if assets originate on an EVM network and must be bridged to Aztec network
- **Keyed recipient manager (optional)**: if receiving keys/accounts for API providers need to be managed

An important note about the available tooling and the programming language used for the facilitator: Aztec/Noir client/proving/broadcast tooling is primarily written in **Rust** and **TypeScript**. A facilitator written in **Go** will most likely need a Rust/Typescript sidecar (HTTP/gRPC) for transaction/proof/inclusion/indexing, or to rewrite the Aztec-facing components in Go.

### EVM Exact Flow and What Changes <a id="option-a-evm-exact-flow-and-what-changes"></a>

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
- **Receipt production**: EVM: the public chain produces the tx hash/event evidence after settlement → Aztec/Noir: the privacy domain produces whatever receipt artifacts are needed to **re-verify the same payment** on subsequent `/verify` calls (e.g. if the initial verification returns “pending” and later you re-check for inclusion/finality), such as proofs, inclusion/finality evidence, and commitments

### Core technical requirements <a id="option-a-core-technical-requirements"></a>

#### 1) A private payment primitive compatible with x402’s “exact” scheme

Define what constitutes “paid” for a single API request:

- **Private transfer** of the required amount to a recipient
- Or **private deposit** into a provider-owned note set
- Or **private receipt note** minted to provider proving the transfer occurred

The facilitator must be able to verify (quickly and deterministically) that:

- The payment corresponds to the request (nonce / request-id binding)
- The payment was authorized under the scheme (payer signature/account auth)
- The amount and asset match those within `paymentRequirements`
- The payment is not replayed (one-time spend / nullifier / unique note)

#### 2) Noir circuits (or Aztec private app) to enforce payment correctness

At minimum, the private logic must enforce:

- **Value conservation** to ensure the correct asset and amount is used
- **Recipient correctness** to ensure the intended provider identity is paid
- **Request binding** with a request digest to ensure the proof cannot be reused
- **Anti-replay** with a nullifier derived from (payer secret, request digest) or a unique note consumption

#### 3) Verification strategy (what `/verify` does)

You will need a verifier-friendly object for the API edge:

- A **transaction hash + inclusion proof** (or equivalent) that the payment happened
- Or a **standalone ZK proof** verifiable by the facilitator without waiting for inclusion (harder; may weaken finality)

`/verify` latency must remain acceptable for API gating. This pushes toward:

- A two-step approach: **soft-verify** (proof shape, signature, nonces) then **finalize** (inclusion) asynchronously
- Or an escrow model: accept “pending receipt” for low-risk endpoints and reconcile later

#### 4) Settlement strategy (what `/settle` does)

In Aztec, “settlement” would mean:

- “Submit private tx” (facilitator helps broadcast/prove)
- “Confirm inclusion and mark receipt spent/consumed”

If the API provider ultimately wants funds on an EVM address, you also need:

- **Withdrawal flow** from Aztec to EVM
- Optional aggregation/batching to reduce linkability and fees

#### 5) Asset availability + bridging

Strong practical constraint: the payment asset must exist and be liquid in the privacy domain.

Requirements:

- A supported stable asset representation (USDC-like) on Aztec, or a wrapped/bridged asset.
- A standard bridging UX and operational playbook:
  - liquidity management
  - bridge downtime handling
  - partial failures and stuck exits

#### 6) Recipient key management (provider onboarding)

Providers need a way to receive privately:

- Provision an Aztec account/address for each org
- Store recipient metadata in the dashboard DB (carefully; avoid linking to EVM identities if that’s a privacy goal)
- Decide custody model:
  - **Non-custodial**: provider controls keys; dashboard stores only public recipient identifiers
  - **Custodial / managed**: facilitator holds keys (higher risk; conflicts with “trustless” positioning)

#### 7) Indexing and observability in a private system

On public chains, “did payment happen?” is easy to query. In shielded systems, you may need:

- A dedicated **indexer** for relevant public outputs (commitments/receipts) and finalized blocks
- A provider-facing mechanism to reconcile receipts without exposing payer details

#### 8) Abuse controls (privacy-induced, cross-cutting)

Privacy increases abuse risk (harder attribution), but most mitigations are **deployment-level** rather than Aztec-specific (see [Operation requirements](#operation-requirements)).

Aztec/Noir can introduce one additional product/architecture lever:

- Deposit/credit models to reduce per-request proof overhead (optional)

### Candidate approaches <a id="option-a-candidate-approaches"></a>

There are a few plausible ways to produce a verifier-friendly “paid” signal (receipt) while keeping payment details private:

- **App-circuit approach**: a custom Noir “x402 payment app” that emits a public output (receipt) used by `/verify`
- **Receipt-note approach**: the transaction creates an encrypted receipt note for the provider, and `/verify` checks a public commitment and/or tx inclusion
- **Inclusion-first vs proof-first**: either gate on a tx hash + inclusion proof (stronger finality, higher latency) or allow a “soft-verify then finalize” model (lower latency, requires durable state + reconciliation)

### Feasibility notes / open questions <a id="option-a-feasibility"></a>

Before committing, these must be answered with concrete Aztec capabilities and a prototype:

- Can we get a **fast enough** “verification artifact” for API gating?
- What is the best “receipt” representation (public output vs inclusion vs note)?
- Do we require users to hold assets on Aztec (UX impact)?
- What does bridging do to privacy (timing/linkability at entry/exit)?
- How do we solve **note discovery** cleanly for providers (i.e. how the recipient efficiently discovers encrypted receipts/notes that belong to them)?
- What latency budget is acceptable given that many privacy systems provide stronger privacy for **resting assets** (and may encourage batching/delays that trade off “instant” payments)?

## Option B: EVM Alternatives

If Aztec integration is too heavy near-term, you can still improve privacy meaningfully while staying EVM-native. These options generally provide **weaker privacy** than shielded L2, but are simpler.

### High-Level Architecture <a id="option-b-high-level-architecture"></a>

EVM alternatives keep settlement in an EVM environment, so `/verify` and `/settle` can stay close to today's "exact" flow. The privacy lever is primarily **who broadcasts**, **which addresses appear on-chain**, and (optionally) **whether the user pre-deposits into a pool** and later spends via a receipt/nullifier model.

### EVM Exact Flow and What Changes <a id="option-b-evm-exact-flow-and-what-changes"></a>

Depending on which alternative you adopt, changes range from minimal to significant:

- **Minimal-change path (B1/B1.5)**: keep EIP-3009 transfers, but change broadcast + recipient strategy (relayers, stealth recipients), and tighten retry/idempotency behavior.
- **New-scheme path (B2/B2.5)**: introduce a pool/receipt model ("deposit then spend") where `/verify` checks a receipt/nullifier and `/settle` may become "record/spend receipt" rather than "submit an ERC-20 transfer authorization".
- **Off-chain/network privacy path (B3)**: constrain logging/telemetry + transport metadata so the API provider/infrastructure observers learn less, even though on-chain data remains public.

### Core technical requirements <a id="option-b-core-technical-requirements"></a>

Regardless of which candidate approach you choose, EVM alternatives need:

- **Request binding + replay safety**: a canonical `requestDigest` and a spent-store/idempotency key so “one payment → one request” can be enforced reliably.
- **Broadcast and confirmation strategy**: define who broadcasts (payer vs relayer), what `/settle` is allowed to do, and what “confirmed enough” means for gating.
- **Recipient model**: decide between direct recipients (status quo), stealth recipients (one-time addresses), or a pool/receipt model (B2+).
- **Privacy-safe observability**: logs/metrics need defaults that avoid capturing `X-402-Payment` artifacts and correlatable identifiers.

### Candidate approaches <a id="option-b-candidate-approaches"></a>

#### B1) Relayer + stealth address settlement (medium privacy, low complexity)

Idea:

- Users pay on EVM, but avoid directly revealing the payer by using:
  - relayers (payer doesn’t broadcast)
  - stealth recipient addresses (provider receives to one-time addresses)

Limitations:

- Transfer events are still public; amounts and timing are linkable.
- Sophisticated chain analysis may still correlate payer via funding sources and patterns.

#### B1.5) Obfuscate the agent via shared broadcasters / common entrypoints (weak-to-medium privacy)

If “hide the agent” is the primary goal but you must remain on a public EVM, a pragmatic approach is **obfuscation**:

- Many users/agents route through a common broadcaster/relayer/paymaster identity, making it harder to attribute activity to a specific underlying agent.

This is not cryptographic privacy and does not hide payment metadata, but can materially reduce casual linkage.

#### B2) “Deposit then spend” (prepaid credits) using a privacy pool (stronger privacy, higher complexity)

Idea:

- Users deposit into a pool, later spend anonymously (nullifiers) to generate receipts for API calls.

This can be built:

- On EVM with a ZK pool contract + off-chain proving
- Or on an L2 with better proving UX

Pros:

- Stronger payer unlinkability than stealth addresses.

Cons:

- Adds a new pool contract, circuit, and long-term maintenance burden.
- Compliance and abuse risk increases; operational and reputational risk needs explicit handling.

#### B2.5) Privacy pools / mixers as “EVM-adjacent” privacy domains (stronger unlinkability, UX trade-offs)

Related to the above, you can treat privacy pools as a mini “bridge domain” on the same chain:

- **Deposit** into a pool
- Later **withdraw/spend** in a way that reduces linkability between deposit and payment

This can improve recipient unlinkability and/or payment linkage privacy compared to stealth addresses alone, but introduces UX friction (deposits, withdrawal timing, liquidity considerations) and monitoring/compliance complexity.

#### B2.6) Confidential transfers (hide amount/token metadata) via confidentiality primitives (medium privacy, specialized)

If your priority is **hiding payment metadata** (amount/token) while keeping participant identities more visible, confidentiality approaches (e.g., FHE-style “confidential tokens”) are a distinct point on the privacy spectrum:

- Pros: can hide the “middle” metadata even on EVM-like environments.
- Cons: does not, by itself, hide who is paying whom; still needs careful UX and integration constraints.

#### B3) Hide linkage at the application layer (network privacy)

Regardless of chain choice, you may need:

- Tor/i2p / privacy-preserving RPC
- Minimized facilitator logs (redaction, short retention)
- Avoid embedding correlatable identifiers in payment payloads

This improves privacy against the API provider and infrastructure observers, but does not fix on-chain linkability.

### Feasibility notes / open questions <a id="option-b-feasibility"></a>

- How much privacy is actually required (payer only vs payer+linkage vs amount)?
- Do we want to stay strictly compatible with EIP-3009 (B1/B1.5), or are we willing to introduce a new scheme/receipt model (B2+)?
- Who pays gas / runs the relayer, and what are the abuse controls for relayed broadcasts?
- If using stealth recipients: what is the provider reconciliation UX and how do we avoid creating new correlatable identifiers off-chain?

## Facilitator Architecture Strategy <a id="facilitator-architecture-strategy"></a>

After evaluating Option A (Aztec + Noir) and Option B (EVM Alternatives), a key architectural decision remains: should the **existing Go facilitator** be extended to support privacy-oriented flows, or should a **new privacy-preserving facilitator** be built (with the Go facilitator remaining focused on EVM settlement)?

### Strategy 1: Extend the existing Go facilitator

Extend the existing Go facilitator to deliver near-term privacy improvements while staying EVM-native (Option B), and keep the API-facing contract stable (`/verify`, `/settle`, auth, operational controls).

**Pros**:
- Reuses existing production surface area (auth, request parsing, operational controls)
- Keeps the existing deployment model (often serverless) and integration story stable
- Lower time-to-ship for “medium privacy” improvements (relayers, stealth recipients, network privacy hygiene)

**Cons**:
- Cannot deliver shielded/on-chain privacy guarantees (amount/linkage privacy) without leaving EVM settlement
- If you try to integrate Aztec/Noir deeply from Go, you will fight ecosystem/tooling constraints (Rust/TS-first) and statefulness/indexer/key-management requirements

### Strategy 2: Build a new privacy-preserving facilitator

Build a new, stateful facilitator optimized for Aztec/Noir (Option A). Keep the existing Go facilitator focused on EVM settlement (baseline + Option B improvements).

In practice this usually looks like:

- **Existing facilitator (Go)**: continues to serve EVM settlement and can adopt Option B improvements
- **New facilitator (Rust/TypeScript likely)**: owns Aztec/Noir receipt verification, indexing, state transitions, key/bridging coordination

**Pros**:
- Each facilitator can be optimized for its requirements (serverless vs stateful, Go vs Rust/TypeScript)
- Independent scaling, deployment, and operational models
- Clear separation of concerns and maintenance boundaries
- Lower risk: you can deploy Option B improvements without blocking on Aztec research/prototyping

**Cons**:
- Requires operating a second service/codebase (and deciding how clients/providers select which facilitator)
- Potential duplication of shared concerns (auth/API contracts/monitoring) unless explicitly factored/shared

### Recommendation

**Build a new privacy-preserving facilitator (Strategy 2) is recommended** for the following reasons:

- **Clear separation of concerns**: Option A (Aztec + Noir) requires fundamentally different infrastructure (stateful, Rust/TypeScript, indexers) than an EVM-native Go facilitator.
- **Independent evolution**: Option A and Option B can evolve at different paces. Option B improvements can ship immediately without waiting for Option A maturity.
- **Risk mitigation**: If Option A proves unviable or requires significant pivots, Option B facilitator remains unaffected.
- **Operational simplicity**: Each facilitator can be deployed, scaled, and monitored independently with tools optimized for its architecture.

**Open questions**:
- How do providers/clients discover and select the appropriate facilitator?
- Can the dashboard/UI abstract away the facilitator choice, or must providers explicitly configure it?
- Should there be a "facilitator registry" or routing layer that directs requests to the appropriate facilitator based on scheme/network?

## Additional Requirements

### Baseline requirements

These requirements are **cross-cutting** (apply to both Option A and Option B). They matter because privacy-oriented flows often introduce retries and asynchronous confirmation/finality, and production behavior will be unreliable without a minimal reliability baseline:

- **Receipt state tracking**: maintain a durable mapping of `requestDigest` ↔ receipt/tx (e.g., tx hash, receipt ID) and explicit states for retries, reconciliation, and audits (often `pending -> finalized -> settled`).
- **Idempotency**: make `/verify` and `/settle` safely retryable using an idempotency key (typically `requestDigest`) so repeated calls do not double-submit or produce inconsistent outcomes.

### Operation requirements

These requirements are **cross-cutting** (apply regardless of whether settlement uses the current EVM implementation of `exact` (EIP-3009) or a privacy-preserving approach). They matter because privacy failures often happen via **observability and abuse paths**, not the cryptographic scheme itself.

#### Authentication, blast radius, and abuse controls

- Auth exists via `X-API-Key` (static key or DB-backed lookup) (see `x402-facilitator-go/auth/auth.go`).
- The current facilitator does not provide per-org/per-key rate limiting.
- Privacy tends to reduce attribution, so hosted deployments should treat rate limits and basic anomaly/replay detection as first-class requirements.

#### Logging, telemetry, and infrastructure capture

- Logging is minimal (mostly internal errors), but platform/infra logs may still capture request bodies/headers unless explicitly configured.
- Make redaction + safe logging patterns an explicit requirement so deployments don’t accidentally log `X-402-Payment` artifacts (or correlatable request IDs).

### Dashboard requirements

These requirements are dashboard-facing (onboarding, UX states, and product controls). They matter for delivery, but are not directly relevant to evaluating the privacy-preserving facilitator’s protocol/security model.

#### Dashboard requirements (baseline)

- **Scheme/network extensibility**: model `paymentRequirements` so multiple schemes/networks can coexist cleanly (the current EVM implementation of `exact` (EIP-3009) plus future privacy-oriented schemes).
- **Provider onboarding**: the org needs to configure a “recipient identity” for the chosen scheme (EVM address in the current flow; privacy-domain recipient identifier for Option A; stealth/prepaid config if pursued in Option B).
- **Lifecycle states**: UX should handle outcomes beyond “paid/not paid” (e.g., `pending`, `finalized`, retries, and reconciliation).

#### Option A: dashboard requirements

The current dashboard is tightly coupled to the EVM "exact / EIP-3009" flow (it constructs an `X-402-Payment` payload by signing an EIP-712 authorization, then retries). The baseline dashboard requirements still apply. Option A typically adds the following Aztec/Noir-specific needs:

- **Aztec recipient onboarding**: store an Aztec receiving identifier per org (address / recipient key / viewing key depending on primitives + custody model).
- **Client payment construction changes**:
  - Replace “sign EIP-712 `TransferWithAuthorization`” with “create Aztec private payment + produce a verifier-friendly receipt”.
  - Integrate an Aztec-compatible wallet/provider UX (or a hosted payment agent) so the client can produce the payment artifact.
  - Add UX for **bridging / funding the privacy domain** if assets must be moved into Aztec before spending.
- **Async finality UX**: surface “soft-verified vs finalized” outcomes cleanly to users/admins (especially if you allow gating on pending receipts).

#### Option B: dashboard requirements

Compared to Option A, Option B can stay closer to the current dashboard implementation. The baseline dashboard requirements still apply. Option B typically adds privacy-aware controls and (optional) product paths:

- **Relayer-aware payment UX**: allow users to opt into relayed broadcasts (and show trade-offs: latency, failure modes, fee sponsorship).
- **Stealth recipient onboarding (if pursued)**: let an org configure the metadata needed to derive one-time recipient addresses and reconcile receipts.
- **Prepaid credits (if pursued)**: UI for deposits, balance, and spend receipts; this becomes the dashboard “source of truth” instead of per-request transfers.

### Integration requirements

These requirements are integration-facing (middleware/SDK, request binding, and dev tooling). They matter for delivery, but are not directly relevant to evaluating the privacy-preserving facilitator’s protocol/security model.

#### Integration requirements (baseline)

- **Server middleware / SDK** for common frameworks (e.g., Next.js, Express/Fastify, Go net/http):
  - Generate correct `402` responses with `paymentRequirements`.
  - Parse/validate `X-402-Payment` and call facilitator `/verify` (and `/settle` if required by the chosen flow).
  - Avoid leaking payment headers into logs by default (redaction utilities + safe examples).
- **Request binding / replay safety (server/middleware)**: in the current EVM implementation of `exact` (EIP-3009), replay protection largely comes from the token contract refusing to accept the same authorization nonce twice *at settlement time*. However, that on-chain nonce check does **not** automatically give you “one payment unlocks exactly one HTTP request,” because the chain does not know your request semantics (method/path/body). If you need “one payment → one request,” the **resource server / middleware layer** must bind the payment/proof to request-specific context (e.g., a canonical `requestDigest` and/or per-request nonce) and enforce one-time use (a spent-store keyed by that binding).
- **Canonical request digest helper**:
  - Publish a single “request digest” algorithm so all integrators bind the same fields and don’t accidentally create replay vulnerabilities.
- **Local dev/test harness**:
  - Mock facilitator + fixtures, including “pending then finalized” flows, so teams can test gating logic without standing up chain/ZK tooling locally.

#### Option A: integration implications

The baseline integration requirements still apply. Option A typically adds:

- **Aztec-specific developer ergonomics**: local/test tooling that can produce realistic “receipt artifacts” without requiring every developer to run full Aztec infra.
- **Bridging-aware examples**: clear examples showing how to fund/spend/withdraw in the privacy domain without turning bridging events into accidental linkage via logs/telemetry.

#### Option B: integration implications

The baseline integration requirements still apply. Option B typically adds:

- **Relayer-friendly examples**: guidance on safe retries and failure handling when the broadcaster is not the payer.
- **Stealth reconciliation docs (if pursued)**: patterns for providers to reconcile one-time recipients without creating correlatable identifiers in logs.

## Recommendations

This section proposes a phased plan for selecting a concrete privacy target and shipping incremental improvements while de-risking a deeper Aztec/Noir integration.

### Phase 0: Define privacy target + key architecture decisions (must-do)

Phase 0 checklist (answer these or explicitly mark them open before starting Phase 1/2):

- **Privacy properties required**: payer? amount? usage patterns? See [Privacy Requirements](#privacy-requirements) and [Selective Disclosure](#selective-disclosure).
- **Adversaries / threat model**: which adversaries matter most? See [Potential Adversaries](#potential-adversaries).
- **UX constraints**: must work with existing EVM wallets? okay to bridge to Aztec?
- **Option A (Aztec) viability for API gating latency**: can `/verify` stay fast enough? See Option A’s verification and feasibility notes.
- **Facilitator strategy choice**: extend the existing facilitator or build a new one? Compare Strategy 1 vs Strategy 2 above (and the operational trade-offs each implies).
- **Statefulness requirements**: what must be stateful (receipt tracking, indexing, key management)? Option A introduces hard statefulness; Option B can be lighter but still benefits from idempotency and basic receipt/tx tracking for retries and reconciliation.
- **Language/tooling constraints**: what constraints exist for Aztec/Noir? See Option A’s [High-Level Architecture](#option-a-high-level-architecture).

### Phase 1: Deliver "medium privacy" on EVM (fast path)

If the goal is near-term product value with reduced doxxing:

- Add relayer support + stealth recipient options to the existing Go facilitator (Option B improvements)
- Harden operational privacy (log redaction, minimal retention, metadata discipline)
- Keep the current `/verify` + `/settle` shape so integrations stay stable
- This phase aligns with Strategy 1: extend the existing Go facilitator to ship Option B improvements, while Option A work proceeds independently

### Phase 2: Prototype Aztec/Noir receipt-based gating (research-to-prod bridge)

Build a thin vertical slice:

- Define an x402-like `paymentRequirements` variant for Aztec
- Implement a Noir/Aztec private payment that emits a receipt
- Implement `/verify` against that receipt (and decide inclusion vs proof)
- Measure latency and failure modes under load
- This phase aligns with Strategy 2: build the new, stateful privacy-preserving facilitator (Rust/TypeScript likely) independently from Phase 1 improvements

Only after this phase do you decide whether Aztec is viable for a hosted facilitator offering.

## References

- [Privacy on x402](https://www.youtube.com/watch?v=MwZXCjcv8no)
- [raid-guild/x402-facilitator-go](https://github.com/raid-guild/x402-facilitator-go)
- [go-ethereum](https://github.com/ethereum/go-ethereum)
- [EIP-3009](https://eips.ethereum.org/EIPS/eip-3009)
- [x402 V2 Launch](https://www.x402.org/writing/x402-v2-launch)
