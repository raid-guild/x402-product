# Infrastructure Cost Analysis

- **Author(s)**: Ryan (@ryanchristo)
- **Editor(s)**: NA
- **Date (created)**: 2026-01-28
- **Date (updated)**: NA
- **Sprint**: Cohort 11

## Short Description

This document provides a comprehensive infrastructure cost analysis including Vercel (dashboard, facilitator, documentation), Supabase (database/auth/storage), RPC providers (Infura/Alchemy), and Raid Guild operational setup and maintenance.

## Table of Contents

- [Executive Summary](#executive-summary)
- [Deployment Architecture](#deployment-architecture)
  - [Deployment Models](#deployment-models)
- [Vercel Platform Costs](#vercel-platform-costs)
  - [Hobby Tier](#hobby-tier)
  - [Pro Tier](#pro-tier)
  - [Enterprise Tier](#enterprise-tier)
- [Supabase Platform Costs](#supabase-platform-costs)
  - [Free Tier](#free-tier)
  - [Pro Tier](#pro-tier-1)
  - [Team Tier](#team-tier)
  - [Enterprise Tier](#enterprise-tier-1)
- [RPC Provider Costs](#rpc-provider-costs)
  - [Infura](#infura)
  - [Alchemy](#alchemy)
  - [Quick Comparison](#quick-comparison)
- [Project Management Costs](#project-management-costs)
  - [Initial Setup](#initial-setup)
  - [Ongoing Management](#ongoing-management)
- [Pay-As-You-Use Breakdown](#pay-as-you-use-breakdown)
  - [Vercel Overage Costs](#vercel-overage-costs)
  - [Supabase Overage Costs](#supabase-overage-costs)
  - [RPC Provider Usage Costs](#rpc-provider-usage-costs)
- [Cost Optimization Strategies](#cost-optimization-strategies)
  - [Vercel Optimization](#vercel-optimization)
  - [Supabase Optimization](#supabase-optimization)
  - [RPC Optimization](#rpc-optimization)
- [Recommendations](#recommendations)
  - [Vercel Recommendations](#vercel-recommendations)
  - [Supabase Recommendations](#supabase-recommendations)
  - [RPC Provider Recommendations](#rpc-provider-recommendations)
  - [Combined Recommendations](#combined-recommendations)
- [References](#references)

## Executive Summary

This document provides a comprehensive cost analysis for hosted infrastructure:

1. **Vercel**: Dashboard + Facilitator + Documentation (cost depends on deployment architecture and traffic)
2. **Supabase**: Database/auth/storage services (cost depends on subscription model and usage)
3. **RPC Providers**: Infura or Alchemy (existing Raid Guild providers; cost depends on usage)
4. **Internal Operations**: Initial setup + ongoing management of infrastructure (internal operational costs)

Costs are presented with example tiers and scenarios; the biggest cost drivers are the deployment model (shared vs per-client) and usage (traffic, MAUs, RPC calls, storage/bandwidth). For budgeting, combine platform/vendor bills (Vercel + Supabase + RPC) with the internal operations estimates in the Project Management section.

*Note: This cost analysis does not include gas fees, which are covered in [Cost Structure & Rate Limiting Analysis](./ARTIFACT_03.md).*

## Deployment Architecture

The cost structure will vary significantly based on the deployment model chosen. Key architecture choices include:

1. **Vercel deployments**:
   - **Dashboard**: per-client or shared deployments
   - **Facilitator**: per-client or shared deployments
   - **Documentation**: per-client or shared deployments

2. **Supabase subscriptions**: per-client or shared subscriptions

3. **RPC provider**: per-client or shared provider project/API keys

### Deployment Models:

1. **Per-Client Deployments**: Each client requires their own dashboard and facilitator service
   - Highest cost scenario (multiple deployments)
   - Best isolation and customization per client
   - Documentation: per-client or shared (depending on approach)
   - Supabase: per-client or shared (depending on approach)
   - RPC: per-client or shared provider project/API keys

2. **Shared Dashboard, Per-Client Facilitator**: All clients share one dashboard, but each client has their own facilitator service
   - Moderate cost scenario
   - Dashboard costs are shared, facilitator costs scale with client count
   - Documentation: per-client or shared (depending on approach)
   - Supabase: per-client or shared (depending on approach)
   - RPC: per-client or shared provider project/API keys

3. **Fully Shared**: All clients share both the same dashboard and facilitator service
   - Lowest cost scenario (single deployment of each)
   - Requires multi-tenancy architecture
   - Documentation: per-client or shared (depending on approach)
   - Supabase: shared (one subscription for all clients) or per-client (if isolation required)
   - RPC: per-client or shared provider project/API keys

**Note**: Examples assume single deployments. Multiply costs based on chosen architecture. Documentation, Supabase, and RPC provider models can be chosen independently of the Vercel deployment architecture.

## Vercel Platform Costs

Vercel pricing is organized into tiers (Hobby, Pro, Enterprise). The examples below focus on Pro for paid application hosting.

### Hobby Tier

**Cost**: $0/month

**Included**: 100 GB data transfer, unlimited projects, CI/CD, preview deployments, basic functions/middleware

**Limitations**: No team collaboration, limited analytics, no custom domains, no SSO

**Suitable For**: Development/testing, low-traffic projects, proof-of-concept

### Pro Tier

**Base Cost**: $20/month per developer seat

**Included** ($20 credit applied):
- 1 TB data transfer ($0.15/GB over)
- 10M edge requests ($2.00/M over)
- 1M function invocations ($0.60/M over)
- 1,000 GB-hours compute ($0.18/GB-hour over)
- Team collaboration, analytics, custom domains

**Optional Add-Ons**: SAML SSO ($300/mo), HIPAA BAA ($350/mo), Observability Plus ($10/mo), Web Analytics Plus ($10/mo), Speed Insights ($10/project/mo)

**Example Costs** (single deployment of paid projects: dashboard + facilitator service):

| Traffic Level | Data Transfer | Edge Requests | Functions | Compute | **Total/Month** |
|--------------|---------------|---------------|-----------|---------|-----------------|
| Low | 50 GB (included) | 500K (included) | 100K (included) | 200 GB-hr (included) | **$20** |
| Moderate | 1.5 TB (+$75) | 15M (+$10) | 2M (+$0.60) | 1,500 GB-hr (+$90) | **$195.60** |
| High | 5 TB (+$600) | 50M (+$80) | 10M (+$5.40) | 5,000 GB-hr (+$720) | **$1,425.40** |

*Note: Documentation costs are not included in these Pro examples (assumes free tier is sufficient for documentation).*

**Multi-Deployment Scenarios** (10 clients, moderate traffic per deployment):

| Architecture | Projects | Monthly Cost |
|--------------|----------|--------------|
| **Per-Client** | 10 dashboards + 10 facilitators (+ docs) | **$3,912.00** (20 × $195.60) |
| **Shared Dashboard** | 1 dashboard + 10 facilitators (+ docs) | **$2,151.60** (11 × $195.60) |
| **Fully Shared** | 1 dashboard + 1 facilitator (+ docs) | **$391.20** (2 × $195.60) |

*Note: The $20/month “base cost” is **per developer seat**, not per deployment. A single Pro seat can cover multiple projects/deployments; additional cost comes from usage overages (data transfer, requests, compute).*

### Enterprise Tier

**Cost**: Custom pricing (contact Vercel sales), typically $500-$2,000+/month base

**Features**: All Pro features + custom limits, dedicated infrastructure, SSO, enhanced observability, SLAs, priority support

**Benefits**: Volume discounts, consolidated billing, better cost predictability

**Example Costs** (depending on traffic):
- Small (10-50 deployments): $500-$2,000/month
- Medium (50-200 deployments): $1,500-$5,000/month
- Large (200+ deployments): $3,000-$10,000+/month

## Supabase Platform Costs

Each client may require a Supabase subscription for database, authentication, and storage services. Similar to the facilitator dashboard and documentation site, Supabase subscriptions can be:
- **Shared**: One subscription for all clients (multi-tenancy)
- **Per-Client**: One subscription per client (better isolation)

### Free Tier

**Cost**: $0/month

**Included**:
- Up to 2 active projects per organization
- 500 MB database storage per project
- 1 GB file storage
- 50,000 monthly active users (MAUs)
- 5 GB bandwidth
- 500,000 Edge Function invocations
- Community support

**Limitations**: Projects paused after 1 week of inactivity, limited storage, no backups, no SSO

**Suitable For**: Development/testing, proof-of-concept, very low-traffic projects

### Pro Tier

**Base Cost**: $25/month per project (includes $10 in compute credits)

**Included**:
- 100,000 MAUs (additional at $0.00325 per MAU)
- 8 GB database storage (additional at $0.125 per GB)
- 100 GB file storage (additional at $0.021 per GB)
- 250 GB bandwidth (additional at $0.09 per GB)
- 2 million Edge Function invocations (additional at $2 per million)
- Email support
- Daily backups stored for 7 days
- 7-day log retention

**Compute Add-ons**: Available to scale database up to 64 cores and 256 GB RAM

**Example Costs** (single subscription):

| Usage Level | Database Storage | File Storage | Bandwidth | MAUs | Edge Functions | **Total/Month** |
|-------------|------------------|--------------|-----------|------|----------------|-----------------|
| Low | 8 GB (included) | 50 GB (included) | 100 GB (included) | 50K (included) | 500K (included) | **$25** |
| Moderate | 20 GB (+$1.50) | 150 GB (+$1.05) | 500 GB (+$22.50) | 150K (+$162.50) | 3M (+$2.00) | **$214.55** |
| High | 50 GB (+$5.25) | 300 GB (+$4.20) | 1.5 TB (+$112.50) | 500K (+$1,300) | 10M (+$16.00) | **$1,462.95** |

**Multi-Subscription Scenarios** (10 clients, moderate usage per subscription):

| Architecture | Subscriptions | Monthly Cost |
|--------------|---------------|--------------|
| **Per-Client** | 10 Supabase subscriptions | **$2,145.50** (10 × $214.55) |
| **Shared** | 1 Supabase subscription | **$214.55** (usage accumulates across all clients) |

*Note: Shared subscription costs scale with combined usage across all clients.*

### Team Tier

**Base Cost**: $599/month per project (includes $10 in compute credits)

**Included**:
- Everything in Pro Plan, plus:
- SOC2 compliance
- HIPAA compliance available as paid add-on
- Read-only and billing member roles
- Single Sign-On (SSO) for Supabase Dashboard
- Priority email support and SLAs
- Daily backups stored for 14 days
- 28-day log retention

**Additional compute resources**: Available as needed

**Suitable For**: Organizations requiring compliance, SSO, enhanced support, and SLAs

**Example Costs**:
- Base: $599/month per subscription
- With usage overages: $600-$1,500+/month per subscription (depending on traffic)
- Multi-subscription: Multiply by subscription count

### Enterprise Tier

**Cost**: Custom pricing (contact Supabase sales)

**Features**: Designated support manager, uptime SLAs, on-premise support, 24×7×365 premium enterprise support, private Slack channel, custom security questionnaires

**Benefits**: Volume discounts, consolidated billing, better cost predictability, enterprise-grade support

**Suitable For**: Large-scale applications running at internet scale workloads

**Example Costs** (depending on scale):
- Small (1-5 subscriptions): $1,000-$3,000/month
- Medium (5-20 subscriptions): $3,000-$10,000/month
- Large (20+ subscriptions): $8,000-$25,000+/month

## RPC Provider Costs

RPC providers provide blockchain node access (Ethereum + L2s/testnets, etc.) without running your own full node infrastructure. Costs are usually driven by **request complexity** (credits / compute units) and **throughput limits**.

This section explores the existing providers used by the Raid Guild team: [Infura](https://infura.io/) and [Alchemy](https://dashboard.alchemyapi.io/).

### Infura

Infura uses **credit-based pricing** with fixed daily credit quotas per plan. Each JSON-RPC method consumes a defined number of credits (e.g., `eth_call` = 80 credits, `eth_getLogs` = 255 credits).

**Plans** (new customers):
- **Core (Free)**: 3,000,000 credits/day, 500 credits/second — **$0/month**
- **Developer**: 15,000,000 credits/day, 4,000 credits/second — **$50/month**
- **Team**: 75,000,000 credits/day, 40,000 credits/second — **$225/month**
- **Enterprise**: Custom (elastic auto-scaling)

**Rule-of-thumb capacity** (approximate max calls/day if using only one method):
- Core (3,000,000 credits/day):
  - `eth_call` (80 credits): ~37,500 calls/day
  - `eth_getLogs` (255 credits): ~11,764 calls/day
- Developer (15,000,000 credits/day):
  - `eth_call` (80 credits): ~187,500 calls/day
  - `eth_getLogs` (255 credits): ~58,823 calls/day
- Team (75,000,000 credits/day):
  - `eth_call` (80 credits): ~937,500 calls/day
  - `eth_getLogs` (255 credits): ~294,117 calls/day

**When to choose Infura**:
- You want predictable monthly pricing via fixed quotas and clear rate limits
- Your workload maps cleanly to credit budgeting and you want to cap spend with a plan

### Alchemy

Alchemy uses **Compute Units (CUs)** per API method, plus throughput measured in CU/s (CUPS). Each JSON-RPC method consumes a defined number of CUs (e.g., `eth_blockNumber` = 10 CU, `eth_call` = 26 CU, `eth_getLogs` = 60 CU).

**Plans**:
- **Free**: 30,000,000 CU/month — **$0/month**
- **Pay As You Go (PAYG)**: minimum **$5** (includes **11M CUs**), then usage priced:
  - **$0.45 per 1M CU** (up to 300M CU/month)
  - **$0.40 per 1M CU** (300M+ CU/month)
- **Enterprise**: Custom pricing

**Rule-of-thumb capacity** (approximate max calls/month if using only one method):
- Free (30,000,000 CU/month):
  - `eth_blockNumber` (10 CU): ~3,000,000 calls/month
  - `eth_call` (26 CU): ~1,153,846 calls/month
  - `eth_getLogs` (60 CU): ~500,000 calls/month

**Example PAYG costs**:
- 100M CU/month: \(100 × $0.45\) ≈ **$45/month**
- 500M CU/month: \(300 × $0.45\) + \(200 × $0.40\) = **$215/month**
- 1B CU/month: \(300 × $0.45\) + \(700 × $0.40\) = **$415/month**

**When to choose Alchemy**:
- You prefer pay-for-usage economics and want to scale cost smoothly with demand
- You expect to leverage Alchemy’s enhanced APIs/tooling in addition to standard RPC

### Quick Comparison

| Provider | Billing unit | Free tier | Paid starting point | Best for |
|---------|--------------|-----------|---------------------|----------|
| **Infura** | Credits (per request, varies by method) | 3M credits/day | $50/mo (Developer) | Predictable plan-based budgeting with daily quotas |
| **Alchemy** | Compute Units (per request, varies by method) | 30M CU/month | PAYG ($5 min) | Smooth usage-based pricing + broader platform tooling |

## Project Management Costs

This section covers **Raid Guild internal labor costs** for standing up and operating the infrastructure (planning, setup, automation, monitoring, incident response, and ongoing coordination). Unlike the sections above (which compare **third-party platform/vendor pricing** like Vercel, Supabase, and RPC providers), these costs represent the time required to manage those platforms.

### Initial Setup

**Activities**: Account/project setup, domain/SSL, CI/CD, environment variables, monitoring, documentation, initial deployment, Supabase project setup and configuration

**Time & Cost**:
- Simple (shared deployment): 10-12 hours → $500-$1,200 (includes Supabase setup)
- Complex (per-client with automation): 16-20 hours → $800-$2,000 (includes Supabase setup)

*Note: Costs are based on $50-$100/hour member rates.*

### Ongoing Management

**Current State**: Raid Guild's Infrastructure Maestro role already exists and may be suitable for managing infrastructure.

**Options**:
1. **Extend Infrastructure Maestro**: Add Vercel and Supabase management (3-5 hrs/mo) → $150-$500/month
2. **New Dedicated Role**: Separate Vercel/Supabase/platform management (5-10 hrs/mo) → $250-$1,000/month

**Management Activities**: Monitoring, env vars/secrets, deployments/rollbacks, config updates, usage optimization, coordination, documentation, Supabase database management, backup monitoring

**Factors Affecting Time**: Deployment architecture (shared vs per-client), number of clients, deployment frequency, incident rate

**Cost Summary**:
- Initial: $500-$2,000 (one-time, includes Supabase setup)
- Ongoing: $150-$1,000/month (includes Supabase management)
- First Year Total: $2,300-$14,000 (depending on option chosen)

## Pay-As-You-Use Breakdown

### Vercel Overage Costs

Vercel charges for usage beyond included limits:

| Resource | Included (Pro) | Overage Rate | Impact |
|----------|----------------|--------------|--------|
| **Data Transfer** | 1 TB | $0.15/GB | High (media-heavy sites) |
| **Edge Requests** | 10M | $2.00/M | Moderate (scales with traffic) |
| **Function Invocations** | 1M | $0.60/M | Low-Moderate (API usage) |
| **Compute** | 1,000 GB-hours | $0.18/GB-hour | High (compute-intensive) |
| **Origin Transfer** | 100 GB | $0.06/GB | Low |
| **ISR Cache** | - | $0.40/M reads, $4.00/M writes | Low |

*Compute includes Active CPU Time (varies by region, ≈ $0.128/hr) and Provisioned Memory (≈ $0.0106/GB-hour)*

### Supabase Overage Costs

Supabase charges for usage beyond included limits (Pro Tier):

| Resource | Included (Pro) | Overage Rate | Impact |
|----------|----------------|--------------|--------|
| **Database Storage** | 8 GB | $0.125/GB | Moderate (scales with data) |
| **File Storage** | 100 GB | $0.021/GB | Low-Moderate (media files) |
| **Bandwidth** | 250 GB | $0.09/GB | Moderate (API/data transfer) |
| **MAUs** | 100,000 | $0.00325/MAU | High (scales with user count) |
| **Edge Functions** | 2M invocations | $2.00/M | Low-Moderate (serverless functions) |

*Compute add-ons available for additional database performance (scales up to 64 cores, 256 GB RAM)*

### RPC Provider Usage Costs

Infura and Alchemy are usage-metered managed RPC providers (used by Raid Guild today). For plan details and example cost modeling, see the [RPC Provider Costs](#rpc-provider-costs) section above.

## Cost Optimization Strategies

### Vercel Optimization

1. **Deployment Architecture**: Shared deployments minimize costs vs per-client (better isolation but higher cost)
2. **Caching**: Reduce edge requests, data transfer, and function invocations
3. **Function Optimization**: Minimize execution time, optimize memory allocation, reduce I/O wait time
4. **Static Generation**: Use SSG where possible to reduce compute costs
5. **Monitoring**: Track usage with Vercel Analytics to identify optimization opportunities
6. **Enterprise Tier**: Volume discounts available for multiple deployments

### Supabase Optimization

1. **Subscription Model**: Shared subscription minimizes costs vs per-client (one subscription for all clients)
2. **Database Optimization**: Index queries, optimize schemas, archive old data to reduce storage
3. **File Storage**: Use CDN for static assets, compress images, implement lazy loading
4. **Bandwidth**: Cache API responses, minimize data transfer, use efficient serialization
5. **MAU Management**: Implement proper session management, clean up inactive users
6. **Monitoring**: Track usage in Supabase dashboard to identify optimization opportunities
7. **Enterprise Tier**: Volume discounts available for multiple subscriptions

### RPC Optimization

1. **Cache aggressively**: Cache common reads (block numbers, token metadata, config) and avoid refetching unchanged chain data
2. **Reduce expensive calls**: Minimize `eth_getLogs`/trace-style queries; prefer indexed event ingestion and targeted queries
3. **Batch and debounce**: Batch JSON-RPC; debounce UI polling; prefer subscriptions/webhooks over tight polling loops
4. **Instrument usage**: Track RPC method mix (credits/CUs) so you can optimize the highest-cost endpoints first
5. **Plan for limits**: Add retries/backoff and consider a secondary provider for resilience during rate limiting/outages

## Recommendations

### Vercel Recommendations

1. **Start with Pro Tier**: $20/month base is reasonable; scales with usage
2. **Model & Scaling**: Per-client deployments scale costs linearly; shared deployments keep costs more predictable
3. **Monitor Usage**: Set spending alerts (default $200 limit) to avoid surprises
4. **Budget Planning**:
   - **Shared**: Low ($20-50), Moderate ($100-300), High ($500-2,000) per month
   - **Per-Client**: Multiply by client count (and include docs deployments)
5. **Enterprise Consideration**: Evaluate for higher deployment counts or stricter support/SLA requirements

### Supabase Recommendations

1. **Start with Pro Tier**: $25/month base per subscription; scales with usage
2. **Model & Scaling**: Prefer shared subscription unless isolation is required; per-client subscriptions scale costs linearly
3. **Monitor Usage**: Track database storage, bandwidth, and MAUs in Supabase dashboard
4. **Budget Planning**:
   - **Shared Subscription**: Low ($25-50), Moderate ($200-500), High ($1,000-2,000) per month
   - **Per-Client Subscriptions**: Multiply by client count (moderate usage: ~$200-500 per client/month)
5. **Enterprise Consideration**: Evaluate Team tier ($599/month) for compliance needs or Enterprise for 5+ subscriptions

### RPC Provider Recommendations

1. **Start with a single provider**: Use the current Raid Guild provider (Infura or Alchemy) and validate usage patterns early
2. **Model & Scaling**: Use separate provider apps/keys per client if you need per-client quotas, reporting, or blast-radius reduction
3. **Monitor Usage**: Track credit/CU burn and rate limiting; set alerts before you hit quota/throughput limits
4. **Budget Planning**: Treat RPC as usage-metered; plan thresholds for when to upgrade plans or add capacity based on real usage
5. **Resilience**: Consider a secondary provider/failover strategy if RPC availability is critical for uptime

### Combined Recommendations

1. **Include All Costs**: Factor in Vercel + Supabase + RPC provider costs when pricing
2. **Include Management Costs**: Initial setup ($500-$2,000) + ongoing ($150-$1,000/month) - factor into pricing
3. **Total Budget Planning** (Vercel + Supabase, shared architecture; add RPC costs separately based on usage):
   - **Low**: $45-100/month (Vercel $20-50 + Supabase $25-50)
   - **Moderate**: $300-800/month (Vercel $100-300 + Supabase $200-500)
   - **High**: $1,500-4,000/month (Vercel $500-2,000 + Supabase $1,000-2,000)
4. **Per-Client Architecture**: Multiply Vercel costs by deployment count + Supabase costs by subscription count

## References

**Vercel**
- [Vercel Pricing Page](https://vercel.com/pricing)
- [Vercel Functions Usage and Pricing](https://vercel.com/docs/functions/usage-and-pricing)
- [Vercel Bandwidth Pricing](https://vercel.com/docs/platform/limits#bandwidth)

**Supabase**
- [Supabase Pricing Page](https://supabase.com/pricing)
- [Supabase Documentation](https://supabase.com/docs)

**RPC Providers**
- [Infura Pricing](https://www.infura.io/pricing)
- [Infura Credit Costs (per RPC method)](https://docs.metamask.io/services/get-started/pricing/credit-cost/)
- [Alchemy Pricing](https://www.alchemy.com/pricing)
- [Alchemy Pricing Plans (docs)](https://docs.alchemy.com/reference/pricing-plans)
- [Alchemy Compute Unit Costs (per RPC method)](https://docs.alchemy.com/reference/compute-unit-costs)
