---
keywords: [architecture, Metasrv, Frontend, Datanodes, database cluster]
description: Outlines the architecture of GreptimeDB, including its main components Metasrv, Frontend, and Datanodes. It explains how these components work together to form a robust database cluster and provides links to detailed documentation for each component.
---

# Architecture

![architecture](/architecture-3.png)

## Components

In order to form a robust database cluster and keep complexity at an acceptable
level, there are three main components in GreptimeDB architecture: Datanode,
Frontend and Metasrv.

- [**Metasrv**](/contributor-guide/metasrv/overview.md) is the central command of
  GreptimeDB cluster. In a typical cluster deployment, at least three nodes is required to
  setup a reliable Metasrv mini-cluster. Metasrv manages database and table
  information, including how data spread across the cluster and where to route
  requests to. It also keeps monitoring availability and performance of Datanodes,
  to ensure its routing table is valid and up-to-date.
- [**Frontend**](/contributor-guide/frontend/overview.md) is a stateless
  component that can scale to as many as needed. It accepts incoming requests,
  authenticates them, translates them from various protocols into GreptimeDB
  internal gRPC, and forwards to certain Datanodes under guidance from Metasrv by table sharding.
- [**Datanodes**](/contributor-guide/datanode/overview.md) hold Regions of
  tables in GreptimeDB cluster. It accepts read and write requests sent
  from Frontend, executes them against its data, and returns the handle results.

These three components will be combined in a single binary as GreptimeDB standalone mode, for local or embedded development.

You can refer to [architecture](/contributor-guide/overview.md) in contributor guide to learn more details about how components work together.

## How it works

![Interactions between components](/how-it-works.png)

- You can interact with the database via various protocols, such as ingesting data using
  InfluxDB line protocol, then exploring the data using SQL or PromQL. The Frontend is the
  component that clients connect to and operate, thus hide Datanode and Metasrv behind it.
- Assumes a user uses the HTTP API to insert data into the database, by sending a HTTP request to a
  Frontend instance. When the Frontend receives the request, it then parses the request body using
  corresponding protocol parser, and finds the table to write to from a catalog manager based on
  Metasrv.
- The Frontend relies on a push-pull strategy to cache metadata from Metasrv, thus it knows which
  Datanode, or more precisely, the Region a request should be sent to. A request may be split and
  sent to multiple Regions, if its contents need to be stored in different Regions.
- When Datanode receives the request, it writes the data to the Region, and then sends response
  back to the Frontend. Writing to the Region will then write to the underlying storage engine,
  which will eventually put the data to persistent device.
- Once Frontend has received all responses from the target Datanodes, it then sends the result
  back to the user.


