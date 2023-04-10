# Introduction

<p align="center">
    <img src="./public/logo-text-padding.png" alt="GreptimeDB Logo" width="400px">
</p>

GreptimeDB is an open-source time-series database with a special focus on improving
scalability, analytical capabilities, and efficiency. It's designed to work on
the infrastructure of the cloud era, and users can benefit from its elasticity and commodity
storage.

Our core developers have been building time-series data platform for
years, and based on their best practices, GreptimeDB was created to offer the following features:

- [A standalone binary](https://github.com/GreptimeTeam/greptimedb/releases)
  that can scale to a highly available distributed cluster, providing a transparent
  experience for cluster users.
- Optimized columnar layout for handling time-series data; compacted,
  compressed, stored on various storage backends.
- Flexible index options that address high cardinality issues.
- Distributed, parallel query execution, leveraging elastic computing resource.
- Native SQL, and Python scripting for advanced analytical scenarios.
- Widely adopted database protocols and APIs.
- An extensible table engine architecture for extensive workloads.

Before getting started, please read the following documents that include instructions for setting up, fundamental concepts, architectural designs, and tutorials:

- [Getting Started][1]: Provides an introduction to GreptimeDB for those who are new to it, including installation and database operations.
- [Guides][2]: For application developers to use GreptimeDB or build custom integration.
- [Community developer][3]: For developers interested in learning more about the technical details and enhancing GreptimeDB as a contributor.
- [Changelog][4]: Presents the latest GreptimeDB roadmap and biweekly reports.
- [FAQ][5]: Presents the most frequently asked questions.

[1]: ./getting-started/overview.md
[2]: ./user-guide/overview.md
[3]: ./developer-guide/overview.md
[4]: ./changelog/overview.md
[5]: ./faq-and-others/faq.md
