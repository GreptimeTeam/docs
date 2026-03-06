---
keywords: [architecture, metasrv, frontend, datanode, flownode, object storage, WAL, database cluster]
description: Overview of GreptimeDB architecture, including core components, optional Flownode for flow computation, and request/data paths in distributed deployments.
---

# Architecture

GreptimeDB uses a compute-storage separation architecture where durable data persists in object storage and compute nodes scale independently.
This model supports elastic scaling and lower operational cost compared to architectures that rely on local disks as primary storage.

## High-level Architecture

![GreptimeDB high-level architecture](/architecture-4.png)

## Components

GreptimeDB has three core components in distributed mode, and one optional component for flow computation:

- [**Metasrv**](/contributor-guide/metasrv/overview.md): Metadata and routing control plane. It manages catalogs/schemas/tables/regions, coordinates scheduling, and serves routing data to other nodes.
- [**Frontend**](/contributor-guide/frontend/overview.md): Stateless access layer. It accepts client protocols, authenticates requests, plans/distributes queries, and routes writes/reads using metadata from Metasrv.
- [**Datanode**](/contributor-guide/datanode/overview.md): Storage and execution layer. It stores table regions, handles reads/writes, persists WAL, and flushes data files to object storage.
- [**Flownode (optional)**](/contributor-guide/flownode/overview.md): Streaming/continuous computation runtime for [Flow Computation](/user-guide/flow-computation/overview.md). It is used when flow workloads run as a separate service in distributed deployments.

In standalone mode, you run one GreptimeDB process instead of managing these services separately.

## How it works

### Write path

1. A client sends write requests to Frontend via supported protocols.
2. Frontend resolves table and region routes from Metasrv metadata (with cache refresh when needed).
3. Frontend splits and forwards requests to target Datanodes.
4. Datanode writes data to memory and [WAL](/user-guide/deployments-administration/wal/overview.md), then eventually flushes immutable data files to [object storage](./storage-location.md).

### Query path

1. A client sends SQL, PromQL, log, or trace queries to Frontend.
2. Frontend creates a distributed plan and dispatches sub-queries to relevant Datanodes.
3. Datanodes execute sub-queries on regions and return partial results.
4. Frontend merges the results and returns the final response.

### Flow path (optional)

When flow computation is enabled, Flownode runs continuous tasks that read source table changes and write computed results to sink tables.
For details, see [Flow Computation](/user-guide/flow-computation/overview.md).

For implementation details, see [Contributor Guide](/contributor-guide/overview.md).
