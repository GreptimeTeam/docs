---
keywords: [Datanode, RegionServer, storage engine, query engine, heartbeat]
description: Overview of Datanode's Region-level storage and query responsibilities.
---

# Datanode

## Introduction

Datanode stores table data and executes queries against its local Regions. A table can contain multiple Regions, but Datanode does not manage tables as a metadata object. Frontend and Metasrv address it through Region-level requests, so its primary abstraction is a Region server.

## Components

- `RegionServer` in `src/datanode/src/region_server.rs` dispatches Region requests to the registered storage engine and exposes Regions to the query layer.
- The gRPC service accepts Region reads, writes, and lifecycle operations from Frontend and Metasrv.
- The local query engine plans and executes logical subplans received from Frontend. Datanode does not parse client SQL or coordinate a distributed query.
- The heartbeat task reports node and Region state to Metasrv and receives control instructions such as Region open, close, migration, and cache invalidation messages.
- HTTP handlers expose operational endpoints such as metrics and configuration.
- Datanode registers the Mito, Metric, and File Region engines. Mito is the primary time-series storage engine; Metric delegates physical storage to Mito for high-cardinality metric-table workloads; File exposes data in external files.

In standalone mode, the same Region server runs in-process without Metasrv coordination. In distributed mode, Region writability and lifecycle changes are coordinated through Metasrv leases and heartbeat messages.
