---
keywords: [metasrv, metadata, routing, leader election, heartbeat, distributed procedures]
description: Overview of Metasrv's metadata, coordination, and cluster-management responsibilities.
---

# Metasrv

<AnchorAlias id="whats-in-metasrv" />

## Responsibilities

Metasrv is the metadata and coordination service for distributed deployments. It:

- persists Catalog, Schema, Table, Region, route, and node metadata through the KV backend;
- uses leader election so coordination and metadata-changing work runs on one leader;
- tracks node leases and Region statistics through heartbeat streams;
- selects Datanodes for Regions when tables are created;
- runs recoverable distributed procedures for DDL, Region migration, failover, repartitioning, and related maintenance work;
- publishes cache invalidations and other control messages to Frontend and Datanode.

The data models, KV abstraction, election interfaces, key encoding, and DDL manager are implemented in `src/common/meta/`. The `src/meta-srv/` crate provides the server, state machine, heartbeat handlers, and control procedures.

<AnchorAlias id="how-the-frontend-interacts-with-metasrv" />

## Frontend interaction

Frontend uses the `meta-client` crate to obtain table metadata and Region routes and to submit metadata-changing operations. It caches metadata locally; Metasrv sends invalidation messages when a procedure changes metadata.

### Create Table

1. Frontend submits the DDL request to the Metasrv leader.
2. The DDL manager validates the request, derives the Regions from the partition rules, and selects Datanodes for those Regions.
3. A persisted procedure creates the Regions and records the table and route metadata. Persisted procedure state makes the operation recoverable after a restart or leader change.
4. Metasrv invalidates affected caches after the metadata change is committed.

### Insert

Frontend resolves the table route, splits rows by partition, and sends Region write requests to the corresponding Datanodes. Route metadata is cached, but cache invalidation or a stale-route error causes Frontend to refresh it from Metasrv.

### Select

Frontend uses table and Region metadata while planning a query. Partition predicates prune Regions, and the distributed query engine sends remote subplans to the Datanodes that own the selected Regions. See [Distributed Querying](../frontend/distributed-querying.md).

<AnchorAlias id="metasrv-architecture" />

## Source layout

The main implementation areas are:

- `src/meta-srv/src/service/`: gRPC services and the HTTP Admin API.
- `src/meta-srv/src/handler/`: the heartbeat handler chain.
- `src/meta-srv/src/procedure/`: Region migration, repartition, WAL pruning, and other distributed procedures.
- `src/meta-srv/src/region/`: Region leases, supervision, and failover triggers.
- `src/meta-srv/src/selector/`: Datanode selection for Region placement.

<AnchorAlias id="distributed-consensus" />

## Leadership and persistence

Metasrv separates leader election and durable metadata storage behind interfaces in `common-meta`. Coordination and metadata-changing operations run on the leader; a non-leader returns a not-leader response so the client can reconnect to the current leader.

Anything required after a leader change must be stored in the KV backend. In-memory caches and leader-local state are rebuilt or cleared during a transition. Distributed procedures persist their state and must keep each step idempotent so execution can resume safely.

<AnchorAlias id="heartbeat-management" />

## Heartbeat invariants

Datanodes and Frontends maintain heartbeat streams to the Metasrv leader. Requests report node identity, leases, Region statistics, and other state. The handler chain under `src/meta-srv/src/handler/` checks leadership, updates leases and statistics, and handles mailbox messages.

Heartbeat responses carry control messages such as Region lifecycle instructions and cache invalidations. Region supervision uses lease state to detect unavailable Regions and trigger failover procedures. Changes to heartbeat intervals must remain consistent with lease and supervisor timing in `common-meta` and `meta-srv`.
