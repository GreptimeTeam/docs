---
keywords: [Datanode, region server, data storage, gRPC service, heartbeat task, region manager]
description: Overview of Datanode in GreptimeDB, its responsibilities, components, and interaction with other parts of the system.
---

# Datanode

## Introduction

A Datanode stores and processes Region data. A table can contain multiple Regions, but the Datanode does not own table-level routing. Frontend sends data requests by Region, while Metasrv controls Region placement and lifecycle.

This boundary lets the same Region server host different storage engines without exposing their implementation to Frontend or Metasrv.

![Frontend sends Region requests to the Datanode Region server, while Metasrv exchanges lifecycle instructions through the heartbeat task. The Region server uses the local query engine and dispatches requests to the Mito, Metric, or File Region engine.](/datanode-architecture.svg)

## Components

The main components are:

- The Region server tracks open Regions and dispatches reads, writes, and lifecycle requests to the engine registered for each Region.
- `Mito` is the primary time-series Region engine. `Metric` maps many logical metric Regions onto shared Mito Regions, and `File` exposes external files through the Region interface.
- The local query engine executes Region query plans. It does not parse client SQL or perform cluster-wide planning.
- The heartbeat task reports node and Region state to Metasrv and receives instructions such as open, close, upgrade, downgrade, and migration steps.
- gRPC carries Region requests to the Datanode. HTTP exposes node diagnostics such as metrics and configuration.

## Region Request Lifecycle

For a Mito write, the Region server selects Mito from the Region metadata. Mito appends the mutation to the WAL, applies it to a memtable, and later flushes the memtable to SST files. A Metric write is first rewritten with the logical-table identity and then delegated to its physical Mito Region.

For a read, the local query engine executes the Region plan against a table provider backed by the Region engine. A Mito scan takes an immutable Region version, reads the relevant memtables and SST files, merges and deduplicates rows, and returns a stream of Arrow record batches.

Region ownership can change without restarting the Datanode. Metasrv sends lifecycle instructions over the heartbeat stream; the Region server applies them to the engine and reports the new Region role and statistics in subsequent heartbeats.
