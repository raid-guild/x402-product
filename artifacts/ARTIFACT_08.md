# x402 Product Sprint Deliverable

- **Author(s)**: Ryan (@ryanchristo)
- **Editor(s)**: NA
- **Date (created)**: 2026-01-31
- **Date (updated)**: NA
- **Sprint**: Cohort 11

## Short Description

This document provides a summary of the x402 Product Sprint presented as a deliverable: sprint narrative, evidence base, positioning options, proposed customer discovery campaigns, and recommended next steps.

## Table of Contents

- [Executive Summary](#executive-summary)
- [Purpose and Intended Use](#purpose-and-intended-use)
- [Background and Scope](#background-and-scope)
- [Summary of Work](#summary-of-work)
- [Key Sprint Outcomes](#key-sprint-outcomes)
- [Positioning Options](#positioning-options)
- [Customer Discovery](#customer-discovery)
- [Recommendations](#recommendations)
- [References](#references)

## Executive Summary

The "x402 Product Sprint" was an initiative pursued in Cohort 11. The initiative was focused on product research and development for the x402 facilitator and dashboard built for the x402 Hackathon in the previous cohort (Cohort 10). This document acts as a deliverable that can function as both a **case study** and a **consultant-style report** for Raid Guild. Throughout the sprint, we reviewed feedback from the hackathon, conducted product/market research, produced research artifacts, compiled work into a single repository, and explored the core open question: **how should the work be positioned for real clients and future internal investment?**

Key takeaways:
- **We moved from prototype-building to packaging**: we documented what was built in the previous cohort (Cohort 10), why it was built, and what we learned so the work can be communicated clearly (internally and externally).
- **Customer discovery is the highest-leverage next step**: we need direct validation of target pain points, buyers, and willingness-to-adopt before refining the scope of the "x402 product" or committing to production readiness work.
- **A white-label model emerged as a plausible path**: Raid Guild could offer a white-label x402 facilitator service with customized, branded versions of the facilitator/dashboard, but desirability and requirements must be validated.
- **A privacy-preserving facilitator is another plausible path**: Raid Guild could offer a privacy-preserving x402 facilitator service as a differentiator from standard facilitators for sensitive workflows, but feasibility and demand must be validated.
- **The positioning is still a decision point**: the work completed and presented here may be best framed as (a) a refined product development process, (b) proposed products/services, and/or (c) a research-as-a-service offering.

## Purpose and Intended Use

This document is designed to be reusable in multiple contexts:

- **Internal reference**: a single source of truth for what happened in the sprint.
- **Case study**: a narrative of the problem, approach, prototype, learnings, and outcomes.
- **Consultant deliverable**: a thorough, well-documented, and actionable report.
- **Portfolio material**: a credible representation of the team’s process and outputs.
- **Link to supporting evidence**: pointers to the team’s supporting research artifacts.

This repository is designed to be reusable for future sprints and work:

- **Host the work**: durable home for sprint outputs (artifacts, proposals) beyond the cohort timeline.
- **Centralize documentation**: supporting analyses, completed artifacts, and example proposals in one place.
- **Enable lightweight collaboration**: review via PRs, clear folder structure, and a source of truth for product decisions.
- **Support this deliverable and future work**: backing evidence for this document and a resource for the next sprint.

## Background and Scope

### Context

Cohort 10 collaborated on tools and services related to the x402 protocol: a one-click deploy facilitator ([`x402-facilitator-go`](https://github.com/raid-guild/x402-facilitator-go)), a Next.js dashboard for API-key purchase that served a facilitator hosted by Raid Guild ([`x402-dashboard`](https://github.com/raid-guild/cohort10-next-x402-dashboard)), supporting documentation for the facilitator and integrations ([`x402-docs`](https://github.com/raid-guild/cohort10-x402-docs)), and a donation demo using the hosted facilitator ([`x402-donate`](https://github.com/raid-guild/x402-donate)).

Cohort 10 submitted two entries to the x402 Hackathon (the one-click deploy facilitator and the hosted facilitator service) but did not place. Feedback from the organizer and internal review pointed to the following next steps: clarify the value proposition and do more product/market research. See [x402 Hackathon Participation](./ARTIFACT_01.md) for full hackathon summary and feedback analysis.

### Scope

This sprint emphasized **packaging**—turning the work of the previous cohort into a coherent story (what was built, why it was built, what was learned) and producing concrete next-step proposals (customer discovery campaigns), with goals of a shareable deliverable and a central repository for artifacts and proposals. An initial kickoff meeting generated the following action items, which the team distributed amongst each other, prioritized, and executed over the course of the sprint:

- Collect and analyze feedback from the hackathon to inform product improvements and identify opportunities.
- Conduct market research on existing facilitator solutions, including pricing models, usage metrics, and feature sets.
- Evaluate cost structures and implement rate limiting strategies to prevent spam bot abuse and gas drainage.
- Research the feasibility of a white-label facilitator product, including branding, maintenance, and pricing models.
- Evaluate the use of Raid Guild's Vercel account for hosting the facilitator dashboard and related documentation.
- Investigate whether deploying separate facilitator instances per network is necessary and sustainable.
- Assess the technical viability of integrating with Aztec's Noir language to provide shielded transactions.
- Create a proposal outlining the facilitator product vision, hosted on GitHub and linked to the Discord forum.

These were addressed through the research artifacts (1–7), draft proposals, and this deliverable. Development—finalizing production readiness or shipping a full production deployment—was out of scope; the sprint was primarily designed to produce evidence so that the appropriate next steps could be clearly articulated to Raid Guild members and backed by evidence.

## Summary of Work

This section provides a chronological account of the sprint from the kickoff week through the end of January.

At the end of the Cohort 11 kickoff week (Friday, January 9th), we aligned on two initiatives, one of which was an "x402 product sprint", which would focus on the continuation of the work started in the previous cohort (Cohort 10) with a focus on product/market research and identifying the requirements that would make the x402 facilitator and dashboard production ready.

At the start of the following week (Monday, January 12th), those of us who were interested (Patrick, Rome, and myself) met to discuss a list of action items that were generated from the notes of the kickoff call, which we discussed and distributed among ourselves. We set priorities for each action item and self-assigned deadlines to draft research artifacts that we could share and discuss the following week. We decided to use HackMD for the first drafts but also discussed the use of GitHub to make them more accessible.

We asynchronously shared our initial drafts and commented on each other's work. The results of the hackathon were announced, and our submissions were not included among the winning projects. One of the action items included collecting and analyzing feedback from the hackathon, which Rome took the lead on collecting and sharing with the team. For the most part, the hackathon feedback reiterated the work that we were doing: clarifying our value proposition and doing more product/market research.

We met again on Monday, January 19th to check in and discuss next steps. The discussion was focused on one of our original goals: draft a proposal (Raid Guild Improvement Proposal) informed by our product/market research that would outline next steps for the x402 facilitator and dashboard. The proposal would include work that cohort graduates could participate in to take their next steps to becoming official Raid Guild members. We discussed our proposal strategy, determining that we should take an iterative approach, consider multiple proposals that are smaller rather than trying to write one large proposal. We also discussed the possibility of a first proposal being focused on a customer discovery campaign (learning from potential customers if a white-label service and/or stronger privacy guarantees are of interest), and then future proposals could be drafted based on the results. We also discussed our progress on producing research artifacts and setting up a GitHub repository that would become the container for our completed artifacts (which was then created following the call alongside draft pull requests for each of our research artifacts).

We briefly met again on Wednesday, January 21st and shared our progress with Dekan. We discussed the possibility of our work being viewed as a "service" rather than a "product". We also discussed goals for the end of the month and what each of us might present for the next demo day. We planned to reconvene the following week and continue working asynchronously in the meantime.

Our final meeting for the sprint was on Monday, January 26th. We continued our previous discussion on our work being viewed as a "service" rather than a "product" alongside how we should present our work to Raid Guild members and the importance of collecting feedback. We discussed the possibility of presenting our work as a "case study" and producing a summarizing document that could be presented as a consultant-styled deliverable. We also discussed demo day as the most appropriate first opportunity to share our work with Raid Guild members and how we may need to consider scheduling a separate follow-up call if there is a low turnout.

In the final week, Patrick focused on refining campaign briefs and writing a proposal for the customer discovery campaign(s), Rome met with our first potential client that reached out to her on LinkedIn and then met with another Raid Guild community member to discuss business development, and I (Ryan) focused on the final push to finalize and consolidate the artifacts and to produce a document that summarizes the work we completed for the sprint (this document).

## Key Sprint Outcomes

- **Deeper understanding**: conducted product/market research across competitors, costs, white-label feasibility, deployment options, infrastructure providers, and privacy-preserving options—surfacing constraints, opportunities, and trade-offs that inform product positioning and recommended next steps.
- **Centralized documentation**: consolidated artifacts and notes into a shareable repository and report format.
- **Centralized product workflow**: established a central GitHub repository to make artifacts/proposals accessible, reviewable, and easy to extend, and to manage issues as epics that span multiple repositories (e.g. facilitator, dashboard, docs).
- **Evidence base assembled**:
  - **x402 Hackathon participation**: External validation of positioning gaps; evidence for leading with hosted facilitator + API keys and for running customer discovery (chains, developers) ([`artifact 1`](./ARTIFACT_01.md)).
  - **x402 Facilitator competitor analysis**: Market and pricing benchmarks, competitive threats, and strategic recommendation to own underserved segments rather than compete head-on with incumbents ([`artifact 2`](./ARTIFACT_02.md)).
  - **Cost structure and rate limiting**: Cost and guardrail constraints (per-tx costs, break-even, rate limits, OFAC) that inform pricing, abuse prevention, and implementation decisions ([`artifact 3`](./ARTIFACT_03.md)).
  - **White-label product feasibility**: Feasibility verdict (technically feasible, commercially viable) and target-segment evidence for a white-label offering and discovery ([`artifact 4`](./ARTIFACT_04.md)).
  - **Infrastructure cost analysis**: Hosting and deployment cost evidence (Vercel, Supabase, RPC, operations) for budgeting and deployment-model decisions ([`artifact 5`](./ARTIFACT_05.md)).
  - **Facilitator deployment strategy**: Evidence on when separate instances per network are needed vs. single multi-network deployment; trade-offs for internal and white-label use ([`artifact 6`](./ARTIFACT_06.md)).
  - **Privacy-preserving facilitator**: Viability and phased options (EVM-native improvements vs. privacy layer) for treating privacy as a differentiator; inputs for roadmap and discovery ([`artifact 7`](./ARTIFACT_07.md)).
- **Proposals for next steps**:
  - **Customer discovery campaign: white-label service offering** ([`proposal 1`](../proposals/PROPOSAL_01.md) — planned/in-progress)
  - **Customer discovery campaign: privacy-preserving facilitator offering** ([`proposal 2`](../proposals/PROPOSAL_02.md) — planned/in-progress)

## Positioning Options

The sprint surfaced three plausible frames for “what this is”:
- **Refined product development process**: a repeatable methodology Raid Guild can use to move from exploration → packaging → validated next steps (including how we run discovery and turn research into proposals).
  - Narrative/value-prop feedback loops ([`artifact 1`](./ARTIFACT_01.md))
  - Market/competitive benchmarking ([`artifact 2`](./ARTIFACT_02.md))
  - Central repository with artifacts as packaging outcome
  - Proposals as next-step outputs ([`proposal 1`](../proposals/PROPOSAL_01.md), [`proposal 2`](../proposals/PROPOSAL_02.md) — planned/in-progress)
- **Proposed product/service**: a concrete offering that can be tested with customers—currently framed as two customer discovery campaigns (white-label service and privacy-preserving facilitator) before committing to build.
  - Cost/rate-limit constraints ([`artifact 3`](./ARTIFACT_03.md))
  - White-label feasibility ([`artifact 4`](./ARTIFACT_04.md))
  - Hosting/infra considerations ([`artifact 5`](./ARTIFACT_05.md))
  - Multi-network deployment trade-offs ([`artifact 6`](./ARTIFACT_06.md))
  - Privacy-preserving facilitator viability ([`artifact 7`](./ARTIFACT_07.md))
  - Draft campaigns ([`proposal 1`](../proposals/PROPOSAL_01.md), [`proposal 2`](../proposals/PROPOSAL_02.md) — planned/in-progress)
- **Research-as-a-service offering**: position the work primarily as a repeatable research + recommendation service that helps protocols/L2s clarify needs and decide what to build (with x402 as a concrete example).
  - Feedback-driven iteration ([`artifact 1`](./ARTIFACT_01.md))
  - Market landscape framing ([`artifact 2`](./ARTIFACT_02.md))
  - Systematic research across cost, feasibility, deployment, and privacy (remaining artifacts)
  - Draft proposals as example recommendation outputs ([`proposal 1`](../proposals/PROPOSAL_01.md), [`proposal 2`](../proposals/PROPOSAL_02.md) — planned/in-progress)
  - Sprint process documentation (this artifact)

## Customer Discovery

Before we invest in production readiness or a full deployment, we need to learn whether we're solving a problem customers actually have, who would pay for and use a white-label facilitator service or a privacy-preserving facilitator, and under what conditions.

The following outlines what a customer discovery campaign would aim to produce and which hypotheses to test.

Proposed outputs:

- **Target segment**: candidate L2s/protocols + key roles (ops, governance, product, community)
- **Interview protocol**: questions to test pains, current workflows, switching costs, and success criteria
- **Demand signals**: evidence of willingness-to-adopt (and pay), plus must-have requirements (including privacy)
- **Decision memo**: recommended positioning and a prioritized roadmap for the next proposal/sprint

Discovery should validate or deepen the hypotheses raised in the research. Each artifact below is the primary source for its hypothesis; use it to design interview questions and interpret findings.

- **Positioning and narrative**: Test which narrative lands (hosted vs. self-host vs. white-label) and probe known confusion points from hackathon feedback ([`artifact 1`](./ARTIFACT_01.md)).
- **Competitive context**: Test what prospects use today, what they pay for, and what "good enough" looks like; use market and competitor data to frame comparisons ([`artifact 2`](./ARTIFACT_02.md)).
- **Cost and guardrails**: Test acceptable pricing, usage limits, and anti-abuse expectations; artifact establishes per-transaction costs, break-even, and OFAC context ([`artifact 3`](./ARTIFACT_03.md)).
- **White-label demand and requirements**: Test branding, maintenance, procurement, and support expectations; artifact identifies target segments and positions the offering as payment infrastructure ([`artifact 4`](./ARTIFACT_04.md)).
- **Hosting and deployment**: Test whether prospects need their own infrastructure or shared infrastructure, separate deployments per network; artifacts set out cost implications and deployment trade-offs ([`artifact 5`](./ARTIFACT_05.md), [`artifact 6`](./ARTIFACT_06.md)).
- **Privacy guarantees**: Test whether privacy is a must-have, nice-to-have, or non-issue and what "privacy" means to them; artifact assesses viability and phased options ([`artifact 7`](./ARTIFACT_07.md)).

## Recommendations

- **Present the work to Raid Guild members and request feedback**: share this deliverable (and the repository artifacts) to validate the process, stress-test the positioning options, and gather recommendations for next steps before investing further.
- **Run a focused discovery campaign before scoping further engineering work**: execute interviews and synthesis to decide which positioning option to adopt, using the hypotheses and references in the [Customer Discovery](#customer-discovery) section above.
- **Prototype the offer, not the product**: draft an outline of white-label service packages with scope, pricing assumptions, and success metrics, drawing on cost and rate-limit constraints ([`artifact 3`](./ARTIFACT_03.md)), target segments and pricing ([`artifact 4`](./ARTIFACT_04.md)), and infrastructure/deployment assumptions ([`artifact 5`](./ARTIFACT_05.md), [`artifact 6`](./ARTIFACT_06.md)).
- **Define guardrails early**: decide on rate limiting, abuse prevention, and cost containment principles that would apply to both the Raid Guild deployment and any white-label deployments (see [`artifact 3`](./ARTIFACT_03.md)).
- **Treat privacy as a validated roadmap branch**: only elevate “privacy-preserving” to top-level positioning if discovery indicates strong demand; otherwise keep it as a longer-horizon differentiator (see [`artifact 7`](./ARTIFACT_07.md)).
- **Keep artifacts durable and reviewable**: continue consolidating work into the GitHub repository with lightweight reviews, and keep HackMD reserved for working notes (see [x402-product-sprint](https://hackmd.io/XzDm5pCeSXOdia9psL0jhg?view) and [`raid-guild/x402-product`](https://github.com/raid-guild/x402-product)).

## References

- HackMD process document (action items, meeting notes, links to other documents): [x402-product-sprint](https://hackmd.io/XzDm5pCeSXOdia9psL0jhg?view)
- GitHub repository for consolidating completed research documents: [raid-guild/x402-product](../README.md) (this repository)
- Supporting research artifacts: (see all artifacts leading up to this artifact in the [`artifacts/`](./README.md) directory)
- Example proposals for next steps: (see the first two proposals included in the [`proposals/`](../proposals/README.md) directory)
