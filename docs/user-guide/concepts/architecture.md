---
keywords: [architecture, compute-storage separation, Metasrv, Frontend, Datanode, Flownode, object storage, WAL]
description: Overview of GreptimeDB standalone and distributed architecture, component responsibilities, and write, query, and Flow paths.
---

# Architecture

GreptimeDB can run as one standalone process or as a distributed cluster. Standalone deployments use the configured local or object-storage backend. Distributed deployments can use shared object storage to separate persistent data files from compute, allowing compute and storage capacity to be adjusted independently.

Object storage is not the only state in the system. WAL records accepted writes, Metasrv manages cluster metadata and Region routes, and local disks can cache remote data. Availability and failover depend on the selected WAL mode, Metasrv deployment, Region placement, shared storage, and available Datanodes.

For why real-time monitoring and historical analysis can share this storage and query foundation, see [Why GreptimeDB](./why-greptimedb.md#one-system-for-real-time-monitoring-and-historical-analysis).

## High-level Architecture

![GreptimeDB distributed architecture, showing data paths, control paths, and storage responsibilities.](/greptimedb-distributed-architecture.svg)

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
4. A Datanode writes to memory and the configured [WAL](/user-guide/deployments-administration/wal/overview.md), then eventually flushes immutable data files to the table's configured [storage provider](./storage-location.md).

### Query Path

1. A client submits SQL, PromQL, or an explicitly supported query API such as the Jaeger-compatible API.
2. Frontend plans the query and dispatches work to Datanodes that host the relevant Regions.
3. Datanodes read in-memory data and persistent files, use local caches when applicable, apply pruning and indexes, and return partial results.
4. Frontend combines the results and returns the response.

### Flow Path (Optional)

When Flow is enabled, Frontend mediates its data path. In streaming mode, Frontend mirrors writes to Flownode. In batching mode, Flownode queries source tables and writes materialized results to sink tables through Frontend. Source and sink tables keep their own schema, TTL, indexes, and storage settings. See [Flow Computation](/user-guide/flow-computation/overview.md).

For storage responsibilities, see [Storage Location](./storage-location.md). For implementation details, see the [Contributor Guide](/contributor-guide/overview.md).
