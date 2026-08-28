---
keywords: [metasrv, metadata, routing, leader election, procedure, heartbeat]
description: Overview of the metadata and coordination mechanisms provided by Metasrv.
---

# Metasrv

## What's in Metasrv

Metasrv is the metadata and coordination service in a distributed GreptimeDB cluster. It does not sit on the data path. Its main responsibilities are:

- storing Catalog, Schema, Table, Region, route, and node metadata;
- choosing Datanodes for new Regions and maintaining table routes;
- electing one Metasrv leader to coordinate metadata changes;
- running recoverable procedures for DDL, Region migration, failover, and repartitioning;
- tracking node leases and Region statistics through heartbeats;
- notifying Frontends and Datanodes when cached metadata or Region state changes.

## How the Frontend interacts with Metasrv

Frontend obtains table metadata and Region routes from Metasrv and caches them locally. Metadata-changing statements are sent to the Metasrv leader, while reads and writes use the cached routes to reach Datanodes directly.

The control and data paths are separate:

```text
Frontend
  |-- metadata lookup and DDL ------------> Metasrv leader
  `-- Region reads and writes ------------> Datanode

Metasrv leader
  |-- Region lifecycle procedures --------> Datanode
  `-- cache and Region-state notifications -> Frontend / Datanode

Datanode
  `-- heartbeat, lease renewal, Region stats -> Metasrv leader
```

A table route maps each Region to its current Datanode peer. It does not contain a separate list of read replicas:

```text
Table route
  |-- Region 0 -> Datanode A
  |-- Region 1 -> Datanode B
  `-- Region 2 -> Datanode C
```

Region migration or failover changes this mapping. Frontend refreshes its cached route before sending subsequent reads or writes to the new peer.

### Create Table

1. Frontend submits the DDL request to the Metasrv leader.
2. Metasrv derives Regions from the partition rules and [selects a Datanode for each Region](/contributor-guide/metasrv/selector.md).
3. A persisted procedure creates the Regions and records the table and route metadata. If leadership changes, the procedure can resume from its persisted state.
4. Metasrv notifies Frontends after the metadata change is committed so their caches can be refreshed.

### Insert

Frontend resolves the table route, splits rows according to the partition rules, and sends each Region write to the corresponding Datanode. Route changes cause the cached metadata to be invalidated and fetched again from Metasrv.

### Select

Frontend uses table and Region metadata while planning the query. Predicates on partition columns prune Regions, and the distributed query engine sends work to the Datanodes that own the selected Regions. See [Distributed Querying](../frontend/distributed-querying.md).

## Metasrv Architecture

The main coordination paths are:

```text
Leader election
      |
      v
Metasrv leader
├─ DDL manager -> Procedure manager
├─ Selector -> new Region placement
├─ Heartbeat handler chain -> leases and Region statistics
├─ Region supervisor -> Region migration procedures
├─ Mailbox -> cache invalidations and Region instructions
└─ Metadata managers -> KV backend
```

These mechanisms share metadata, but they have different failure boundaries. A process restart may discard caches and leader-local state; metadata and procedure state required for recovery must be durable.

## Distributed Consensus

Metasrv separates leader election from metadata storage. Only the elected Metasrv leader performs coordination and metadata-changing operations. Other Metasrv nodes direct clients to the current leader.

The key-value backend stores table metadata, routes, procedure state, and other information that must survive a leader change. Metasrv does not use this election to create leader and follower replicas for Datanode Regions; Region availability is managed through leases, heartbeats, and failover procedures.

## Heartbeat Management

Datanodes maintain heartbeat streams to the Metasrv leader. Heartbeat requests report node identity, lease information, Region statistics, and other state used for placement and supervision. Responses carry control messages such as Region lifecycle instructions and cache invalidations.

Metasrv treats a heartbeat as a lease renewal, not merely as a metrics sample. Lease expiration is therefore part of failure detection and can lead to a Region failover procedure. Changes to heartbeat timing must remain consistent with the lease and supervision intervals.
