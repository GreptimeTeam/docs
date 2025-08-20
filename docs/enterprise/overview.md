---
keywords: [enterprise, features, solutions, cloud, edge, IoT, observability, LDAP, audit logging]
description: Overview of GreptimeDB Enterprise, detailing its advanced features, solutions, and enhancements over the open-source version to optimize data efficiency and reduce costs.
---

# Enterprise

GreptimeDB Enterprise is a powerful time-series database solution designed to meet the specific needs of enterprises.
In addition to the features available in the open-source version of GreptimeDB,
the Enterprise edition offers enhancements that help businesses optimize data efficiency and significantly reduce costs, enabling smarter and faster decision-making with time-series data.

GreptimeDB Enterprise solutions include:

- **Bring Your Own Cloud (BYOC)**: Leverage your own cloud infrastructure to host GreptimeDB, offering extensive customization and flexibility tailored to your business needs. This service includes comprehensive management of your cloud resources and robust security measures to protect your infrastructure.
- **Fully Managed Dedicated Cloud**: GreptimeDB team offers a fully managed, dedicated cloud environment, ensuring peak performance, enhanced security, and exceptional reliability tailored to your enterprise needs.
- **[Edge-Cloud Integrated Solution](https://greptime.com/product/carcloud)**: A comprehensive solution for managing time-series data from edge devices to the cloud, enabling real-time analytics and insights across your entire infrastructure.
- Industry-specific solutions for the Internet of Things (IoT), observability, and more.

## Features

GreptimeDB Enterprise supports all features available in the open-source version,
which you can read about in the [User Guide](/user-guide/overview.md) documentation.
To understand the differences between the open-source and enterprise versions,
please visit our [Pricing Page](https://greptime.com/pricing) or [contact us](https://greptime.com/contactus).

GreptimeDB Enterprise includes the following advanced features,
which are described in detail in the documentation in this section:

- [Active-Active Failover Disaster Recovery Solution](./deployments-administration/disaster-recovery/overview.md): Ensure uninterrupted service and data protection with advanced disaster recovery solution.
- [LDAP Authentication](./deployments-administration/authentication.md): Secure your system with LDAP-based authentication for access management.
- [Audit Logging](./deployments-administration/monitoring/audit-logging.md): Track and monitor
  user activity with detailed audit logs.
- [Automatic region load balance](./autopilot/region-balancer.md): Auto balance
  datanodes workload by moving regions between them.
- Elasticsearch query compatibility: Use GreptimeDB backed Kibana for your logs.
- Greptime Enterprise Management UI: An enhanced version of our dashboard UI,
  carries more cluster management and monitoring features.
- [Read Replica](./read-replica.md): Read-only datanode instances for heavy query workloads such as
  analytical queries.
- [Triggers](./trigger.md): Periodically evaluate your rules and trigger external
  webhook. Compatible with Prometheus AlterManager.
- Reliability features for Flow.

## Release Notes

- [25.05](./release-notes/release-25_05.md)
- [24.11](./release-notes/release-24_11.md)
