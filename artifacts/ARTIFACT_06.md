# Facilitator Deployment Strategy

- **Author(s)**: Ryan (@ryanchristo)
- **Editor(s)**: NA
- **Date (created)**: 2026-01-28
- **Date (updated)**: NA
- **Sprint**: Cohort 11

## Short Description

This document investigates whether deploying separate facilitator instances per network is necessary and sustainable by evaluating deployment options and analyzing performance and security implications.

## Table of Contents

- [Executive Summary](#executive-summary)
- [Problem Context](#problem-context)
- [Deployment Options](#deployment-options)
- [Performance Considerations](#performance-considerations)
- [Security Considerations](#security-considerations)
- [Operational Considerations](#operational-considerations)
- [Cost Considerations](#cost-considerations)
- [Use Case Scenarios](#use-case-scenarios)
- [Pros and Cons Analysis](#pros-and-cons-analysis)
- [Recommendations](#recommendations)
- [References](#references)

## Executive Summary

The facilitator can support multiple networks with a single deployment instance. This document evaluates whether this multi-network approach is viable for both Raid Guild's internal facilitator and white-label client deployments.

**Key Findings:**

1. **Single deployment supporting multiple networks is feasible** but introduces performance and security tradeoffs
2. **Performance concerns** arise from increased request volume and potential bottlenecks when handling multiple networks
3. **Security concerns** center on the current implementation limitation: one private key serves all configured networks, creating a single point of failure (which can be mitigated by best practices: minimal funds in dedicated accounts, as-needed funding)
4. **Operational complexity** increases with multi-network deployments but remains manageable with proper monitoring
5. **Cost efficiency** favors single deployments for low-to-moderate traffic scenarios

**Primary Recommendations:**

- **Short-term**: Support multiple networks per deployment with current single private key architecture, but implement robust monitoring and rate limiting; follow best practices (minimal funds in dedicated accounts, as-needed funding)
- **Medium-term**: Evaluate need for multiple private keys per network based on compliance requirements; consider operational complexity tradeoff (more keys = more accounts to manage = more operational overhead)
- **Deployment strategy**: Use single deployments for internal/Raid Guild facilitator; evaluate per-client deployments for white-label services based on isolation requirements and traffic patterns

## Problem Context

### Current Architecture

The facilitator service can be configured to support multiple EVM networks (e.g. Base, Arbitrum, Optimism, Polygon) within a single deployment instance. This capability enables:

- **Raid Guild internal facilitator**: Supporting one or more networks for general use
- **White-label facilitator services**: Clients may request dedicated facilitator instances that support one or more networks

### Current Implementation Limitation

The current facilitator implementation supports **only one private key for all configured networks** within a given deployment.

- A single private key generates accounts across all supported networks
- All networks share the same key material and security boundary
- Compromise of the private key affects all networks simultaneously

### Key Questions

1. Is a single deployment supporting multiple networks sustainable from a performance perspective?
2. What are the security implications of sharing a single private key across networks?
3. When should separate facilitator instances be deployed per network vs. per client?
4. What operational concerns arise from multi-network deployments?

## Deployment Options

### Option 1: Single Deployment, Multiple Networks

**Description**: One facilitator instance handles requests for multiple networks (e.g. Base, Arbitrum, Optimism).

**Characteristics**:
- Single codebase deployment
- Shared infrastructure (compute, database, monitoring)
- Single private key for all networks (current limitation)
- Shared request handling and processing queues

**Use Cases**:
- Raid Guild internal facilitator
- White-label clients with moderate traffic across multiple networks
- Cost-optimized deployments

### Option 2: Per-Network Deployments

**Description**: Separate facilitator instance deployed for each network (e.g. one for Base, one for Arbitrum).

**Characteristics**:
- Multiple deployments (one per network)
- Isolated infrastructure per network
- Separate private keys per network (improved security isolation)
- Independent scaling and resource allocation

**Use Cases**:
- High-traffic scenarios requiring network-specific optimization
- Clients requiring strict network isolation
- Regulatory or compliance requirements for network separation

### Option 3: Per-Client Deployments

**Description**: Each white-label client receives their own facilitator instance(s), which may support one or more networks.

**Characteristics**:
- Client-specific deployments
- Custom branding and configuration
- Isolated infrastructure and data
- Client-specific private keys

**Use Cases**:
- White-label facilitator services
- Enterprise clients requiring data isolation
- Clients with specific compliance or security requirements

### Option 4: Hybrid Approach

**Description**: Combination of the above approaches based on client needs and traffic patterns.

**Characteristics**:
- Raid Guild internal: Single deployment, multiple networks
- White-label clients: Per-client deployments, each supporting one or more networks
- High-traffic networks: Separate instances for specific networks

**Use Cases**:
- Scalable, flexible deployment strategy
- Optimized for cost and performance
- Accommodates diverse client requirements

## Performance Considerations

### Request Volume and Throughput

**Single Deployment, Multiple Networks**:
- **Pros**:
  - Shared request handling infrastructure reduces overhead
  - Single point of monitoring and observability
  - Efficient resource utilization for low-to-moderate traffic
  
- **Cons**:
  - Increased request volume on single instance
  - Potential bottlenecks when multiple networks experience simultaneous traffic spikes
  - Shared rate limiting may impact one network if another experiences abuse
  - Single point of failure affects all networks

**Per-Network Deployments**:
- **Pros**:
  - Network-specific optimization and scaling
  - Isolated rate limiting prevents cross-network impact
  - Independent performance tuning per network
  
- **Cons**:
  - Higher infrastructure overhead (multiple deployments)
  - More complex monitoring and management
  - Resource underutilization if traffic is unevenly distributed

### Processing Latency

**Concerns**:
- **Network-specific RPC calls**: Each network requires separate RPC endpoints; concurrent requests may compete
- **Transaction submission**: Multiple networks submitting transactions simultaneously may create contention
- **Verification overhead**: Cryptographic verification scales linearly with request volume regardless of network count

**Mitigation Strategies**:
- Implement connection pooling and request queuing per network
- Use async processing for settlement transactions
- Cache network-specific configuration and contract addresses
- Monitor per-network latency and throughput metrics

### Scalability Limits

**Single Deployment Capacity**:
- Limited by compute resources (CPU, memory, connection limits)
- Rate limiting must account for combined traffic across all networks
- Database connections and query performance scale with total request volume

**Scaling Considerations**:
- **Horizontal scaling**: Single deployment can scale horizontally, but all networks scale together
- **Vertical scaling**: May be more cost-effective than per-network deployments for moderate traffic
- **Network-specific scaling**: Per-network deployments allow independent scaling based on actual usage

### Monitoring and Observability

**Single Deployment**:
- Unified metrics and logs simplify monitoring
- Easier to correlate issues across networks
- Single dashboard for all network health

**Per-Network Deployments**:
- Network-specific metrics enable targeted optimization
- Isolated alerting prevents false positives from other networks
- More complex to maintain comprehensive view across all networks

## Security Considerations

### Private Key Management

**Current Limitation: Single Private Key for All Networks**

The current implementation uses one private key for accounts across all configured networks.

**Risks**:
1. **Single Point of Failure**: Compromise of the private key affects all networks simultaneously
2. **Blast Radius**: Security incident on one network potentially impacts all networks
3. **Key Rotation Complexity**: Rotating the key requires coordination across all networks
4. **Compliance Challenges**: Some clients may require network-specific key management for regulatory reasons

**Risk Mitigation Through Best Practices**:
Following security best practices significantly reduces the risk impact:
- **Minimal Funds**: Use dedicated facilitator accounts that hold only the minimum funds needed for gas fees
- **As-Needed Funding**: Top up funds for gas fees on an as-needed basis rather than maintaining large balances
- **Dedicated Accounts**: Accounts are used exclusively for facilitator operations and do not hold significant value

**Impact Assessment**:
- **Low-to-Moderate Risk**: For internal/Raid Guild facilitator with proper key management practices and minimal fund balances
- **Higher Risk**: For white-label clients requiring strict isolation or compliance with network-specific security policies

**Consideration: Multiple Private Keys Per Network**

Supporting multiple private keys (one per network) would provide:

**Benefits**:
- **Isolation**: Compromise of one network's key does not affect others
- **Independent Key Rotation**: Each network can rotate keys independently
- **Compliance**: Meets requirements for network-specific key management
- **Operational Flexibility**: Different key management strategies per network

**Tradeoffs**:
- **Added Complexity**: Multiple private keys mean more accounts to manage, monitor, and fund
- **Operational Overhead**: Each network requires separate account balance monitoring and funding workflows
- **Cost**: Additional operational complexity may outweigh security benefits when following best practices

**Implementation Considerations**:
- Key storage and retrieval per network
- Configuration management for network-to-key mapping
- Migration path from current single-key architecture
- Account management complexity increases with number of networks

### Account Management and Funding

**Current Behavior**:
- Single private key generates accounts on each network
- Each network account requires separate funding for gas
- Wallet balance monitoring must track balances across all networks

**Concerns**:
- **Funding Complexity**: Must maintain adequate gas balances on each network
- **Balance Monitoring**: Need to track balances across multiple networks
- **Rebalancing**: May need to bridge funds between networks if balances become imbalanced
- **Account Exposure**: More accounts holding funds increases attack surface (mitigated by minimal fund balances)

**Best Practices**:
- **Minimal Balances**: Maintain only the minimum funds needed for gas fees in dedicated facilitator accounts
- **As-Needed Funding**: Top up funds on an as-needed basis rather than maintaining large balances
- **Automated Monitoring**: Automated balance monitoring and alerting per network
- **Automated Funding**: Automated funding workflows with appropriate approval gates
- **Network-Specific Policies**: Network-specific funding thresholds and policies
- **Regular Audits**: Regular audits of account balances and funding patterns

**Multiple Private Keys Impact**:
- Each additional private key adds another account to monitor and fund per network
- Operational complexity increases linearly with the number of networks and keys
- The security benefit of isolation must be weighed against the operational overhead

### Access Control and API Keys

**Single Deployment**:
- API keys grant access to all configured networks
- Cannot restrict API keys to specific networks (current limitation)
- Client may have access to networks they don't need

**Per-Client Deployments**:
- Client-specific API keys with network restrictions
- Better isolation between clients
- Custom access control policies per client

**Recommendation**:
- Implement network-specific API key scoping to allow clients to restrict access to specific networks
- Enable per-client network configuration in white-label deployments

### Compliance and Regulatory Considerations

**Network-Specific Requirements**:
- Some networks may have specific compliance or regulatory requirements
- Clients may require network isolation for audit or compliance purposes
- Data residency requirements may necessitate network-specific deployments

**Single Deployment Challenges**:
- Shared infrastructure may not meet network-specific compliance requirements
- Logging and audit trails must clearly separate network-specific data
- Regulatory reporting may require network-specific isolation

## Operational Considerations

### Deployment and Configuration Management

**Single Deployment**:
- **Simpler**: One deployment to manage, update, and monitor
- **Configuration**: Single configuration file/environment variables for all networks
- **Updates**: Single deployment update affects all networks simultaneously
- **Rollback**: Rollback affects all networks

**Per-Network Deployments**:
- **Complex**: Multiple deployments to manage and coordinate
- **Configuration**: Network-specific configuration per deployment
- **Updates**: Can update networks independently
- **Rollback**: Network-specific rollback capability

### Monitoring and Alerting

**Single Deployment**:
- Unified monitoring dashboard
- Single set of alerts for all networks
- Easier to correlate issues across networks
- Risk of alert fatigue if one network has issues

**Per-Network Deployments**:
- Network-specific monitoring and alerts
- Isolated alerting prevents cross-network noise
- More complex to maintain comprehensive view
- Requires coordination for cross-network issues

### Incident Response

**Single Deployment**:
- Single point of failure affects all networks
- Incident response must consider impact across all networks
- Easier to coordinate response (single team/deployment)
- May require network-specific mitigation strategies

**Per-Network Deployments**:
- Isolated incidents per network
- Network-specific incident response
- More complex coordination if multiple networks affected
- Independent recovery per network

### Maintenance and Updates

**Single Deployment**:
- Single codebase to maintain
- Updates deployed once affect all networks
- Testing must cover all network combinations
- Risk of regressions affecting all networks

**Per-Network Deployments**:
- Multiple codebases or deployment configurations
- Independent update cycles per network
- Network-specific testing and validation
- Isolated regression impact

### Network-Specific Considerations

**Different Network Characteristics**:
- Gas prices vary significantly between networks
- Finality times differ (e.g. Base ~2 seconds, Polygon ~2 seconds, Arbitrum ~1-2 seconds)
- RPC provider reliability and rate limits vary
- Network upgrades and forks occur independently

**Operational Impact**:
- Must handle network-specific error conditions
- Different retry strategies may be needed per network
- Network-specific monitoring thresholds
- Varying support requirements per network

## Cost Considerations

*Note: Detailed pricing analysis is covered in [ARTIFACT_05](./ARTIFACT_05.md). This section focuses on cost implications of deployment choices.*

### Infrastructure Costs

**Single Deployment, Multiple Networks**:
- **Lower base costs**: Single Vercel deployment, single Supabase subscription (if shared)
- **Shared resources**: Compute, database, and monitoring costs shared across networks
- **Scaling costs**: Scale once for combined traffic; may be more cost-effective for moderate traffic

**Per-Network Deployments**:
- **Higher base costs**: Multiple Vercel deployments, potentially multiple Supabase subscriptions
- **Independent scaling**: Each network scales independently; may be more cost-effective for high-traffic, single-network scenarios
- **Resource efficiency**: Better resource utilization if traffic is highly concentrated on specific networks

**Per-Client Deployments**:
- **Highest costs**: Multiple deployments (one per client), potentially per-client infrastructure
- **Isolation premium**: Cost of isolation and customization
- **White-label pricing**: Costs can be passed to clients in pricing model

### Operational Costs

**Single Deployment**:
- Lower operational overhead (one deployment to manage)
- Simplified monitoring and maintenance
- Single incident response process

**Per-Network/Per-Client Deployments**:
- Higher operational overhead (multiple deployments)
- More complex monitoring and coordination
- Multiple incident response processes

### Cost Optimization Strategies

1. **Start with single deployment**: Lower initial costs, validate traffic patterns
2. **Scale to per-network**: When network-specific optimization becomes cost-effective
3. **Use per-client deployments**: For white-label services where isolation justifies cost
4. **Monitor and optimize**: Track costs per network/client and optimize deployment strategy

## Use Case Scenarios

### Scenario 1: Raid Guild Internal Facilitator

**Requirements**:
- Support multiple networks (Base, Arbitrum, Optimism)
- Moderate traffic expected
- Cost optimization important
- Shared infrastructure acceptable

**Recommended Approach**: **Single Deployment, Multiple Networks**

**Rationale**:
- Cost-effective for moderate traffic
- Simplified operations and monitoring
- Acceptable security risk with proper key management
- Can scale to per-network if traffic patterns change

### Scenario 2: White-Label Client - Moderate Traffic, Multiple Networks

**Requirements**:
- Client needs facilitator for Base and Arbitrum
- Moderate traffic expected (~10K requests/month)
- Custom branding required
- Data isolation preferred

**Recommended Approach**: **Per-Client Deployment, Multiple Networks**

**Rationale**:
- Provides client isolation and customization
- Single deployment cost-effective for moderate traffic
- Can support multiple networks with current architecture
- Upgrade to per-network keys when available

### Scenario 3: White-Label Client - High Traffic, Single Network

**Requirements**:
- Client needs facilitator for Base only
- High traffic expected (~100K+ requests/month)
- Network-specific optimization desired
- Compliance requirements for isolation

**Recommended Approach**: **Per-Client, Per-Network Deployment**

**Rationale**:
- Network-specific optimization justifies separate deployment
- Compliance requirements met with isolation
- Independent scaling for high traffic
- Simplified configuration (single network)

### Scenario 4: Enterprise Client - Strict Compliance Requirements

**Requirements**:
- Multiple networks required
- Strict compliance and audit requirements
- Network-specific key management required
- Data residency requirements

**Recommended Approach**: **Per-Client Deployment with Enhanced Key Management**

**Rationale**:
- Client isolation meets compliance requirements
- Multiple private keys per network (when implemented) meet key management requirements
- Can support multiple networks in single deployment if traffic allows
- May require per-network deployments if compliance mandates isolation

## Pros and Cons Analysis

### Single Deployment, Multiple Networks

**Pros**:
- ✅ Lower infrastructure costs (single deployment)
- ✅ Simplified operations and monitoring
- ✅ Unified metrics and observability
- ✅ Easier to maintain and update
- ✅ Efficient resource utilization for moderate traffic
- ✅ Single point of configuration management

**Cons**:
- ❌ Single point of failure affects all networks
- ❌ Shared rate limiting may impact networks unfairly
- ❌ Current single private key limitation creates security risk (mitigated by best practices: minimal funds, dedicated accounts)
- ❌ Cannot optimize per-network independently
- ❌ Scaling affects all networks simultaneously
- ❌ More complex to handle network-specific requirements

### Per-Network Deployments

**Pros**:
- ✅ Network-specific optimization and scaling
- ✅ Isolated failures (one network doesn't affect others)
- ✅ Independent rate limiting and performance tuning
- ✅ Separate private keys per network (improved security isolation, but adds account management complexity)
- ✅ Network-specific configuration and monitoring
- ✅ Independent update and rollback cycles

**Cons**:
- ❌ Higher infrastructure costs (multiple deployments)
- ❌ More complex operations and monitoring
- ❌ Higher operational overhead
- ❌ Multiple private keys add account management complexity (more accounts to monitor and fund)
- ❌ Resource underutilization if traffic is uneven
- ❌ More complex to maintain comprehensive view

### Per-Client Deployments

**Pros**:
- ✅ Complete client isolation
- ✅ Custom branding and configuration
- ✅ Client-specific security policies
- ✅ Isolated incidents and failures
- ✅ Compliance and audit requirements met
- ✅ Independent scaling per client

**Cons**:
- ❌ Highest infrastructure costs
- ❌ Highest operational overhead
- ❌ More complex client management
- ❌ Resource duplication across clients
- ❌ More deployments to monitor and maintain

## Recommendations

### Short-Term Recommendations (Current Implementation)

1. **Support Multiple Networks Per Deployment**
   - Continue supporting multiple networks in single deployments
   - Implement robust monitoring and alerting per network
   - Add network-specific metrics and dashboards
   - Document network-specific configuration and limits

2. **Enhance Monitoring and Observability**
   - Track request volume, latency, and error rates per network
   - Implement network-specific alerting thresholds
   - Monitor wallet balances per network
   - Track RPC usage and rate limits per network

3. **Implement Network-Specific Rate Limiting**
   - Allow independent rate limits per network
   - Prevent one network's traffic from impacting others
   - Provide network-specific rate limit configuration

4. **Improve Key Management Practices**
   - Implement secure key storage and rotation procedures
   - Follow best practices: use dedicated accounts with minimal funds, top up as needed
   - Document key management policies and procedures
   - Regular security audits of key management
   - Evaluate need for multiple keys per network based on compliance requirements and risk tolerance

### Medium-Term Recommendations (Enhanced Implementation)

1. **Evaluate and Support Multiple Private Keys Per Network (If Needed)**
   - Evaluate need based on compliance requirements, client needs, and risk assessment
   - If needed, enhance implementation to support network-specific private keys
   - Implement key-to-network mapping in configuration
   - Consider operational complexity tradeoff: more keys = more accounts to manage and fund
   - Provide migration tools from single-key to multi-key architecture
   - Update documentation and deployment guides

2. **Network-Specific API Key Scoping**
   - Allow API keys to be restricted to specific networks
   - Implement network-level access control
   - Enable clients to configure network access per API key

3. **Automated Balance Management**
   - Implement automated wallet balance monitoring per network
   - Automated alerts for low balances
   - Automated funding workflows (with manual approval)
   - Network-specific funding thresholds and policies

4. **Performance Optimization**
   - Implement connection pooling per network
   - Async processing for settlement transactions
   - Network-specific caching strategies
   - Performance testing and optimization per network

### Long-Term Recommendations (Strategic Decisions)

1. **Deployment Strategy Guidelines**
   - **Raid Guild Internal**: Single deployment, multiple networks (current approach)
   - **White-Label Clients**: Per-client deployments, evaluate per-network based on traffic and requirements
   - **High-Traffic Scenarios**: Consider per-network deployments when traffic justifies optimization

2. **Cost Optimization**
   - Monitor costs per network and per client
   - Optimize deployment strategy based on actual usage patterns
   - Consider hybrid approaches for cost efficiency
   - Factor deployment costs into white-label pricing

3. **Security Enhancements**
   - Evaluate and implement multiple private keys per network if compliance or client requirements demand it
   - Emphasize best practices: minimal funds in dedicated accounts, as-needed funding
   - Network-specific security policies and compliance
   - Regular security audits and penetration testing
   - Incident response procedures per deployment type

4. **Operational Excellence**
   - Standardize deployment and configuration management
   - Implement comprehensive monitoring and alerting
   - Document operational procedures and runbooks
   - Regular review and optimization of deployment strategy

### Implementation Priority

**High Priority**:
1. Network-specific monitoring and metrics
2. Network-specific rate limiting
3. Enhanced key management practices
4. Documentation of deployment options and tradeoffs

**Medium Priority**:
1. Evaluate and implement multiple private keys per network (if compliance/client requirements demand)
2. Network-specific API key scoping
3. Automated balance management with minimal fund best practices
4. Performance optimization per network

**Low Priority**:
1. Per-network deployment automation
2. Advanced cost optimization strategies
3. Network-specific compliance features

## References

- [x402-facilitator-go](https://github.com/raid-guild/x402-facilitator-go) - Facilitator Documentation
- [ARTIFACT_03](./ARTIFACT_03.md) - Cost Structure & Rate Limiting Analysis
- [ARTIFACT_04](./ARTIFACT_04.md) - White-Label Product Feasibility
- [ARTIFACT_05](./ARTIFACT_05.md) - Infrastructure Cost Analysis
