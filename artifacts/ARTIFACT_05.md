# Infrastructure Cost Analysis

- **Author(s)**: Ryan (@ryanchristo)
- **Editor(s)**: name (@username)
- **Date (created)**: 2026-01-14
- **Date (updated)**: YYYY-MM-DD
- **Sprint**: Cohort 11

## Short Description

Comprehensive cost analysis for hosting infrastructure including Vercel (facilitator dashboard, facilitator service, and documentation) and Supabase subscriptions (database, authentication, and storage services).

## Table of Contents

- [Executive Summary](#executive-summary)
- [Deployment Architecture Considerations](#deployment-architecture-considerations)
- [Vercel Platform Costs](#vercel-platform-costs)
  - [Hobby Tier](#hobby-tier)
  - [Pro Tier](#pro-tier)
  - [Enterprise Tier](#enterprise-tier)
- [Supabase Platform Costs](#supabase-platform-costs)
  - [Free Tier](#free-tier)
  - [Pro Tier](#pro-tier-1)
  - [Team Tier](#team-tier)
  - [Enterprise Tier](#enterprise-tier-1)
- [Project Management Costs](#project-management-costs)
- [Pay-As-You-Use Breakdown](#pay-as-you-use-breakdown)
- [Cost Optimization Strategies](#cost-optimization-strategies)
- [Recommendations](#recommendations)

## Executive Summary

This document provides a comprehensive cost analysis for hosting three projects on Vercel:

1. **Facilitator Dashboard** - The main dashboard interface
2. **Facilitator Service** - The backend service/API
3. **Documentation** - Shared documentation for all clients (not per-client)

Additionally, this document analyzes Supabase subscription costs, which may be required per-client or shared across clients.

The analysis covers three pricing tiers (Free, Pro, Enterprise) with example cost calculations. Final costs depend on deployment architecture (per-client vs shared). Documentation is always shared. This document also analyzes project management costs (initial setup and ongoing), addressing whether to extend Raid Guild's Infrastructure Maestro role or create a new dedicated role.

## Deployment Architecture Considerations

The cost structure will vary significantly based on the deployment model chosen. There are three projects to consider:

1. **Facilitator Dashboard** - per-client or shared
2. **Facilitator Service** - per-client or shared
3. **Documentation** - shared (single deployment for all clients)

Additionally, **Supabase Subscriptions** may be required:

- **Supabase** - per-client or shared (one subscription for all clients)

### Deployment Models:

1. **Per-Client Deployments**: Each client requires their own deployed dashboard and facilitator service
   - Highest cost scenario (multiple deployments)
   - Best isolation and customization per client
   - Documentation: 1 shared deployment
   - Supabase: per-client (one subscription per client) or shared (one subscription for all)

2. **Shared Dashboard, Per-Client Facilitator**: All clients share one dashboard, but each client has their own facilitator service deployment
   - Moderate cost scenario
   - Dashboard costs are shared, facilitator costs scale with client count
   - Documentation: 1 shared deployment
   - Supabase: per-client (one subscription per client) or shared (one subscription for all)

3. **Fully Shared**: All clients share both the same dashboard and facilitator service
   - Lowest cost scenario (single deployment of each)
   - Requires multi-tenancy architecture
   - Documentation: 1 shared deployment
   - Supabase: shared (one subscription for all clients)

**Note**: Examples assume single deployments. Multiply costs based on chosen architecture. Documentation is always shared. Supabase subscription model (shared vs per-client) is independent of Vercel deployment architecture.

## Vercel Platform Costs

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

**Example Costs** (single deployment of all 3 projects):

| Traffic Level | Data Transfer | Edge Requests | Functions | Compute | **Total/Month** |
|--------------|---------------|---------------|-----------|---------|-----------------|
| Low | 50 GB (included) | 500K (included) | 100K (included) | 200 GB-hr (included) | **$20** |
| Moderate | 1.5 TB (+$75) | 15M (+$10) | 2M (+$0.60) | 1,500 GB-hr (+$90) | **$195.60** |
| High | 5 TB (+$600) | 50M (+$80) | 10M (+$5.40) | 5,000 GB-hr (+$720) | **$1,425.40** |

*Note: Documentation usage is minimal (static content). Usage is combined across all three projects.*

**Multi-Deployment Scenarios** (10 clients, moderate traffic per deployment):

| Architecture | Projects | Monthly Cost |
|--------------|----------|--------------|
| **Per-Client** | 10 dashboards + 10 facilitators + 1 docs | **$4,931** (21 deployments, usage accumulates) |
| **Shared Dashboard** | 1 dashboard + 10 facilitators + 1 docs | **$1,776** (12 deployments) |
| **Fully Shared** | 1 dashboard + 1 facilitator + 1 docs | **$195.60** (3 deployments, usage shared) |

*Note: Base cost is $20/month (1 seat covers all projects). Documentation is always shared. Supabase costs are separate (see Supabase Platform Costs section).*

### Enterprise Tier

**Cost**: Custom pricing (contact Vercel sales), typically $500-$2,000+/month base

**Features**: All Pro features + custom limits, dedicated infrastructure, SSO, enhanced observability, SLAs, priority support

**Benefits**: Volume discounts, consolidated billing, better cost predictability

**Example Costs** (depending on traffic):
- Small (10-50 deployments): $500-$2,000/month
- Medium (50-200 deployments): $1,500-$5,000/month
- Large (200+ deployments): $3,000-$10,000+/month

## Supabase Platform Costs

Each client may require a Supabase subscription for database, authentication, and storage services. Similar to the facilitator dashboard, Supabase subscriptions can be:
- **Shared**: One subscription for all clients (multi-tenancy)
- **Per-Client**: One subscription per client (better isolation)

### Pricing Tiers

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
| Moderate | 20 GB (+$1.50) | 150 GB (+$1.05) | 500 GB (+$22.50) | 150K (+$162.50) | 3M (+$2.00) | **$212.05** |
| High | 50 GB (+$5.25) | 300 GB (+$4.20) | 1.5 TB (+$112.50) | 500K (+$1,300) | 10M (+$16.00) | **$1,462.95** |

**Multi-Subscription Scenarios** (10 clients, moderate usage per subscription):

| Architecture | Subscriptions | Monthly Cost |
|--------------|---------------|--------------|
| **Per-Client** | 10 Supabase subscriptions | **$2,120.50** (10 × $212.05) |
| **Shared** | 1 Supabase subscription | **$212.05** (usage accumulates across all clients) |

*Note: Shared subscription costs scale with combined usage across all clients. Per-client subscriptions provide better isolation but higher total cost.*

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

## Project Management Costs

*Separate from Vercel platform costs - these are Raid Guild internal personnel costs.*

### Initial Setup

**Activities**: Account/project setup, domain/SSL, CI/CD, environment variables, monitoring, documentation, initial deployment, Supabase project setup and configuration

**Time & Cost**:
- Simple (shared deployment): 10-12 hours → $500-$1,800 (includes Supabase setup)
- Complex (per-client with automation): 16-20 hours → $800-$3,000 (includes Supabase setup)
- *Based on $50-$150/hour member rates*

### Ongoing Management

**Current State**: Infrastructure Maestro role exists and may already handle infrastructure management

**Options**:
1. **Extend Infrastructure Maestro**: Add Vercel and Supabase management (3-5 hrs/mo) → $150-$750/month
2. **New Dedicated Role**: Separate Vercel/Supabase/platform management (5-10 hrs/mo) → $250-$1,500/month

**Management Activities**: Monitoring, env vars/secrets, deployments/rollbacks, config updates, usage optimization, coordination, documentation, Supabase database management, backup monitoring

**Factors Affecting Time**: Deployment architecture (shared vs per-client), number of clients, deployment frequency, incident rate

**Cost Summary**:
- Initial: $500-$3,000 (one-time, includes Supabase setup)
- Ongoing: $150-$1,500/month (includes Supabase management)
- First Year Total: $2,300-$21,000 (depending on option chosen)

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

*Compute includes Active CPU Time (varies by region, ~$0.128/hr) and Provisioned Memory (~$0.0106/GB-hour)*

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

## Recommendations

### Vercel Recommendations

1. **Start with Pro Tier**: $20/month base is reasonable; scales with usage
2. **Monitor Usage**: Set spending alerts (default $200 limit) to avoid surprises
3. **Architecture Impact**: Per-client deployments scale costs linearly; shared deployments keep costs constant. Documentation always shared.
4. **Enterprise Consideration**: Evaluate for 10+ deployments (volume discounts, consolidated billing, SLAs)
5. **Budget Planning**:
   - **Shared**: Low ($20-50), Moderate ($100-300), High ($500-2,000) per month
   - **Per-Client**: Multiply by client count (documentation remains shared)

### Supabase Recommendations

1. **Start with Pro Tier**: $25/month base per subscription; scales with usage
2. **Subscription Model**: Prefer shared subscription (one for all clients) unless isolation is required
3. **Monitor Usage**: Track database storage, bandwidth, and MAUs in Supabase dashboard
4. **Architecture Impact**: Per-client subscriptions scale costs linearly; shared subscription costs scale with combined usage
5. **Budget Planning**:
   - **Shared Subscription**: Low ($25-50), Moderate ($200-500), High ($1,000-2,000) per month
   - **Per-Client Subscriptions**: Multiply by client count (moderate usage: ~$200-500 per client/month)
6. **Enterprise Consideration**: Evaluate Team tier ($599/month) for compliance needs or Enterprise for 5+ subscriptions

### Combined Recommendations

1. **Include All Costs**: Factor in both Vercel and Supabase costs when pricing
2. **Include Management Costs**: Initial setup ($500-$3,000) + ongoing ($150-$1,500/month) - factor into pricing
3. **Total Budget Planning** (Vercel + Supabase, shared architecture):
   - **Low**: $45-100/month (Vercel $20-50 + Supabase $25-50)
   - **Moderate**: $300-800/month (Vercel $100-300 + Supabase $200-500)
   - **High**: $1,500-4,000/month (Vercel $500-2,000 + Supabase $1,000-2,000)
4. **Per-Client Architecture**: Multiply Vercel costs by deployment count + Supabase costs by subscription count

## References

### Vercel

- [Vercel Pricing Page](https://vercel.com/pricing)
- [Vercel Functions Usage and Pricing](https://vercel.com/docs/functions/usage-and-pricing)
- [Vercel Bandwidth Pricing](https://vercel.com/docs/platform/limits#bandwidth)

### Supabase

- [Supabase Pricing Page](https://supabase.com/pricing)
- [Supabase Documentation](https://supabase.com/docs)