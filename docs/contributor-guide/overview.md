---
keywords: [contributor guide, architecture, frontend, datanode, metasrv, flownode]
description: Entry point for contributors who want to understand and develop GreptimeDB.
---

# Contributor Guide

This guide describes GreptimeDB's internal architecture and points contributors to the code that implements each subsystem. For build, test, and contribution requirements, start with the repository's [CONTRIBUTING.md](https://github.com/GreptimeTeam/greptimedb/blob/main/CONTRIBUTING.md).

## Architecture

The [architecture overview](/user-guide/concepts/architecture.md) explains the components and request paths from a user's perspective. The contributor guides below cover their implementation boundaries:

- [Frontend](./frontend/overview.md): protocol handling, request orchestration, routing, and distributed query planning.
- [Datanode](./datanode/overview.md): Region management, query execution, and storage engines.
- [Metasrv](./metasrv/overview.md): metadata, cluster coordination, and distributed procedures.
- [Flownode](./flownode/overview.md): continuous aggregation in standalone and distributed deployments.

To build GreptimeDB locally, continue with [Getting started](./getting-started.md).
