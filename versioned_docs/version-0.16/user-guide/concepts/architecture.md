---
keywords: [architecture, Metasrv, Frontend, Datanodes, database cluster]
description: Outlines the architecture of GreptimeDB, including its main components Metasrv, Frontend, and Datanodes. It explains how these components work together to form a robust database cluster and provides links to detailed documentation for each component.
---

# Architecture

![architecture](/architecture-3.png)

In order to form a robust database cluster and keep complexity at an acceptable
level, there are three main components in GreptimeDB architecture: Datanode,
Frontend and Metasrv.

- [**Metasrv**](/contributor-guide/metasrv/overview.md) is the central command of
  GreptimeDB cluster. In a typical cluster deployment, at least three nodes is required to
  setup a reliable _Metasrv_ mini-cluster. _Meta_ manages database and table
  information, including how data spread across the cluster and where to route
  requests to. It also keeps monitoring availability and performance of \_Datanode_s,
  to ensure its routing table is valid and up-to-date.
- [**Frontend**](/contributor-guide/frontend/overview.md) is a stateless
  component that can scale to as many as needed. It accepts incoming requests,
  authenticates them, translates them from various protocols into GreptimeDB
  internal gRPC, and forwards to certain \_Datanode_s under guidance from Metasrv by table sharding.
- [**Datanodes**](/contributor-guide/datanode/overview.md) hold regions of
  tables in Greptime DB cluster. It accepts read and write requests sent
  from _Frontend_, executes them against its data, and returns the handle results.

These three components will be combined in a single binary as GreptimeDB standalone mode, for local or embedded development.

You can refer to [architecture](/contributor-guide/overview.md) in contributor guide to learn more details about how components work together.
