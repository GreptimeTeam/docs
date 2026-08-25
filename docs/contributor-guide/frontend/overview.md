---
keywords: [frontend, protocols, request routing, distributed query, authorization]
description: Overview of Frontend, GreptimeDB's stateless request entry point and query coordinator.
---

# Frontend

Frontend is GreptimeDB's stateless request entry point and orchestration layer. It implements the business logic behind the protocol servers, plans queries, routes writes and Region reads, and coordinates distributed query execution.

Network listeners and wire formats belong to the `servers` crate. The `frontend` crate implements handler traits for SQL, gRPC, MySQL, PostgreSQL, InfluxDB, OpenTelemetry, Prometheus, OpenTSDB, Jaeger, and other supported interfaces.

<AnchorAlias id="core-functions" />

## Responsibilities

- Parse and plan SQL, PromQL, and log queries.
- Check permissions and carry session context through request processing.
- Route inserts, deletes, and Region queries using catalog and route metadata.
- Dispatch distributed query fragments to Datanodes and merge their results.

See the [protocol overview](/user-guide/protocols/overview.md) for the user-facing interfaces.

## Architecture

### Key Components

- `Instance` in `src/frontend/src/instance.rs` is the main business-logic container and implements the server handler traits.
- Modules under `src/frontend/src/instance/` handle individual request types and protocols.
- `StatementExecutor` in the `operator` crate handles statements and write-side operations.
- The `query` crate owns logical planning, optimization, and distributed plans.
- `FrontendRegionQueryHandler` in `instance/region_query.rs` resolves Region targets and sends query requests to Datanodes.

### Request Flow

In standalone mode, Frontend accesses an embedded Datanode through a local `RegionServer` adapter. In distributed mode, it uses metadata from Metasrv and RPC clients to reach remote Datanodes.

### Deployment

Frontend instances do not own table data. Multiple instances can serve requests against the same Metasrv and Datanode cluster.

<AnchorAlias id="details" />

## Implementation guides

- [Table Sharding](./table-sharding.md)
- [Distributed Querying](./distributed-querying.md)
