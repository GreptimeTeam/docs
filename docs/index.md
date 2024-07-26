# Introduction

<p align="center">
    <img src="/logo-greptimedb.png" alt="GreptimeDB Logo" width="400"/>
</p>

**GreptimeDB** is an open-source unified time-series database for **Metrics**, **Logs**, and **Events** (also **Traces** in plan). You can gain real-time insights from Edge to Cloud at any scale.

GreptimeDB is also on cloud as [GreptimeCloud](https://greptime.com/product/cloud),
a fully-managed time-series database service that features serverless scalability,
seamless integration with ecoystem and improved Prometheus compatibility.

Our core developers have been building time-series data platforms for years. Based on their best-practices, GreptimeDB is born to give you:

- Unified all kinds of time series; GreptimeDB treats all time series as contextual events with timestamp, and thus unifies the processing of metrics and logs. It supports analyzing metrics and logs with SQL and PromQL, and doing streaming with continuous aggregation.
- Optimized columnar layout for handling time-series data; compacted, compressed, and stored on various storage backends, particularly cloud object storage with 50x cost efficiency.
- Fully open-source distributed cluster architecture that harnesses the power of cloud-native elastic computing resources.
- Seamless scalability from a standalone binary at edge to a robust, highly available distributed cluster in cloud, with a transparent experience for both developers and administrators.
- Flexible indexing capabilities and distributed, parallel-processing query engine, tackling high cardinality issues down.
- Widely adopted database protocols and APIs, including MySQL, PostgreSQL, and Prometheus Remote Storage, etc.
- Schemaless writing that automatically creates tables for data.

Before getting started, please read the following documents that include instructions for setting up, fundamental concepts, architectural designs, and tutorials:

- [Getting Started][1]: Provides an introduction to GreptimeDB for those who are new to it, including installation and database operations.
- [User Guide][2]: For application developers to use GreptimeDB or build custom integration.
- [GreptimeCloud][6]: For users of GreptimeCloud to get started.
- [Contributor Guide][3]: For contributor interested in learning more about the technical details and enhancing GreptimeDB as a contributor.
- [Roadmap][7]: The latest GreptimeDB roadmap.
- [Release Notes][4]: Presents all the historical version release notes.
- [FAQ][5]: Presents the most frequently asked questions.

[1]: ./getting-started/overview.md
[2]: ./user-guide/overview.md
[3]: ./contributor-guide/overview.md
[4]: /all-releases
[5]: ./faq-and-others/faq.md
[6]: ./greptimecloud/overview.md
[7]: https://www.greptime.com/blogs/2024-02-29-greptimedb-2024-roadmap