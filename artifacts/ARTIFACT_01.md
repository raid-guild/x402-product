# x402 Hackathon Participation

- **Author(s)**: Ryan (@ryanchristo)
- **Editor(s)**: NA
- **Date (created)**: 2026-01-27
- **Date (updated)**: NA
- **Sprint**: Cohort 11

## Short Description

Provides a summary of Cohort 10's participation in the x402 Hackathon, the hackathon results, and the collected feedback, and then analyzes the results and feedback.

## Table of Contents

- [Executive Summary](#executive-summary)
- [Background Context](#background-context)
  - [Raid Guild](#raid-guild)
  - [Raid Guild Cohorts](#raid-guild-cohorts)
  - [Cohort 10 Theme](#cohort-10-theme)
  - [What is x402?](#what-is-x402)
  - [x402 Hackathon](#x402-hackathon)
- [Cohort 10 Projects](#cohort-10-projects)
  - [x402-facilitator-go](#x402-facilitator-go)
  - [x402-dashboard](#x402-dashboard)
  - [x402-docs](#x402-docs)
  - [x402-donate](#x402-donate)
- [Hackathon Summary](#hackathon-summary)
  - [Submissions](#submissions)
  - [Results & Feedback](#results--feedback)
- [Feedback Analysis](#feedback-analysis)
- [Recommendations](#recommendations)
- [References](#references)

## Executive Summary

- **What was built**: an x402 facilitator, a marketing page, and a dashboard for managing API keys:
  - **Facilitator**: a one-click deploy x402 facilitator with configurable authentication options ([`x402-facilitator-go`](https://github.com/raid-guild/x402-facilitator-go))
  - **Frontend/Dashboard**: a full-stack Next.js application with a marketing page and developer dashboard; the dashboard enables developers to purchase and manage API keys for a hosted x402 facilitator service ([`x402-dashboard`](https://github.com/raid-guild/cohort10-next-x402-dashboard))
  - **Documentation**: a documentation site focused on facilitator deployment and Next.js integration ([`x402-docs`](https://github.com/raid-guild/cohort10-x402-docs))
  - **Donation Page**: a self-contained donation page that demonstrates how x402 works ([`x402-donate`](https://github.com/raid-guild/x402-donate))
- **Hackathon outcome**: Cohort 10 submitted two entries (one for the facilitator and one for the hosted service). These entries were not included among the winners announced by the hackathon organizer ([x402 Hackathon Winners](https://x.com/austingriffith/status/2011108282648445294)).
- **Key takeaways**: The positioning was not clear to the hackathon organizer, who recommended leading with “hosted facilitator + API key purchase” as the core value proposition and treating “deploy your own facilitator” as a bonus.

## Background Context

### Raid Guild

Raid Guild is a **decentralized collective** (DAO-powered guild) of builders that helps teams ship Web3 products across full-stack development and related disciplines. It describes itself as a “battle-tested” squad that forms custom teams per project to build things like dApps, smart contracts, DAO tooling, and public goods ([Raid Guild](https://www.raidguild.org/)).

### Raid Guild Cohorts

Raid Guild’s cohort onboarding program is a **monthly, ~4-week proving ground** designed to build reputation through delivered work. Cohorts start on the **first Monday of each month** and combine guided early-week programming with an execution phase:
- **Week 1**: daily sessions (1–2 hours each)
- **Weeks 2–4**: project work (target 10–20 hours/week)
- **Week 5**: Demo Day (2–3 hours)

The cohort program is framed as **proof-of-work** (earn your seat through completed work, not promises) and a pathway from cohort participation to deeper involvement in the guild ([Join / Cohorts](https://www.raidguild.org/join)).

### Cohort 10 Theme

With AI increasingly shaping the 2026 narrative, Cohort 10 explored several adjacent themes (including x402, ERC-8004, and A2P). In the first week of the cohort—when cohorts typically align on a mission—the group chose to focus on x402. Shortly after this decision, the x402 Hackathon was announced, which helped solidify the decision.

### What is x402?

x402 is an open, neutral standard for “internet-native payments” that uses HTTP `402 Payment Required` to prompt a client (human or agent) to pay and retry the request. It embeds payments into existing HTTP flows, aiming for low-friction micropayments without the account setup, KYC, and API-key overhead of traditional payment systems ([x402](https://www.x402.org/)).

### x402 Hackathon

The x402 Hackathon was a virtual event running Dec 8, 2025 - Jan 5, 2026, focused on shipping projects that make use of x402 with mentorship support. The hackathon did not advertise financial prizes; instead, winners would receive marketing/distribution support and potential grant opportunities. The requirement was that projects were built during the event window and submitted by the deadline and submissions would include a 2-minute demo video shared on social media ([x402 Hackathon](https://www.x402hackathon.com/)).

## Cohort 10 Projects

### x402-facilitator-go

- **Repository**: [`raid-guild/x402-facilitator-go`](https://github.com/raid-guild/x402-facilitator-go)
- **Deployed instance**: [x402-facilitator-go.vercel.app](https://x402-facilitator-go.vercel.app/)
- **What it is**: A “one-click deploy” x402 facilitator service intended for Vercel deployment. It verifies and settles x402 payments so app backends can remain focused on business logic.
- **Key capabilities**:
  - **Verify** (`POST /verify`): validate signature, balances, and payment requirements
  - **Settle** (`POST /settle`): execute on-chain payment settlement after verification
  - **Supported** (`GET /supported`): advertise supported x402 versions/schemes/networks
- **How it works**:
  - Uses **ERC-3009** “transfer with authorization” for **exact payments**
  - Supports both x402 v1 and v2 request formats (while still focusing on the `exact` scheme)
- **Additional notes**:
  - Designed for Vercel deployment and configured via environment variables
  - Requires a funded facilitator wallet and RPC configuration to handle payments (and to report supported networks)
  - Optional API-key authentication can restrict access to `/verify` and `/settle`

### x402-dashboard

- **Repository**: [`raid-guild/cohort10-next-x402-dashboard`](https://github.com/raid-guild/cohort10-next-x402-dashboard)
- **Deployed instance**: [cohort10-next-x402-dashboard-psi.vercel.app](https://cohort10-next-x402-dashboard-psi.vercel.app/)
- **What it is**: A full-stack Next.js application for a hosted facilitator service with a marketing page (value proposition, use cases, and integration overview) + developer dashboard (purchase, generate, and manage API keys for the hosted facilitator).
- **Key capabilities**:
  - API keys are purchased via x402 and expire after 30 days
  - API key issuance requires successful `verify` + `settle`
  - Initial support targets Base (chainId `8453`) and USDC on Base
- **How it works**:
  - `POST /api/keys/generate` returns `402` with payment requirements
  - Client signs `TransferWithAuthorization` and retries with payment header
  - Server calls the hosted facilitator instance (`POST /verify` then `POST /settle`)
  - On success, store hashed key + `expires_at = now + 30 days` (Supabase/Postgres)
- **Additional notes**:
  - Go facilitator + Next.js application + Supabase/Postgres (for managing API keys)

### x402-docs

- **Repository**: [`raid-guild/cohort10-x402-docs`](https://github.com/raid-guild/cohort10-x402-docs)
- **Deployed instance**: [cohort10-x402-docs.vercel.app/project-spec](https://cohort10-x402-docs.vercel.app/project-spec)
- **What it is**: Documentation site for the Go facilitator + Next.js integration.
- **Key capabilities**:
  - Explains how the facilitator works and why it exists (overview + “how x402 works”)
  - Provides deployment and configuration guidance for the one-click deploy x402 facilitator
  - Documents `/verify`, `/settle`, and `/supported`, plus a Next.js integration guide
- **How it works**:
  - Source documents live in `docs-src/` and are published as a documentation site

### x402-donate

- **Repository**: [`raid-guild/x402-donate`](https://github.com/raid-guild/x402-donate)
- **Deployed instance**: [x402-donate.vercel.app](https://x402-donate.vercel.app)
- **What it is**: A donation page powered by x402 for accepting USDC payments.
- **Key capabilities**:
  - Uses wallet connection (Reown AppKit) and typical EVM app stack (wagmi, Tailwind)
  - Implements the “402 → sign authorization → verify/settle → success” flow
- **How it works**:
  - User selects an amount/network, signs an ERC-3009 authorization, and the facilitator verifies + settles on-chain

## Hackathon Summary

### Submissions

Cohort 10 submitted the following projects:
- **Submission A**: [`x402-facilitator-go`](https://github.com/raid-guild/x402-facilitator-go)
  - The facilitator was submitted as a standalone service (self-hosting option)
- **Submission B**: [`x402-dashboard`](https://github.com/raid-guild/cohort10-next-x402-dashboard) + [`x402-docs`](https://github.com/raid-guild/cohort10-x402-docs)
  - The dashboard, documentation, and a hosted facilitator were submitted as a packaged service

### Results & Feedback

Winners were announced by the hackathon organizer on X ([x402 Hackathon Winners](https://x.com/austingriffith/status/2011108282648445294)). The Cohort's submissions did not place. Among the winners was another self-hosted faciliator but no other projects were offering a forkable hosting service.

One of the cohort members reached out for feedback. The core concept landed with the judge/organizer once the full picture was understood: a facilitator that supports API keys and can be forked/self-hosted. The main confusion was positioning—leading with “deploy your own facilitator” made the submission feel less differentiated since self-hosting is already possible in the x402 ecosystem.

The recommendation was to lead with the hosted offering (hosted facilitator + API-key purchase) as the primary value proposition, with self-hosting positioned as an additional "bonus" option. Suggested next steps included outreach to teams already using public facilitators and additional customer discovery conversations.

## Feedback Analysis

- **Positioning**: “Deploy your own facilitator” is compelling for builders, but it can look like a thin wrapper if self-hosting is already available. The key differentiator should be framed as the **hosted offering (hosted facilitator + API-key purchase)**.
- **Storytelling**: A stronger narrative with more clarity can be achieved with:
  - a clearer “before vs after” for developer onboarding
  - a concrete user story (e.g., “paid API in 10 minutes, no Stripe, no accounts”)
  - tighter explanation of why facilitation matters (gas abstraction, settlement reliability)
- **Go-to-market learning gap**: The strongest next step is to validate who actually wants:
  - hosted facilitator API keys + dashboard
  - a white-label facilitator for chains/partners
  - a self-hosted facilitator template
- **Discovery approach**: A targeted outreach campaign can validate these segments and inform an internal proposal. Suggested targets include (1) chains to understand payment needs and potential gaps x402 could fill (white-label facilitator angle), and (2) developers who want a self-hostable facilitator or facilitator API.

## Recommendations

- **Validate target users and requirements**: run customer discovery across the main segments:
  - developers currently using public facilitators
  - teams building paid APIs / agentic tools that need low-friction billing
  - chains/partners evaluating a white-label facilitator
- **Refine positioning and product narrative**: lead with **hosted facilitator + API-key purchase via x402** and position self-hosting as an optional “deploy your own” path (self-hosted faciliator and/or a monetized facilitator hosting service)
- **Package the hosted-service experience**: align and harden the end-to-end flow (faciliator deployment, dashboard onboarding, API key purchase, and documentation) for a production-ready experience

## References

- [x402](https://www.x402.org/)
- [x402 Hackathon](https://www.x402hackathon.com/)
- [x402-docs](https://github.com/raid-guild/cohort10-x402-docs)
- [x402-dashboard](https://github.com/raid-guild/cohort10-next-x402-dashboard)
- [x402-facilitator-go](https://github.com/raid-guild/x402-facilitator-go)
- [x402-donate](https://github.com/raid-guild/x402-donate)
- [x402 Hackathon Winners](https://x.com/austingriffith/status/2011108282648445294)
