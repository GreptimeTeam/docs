# Introduction

<p align="center">
    <img src="./public/logo-greptimedb.png" alt="GreptimeDB Logo" width="400px">
</p>

GreptimeDB is an open-source time-series database with a special focus on
scalability, analytical capabilities and efficiency. It's designed to work on
infrastructure of the cloud era, and users benefit from its elasticity and commodity
storage.

GreptimeDB is also on cloud as
[GreptimeCloud](https://greptime.com/product/cloud), a fully-managed time-series
database service that features serverless scalability, seamless integration with
ecoystem and improved Prometheus compatibility.

Our core developers have been building time-series data platform
for years. Based on their best-practices, GreptimeDB is born to give you:

- [A standalone binary](https://github.com/GreptimeTeam/greptimedb/releases) that scales to highly-available distributed cluster, providing a transparent experience for cluster users
- Optimized columnar layout for handling time-series data; compacted, compressed, and stored on various storage backends
- Flexible indexes, tackling high cardinality issues down
- Distributed, parallel query execution, leveraging elastic computing resource
- Native SQL, and Python scripting for advanced analytical scenarios
- Widely adopted database protocols and APIs, native PromQL supports
- Extensible table engine architecture for extensive workloads
- Schemaless writing that automatically creates tables for data

Before getting started, please read the following documents that include instructions for setting up, fundamental concepts, architectural designs, and tutorials:

- [Getting Started][1]: Provides an introduction to GreptimeDB for those who are new to it, including installation and database operations.
- [User Guide][2]: For application developers to use GreptimeDB or build custom integration.
- [GreptimeCloud][6]: For users of GreptimeCloud to get started.
- [Developer Guide][3]: For developers interested in learning more about the technical details and enhancing GreptimeDB as a contributor.
- [Changelog][4]: Presents the latest GreptimeDB roadmap and biweekly reports.
- [FAQ][5]: Presents the most frequently asked questions.

[1]: ./getting-started/overview.md
[2]: ./user-guide/overview.md
[3]: ./developer-guide/overview.md
[4]: ./changelog/overview.md
[5]: ./faq-and-others/faq.md
[6]: ./greptimecloud/overview.md
