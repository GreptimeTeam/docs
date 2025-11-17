---
keywords: [observability database, open source observability database, observability data, observability tools, cloud native database, data observability, observability platform, edge database, IoT edge computing, edge cloud computing, log management, log aggregation, high cardinality, sql query examples, opentelemetry collector, GreptimeDB]
description: Introduction to GreptimeDB, an open-source unified observability database for metrics, logs, and events, with links to getting started, user guide, contributor guide, and more.
---
# Introduction

<p align="center">
    <img src="/logo-greptimedb.png" alt="GreptimeDB Logo" width="400"/>
</p>

**GreptimeDB** is an open-source, cloud-native, unified observability database for metrics, logs and traces. You can gain real-time insights from edge to cloud—at any scale.

Our core developers have been building observability data platforms for years. Based on their best-practices, GreptimeDB is born to give you:

- **All-in-One Observability Database**: Process metrics, logs, and traces in real-time through a unified database with native [SQL](/user-guide/query-data/sql.md), [PromQL](/user-guide/query-data/promql.md), and [streaming processing](/user-guide/flow-computation/overview.md) support. It replaces complex legacy data stacks with a high-performance single solution.
- **High-Performance Engine**: Built with Rust for high performance and reliability. Rich [indexing options](/user-guide/manage-data/data-index.md) (inverted, full-text, skip list, and vector indexing) accelerate queries, enabling sub-second responses on petabyte-scale datasets and handling hundreds of thousands of concurrent requests.
- **Significant Cost Reduction**: Achieve up to 50x lower operational and storage costs through a compute-storage separation [architecture](/user-guide/concepts/architecture.md). Scale flexibly across cloud storage systems (e.g., S3, Azure Blob Storage) for simplified management, dramatic cost efficiency, and no vendor lock-in.
- **Infinity Scalability**: Purpose-built for [Kubernetes](/user-guide/deployments-administration/deploy-on-kubernetes/greptimedb-operator-management.md) and cloud environments with industry-leading compute-storage separation. Enables unlimited scaling across cloud environments while efficiently managing cardinality explosion at a massive scale.
- **Developer-Friendly**: Features standardized SQL and PromQL interfaces, a built-in web dashboard, REST API, and support for MySQL/PostgreSQL protocols. Widely compatible with popular data [ingestion protocols](/user-guide/protocols/overview.md) for seamless migration and integration.
- **Flexible Deployment Options**: Deploy anywhere, from ARM-based edge devices to cloud environments, with unified APIs and bandwidth-efficient data synchronization. Query edge and cloud data seamlessly using identical APIs.

Before getting started, please read the following documents that include instructions for setting up, fundamental concepts, architectural designs, and tutorials:

- [Getting Started][1]: Provides an introduction to GreptimeDB for those who are new to it, including installation and database operations.
- [User Guide][2]: For application developers to use GreptimeDB or build custom integration.
- [GreptimeCloud][6]: For users of GreptimeCloud to get started.
- [Contributor Guide][3]: For contributors interested in learning more about the technical details and enhancing GreptimeDB.
- [Roadmap][7]: The latest GreptimeDB roadmap.
- [Release Notes][4]: Presents all historical version release notes.
- [FAQ][5]: Provides answers to the most frequently asked questions.

[1]: ./getting-started/overview.md
[2]: ./user-guide/overview.md
[3]: ./contributor-guide/overview.md
[4]: /release-notes
[5]: ./faq-and-others/faq.md
[6]: ./greptimecloud/overview.md
[7]: https://greptime.com/blogs/2025-02-06-greptimedb-roadmap2025
