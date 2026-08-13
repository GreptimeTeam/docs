---
keywords: [architecture, compute-storage separation, Metasrv, Frontend, Datanode, Flownode, object storage, WAL]
description: Overview of GreptimeDB standalone and distributed architecture, component responsibilities, and write, query, and Flow paths.
---

# Architecture

GreptimeDB can run as one standalone process or as a distributed cluster. Standalone deployments use the configured local or object-storage backend. Distributed deployments can use shared object storage to separate persistent data files from compute, allowing compute and storage capacity to be adjusted independently.

Object storage is not the only state in the system. WAL records accepted writes, Metasrv manages cluster metadata and Region routes, and local disks can cache remote data. Availability and failover depend on the selected WAL mode, Metasrv deployment, Region placement, shared storage, and available Datanodes.

## One System for Real-Time Monitoring and Historical Analysis

In distributed deployments backed by object storage, recent reads can be served from memory or accelerated by local caches. Long-term data remains in object storage and is read through the same storage engine and query paths. This lets real-time monitoring and historical analysis share one storage and query foundation instead of using separate operational and analytics stacks.

The access patterns and resource demands are still different. Cache sizing, retention, compaction, query concurrency, compute capacity, and resource isolation must be planned for the expected mix of recent and historical queries.

## High-level Architecture

![GreptimeDB high-level architecture](/architecture-4.png)

## Components

Distributed mode has three core components and an optional Flow runtime:

- [**Metasrv**](/contributor-guide/metasrv/overview.md): Manages catalogs, schemas, tables, Region routes, procedures, and scheduling metadata.
- [**Frontend**](/contributor-guide/frontend/overview.md): Accepts client protocols, authenticates requests, plans distributed queries, and routes reads and writes using Metasrv metadata.
- [**Datanode**](/contributor-guide/datanode/overview.md): Hosts Regions, executes reads and writes, records WAL entries, performs compaction, and persists data files to the configured local or object-storage provider.
- [**Flownode (optional)**](/contributor-guide/flownode/overview.md): Runs [Flow](/user-guide/flow-computation/overview.md) tasks that continuously compute and materialize derived data in sink tables.

In standalone mode, one GreptimeDB process provides these database functions without separate service deployment.

## How It Works

The following paths describe distributed mode. Standalone mode runs the same database functions in one process.

### Write Path

1. A client sends data through a supported ingestion protocol.
2. Frontend resolves table and Region routes from Metasrv metadata.
3. Frontend splits the request and forwards rows to the Datanodes that host the target Regions.
4. A Datanode writes to memory and the configured [WAL](/user-guide/deployments-administration/wal/overview.md), then flushes immutable data files to the table's configured [storage provider](./storage-location.md).

[Noop WAL](/user-guide/deployments-administration/wal/noop-wal.md) is available only in cluster mode for emergencies when the configured WAL provider is temporarily unavailable. It does not retain WAL records, so a failure or restart can lose accepted writes that have not reached persistent data files. Durability therefore depends on WAL and deployment configuration, not only on the data-file location.

### Query Path

1. A client submits SQL, PromQL, or an explicitly supported query API such as the Jaeger-compatible API.
2. Frontend plans the query and dispatches work to Datanodes that host the relevant Regions.
3. Datanodes read in-memory data and persistent files, use local caches when applicable, apply pruning and indexes, and return partial results.
4. Frontend combines the results and returns the response.

### Flow Path (Optional)

When Flow is enabled, Flownode processes incoming rows from source tables, maintains continuous computations, and writes materialized results to sink tables. Source and sink tables keep their own schema, TTL, indexes, and storage settings. See [Flow Computation](/user-guide/flow-computation/overview.md).

For storage responsibilities, see [Storage Location](./storage-location.md). For implementation details, see the [Contributor Guide](/contributor-guide/overview.md).
