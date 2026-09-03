---
keywords: [frontend, proxy, protocol, routing, distributed query, tenant management, authorization, flow control, cloud deployment, endpoints]
description: Overview of GreptimeDB's Frontend component - a stateless proxy service for client requests.
---

# Frontend

Frontend is GreptimeDB's stateless request-orchestration service. The server layer terminates protocols and converts wire messages; Frontend supplies the database behavior behind those handlers, including permission checks, statement execution, routing, and distributed query planning.

Frontend does not store table data. It caches catalog and route metadata obtained from Metasrv, and Metasrv invalidates those caches through heartbeat responses when metadata changes.

## Core Functions

- Provide query and ingestion behavior for the supported [protocols][1].
- Resolve catalogs, schemas, tables, and Region routes.
- Validate permissions before executing a request.
- Plan distributed queries and merge results from Datanodes.
- Convert table-level writes and deletes into Region requests.

## Architecture

### Key Components

- Protocol handlers adapt SQL, PromQL, gRPC ingestion, and observability protocols to Frontend's internal request interfaces.
- The catalog and partition managers provide table metadata, partition rules, and Region routes.
- The statement executor dispatches queries, DML, and DDL to their respective execution paths.
- The distributed planner replaces table scans with `MergeScan` plans that can run across Datanodes.

### Request Flow

The request path depends on the operation.

#### Queries

1. A protocol handler creates the query context and performs authentication and permission checks.
2. The language-specific planner produces a logical plan. In distributed mode, the planner uses partition metadata to select Regions and constructs a distributed plan.
3. Frontend sends Region subplans to the owning Datanodes. Datanodes execute them against local Region engines and return streams of Arrow record batches.
4. Frontend runs the remaining operators, merges the streams, and formats the result for the client protocol.

#### Writes and deletes

1. Frontend validates the request against the table schema. Protocols that support schema-on-write may create a missing table or add columns before retrying the write.
2. The partition rule assigns rows to Regions. Frontend builds one Region request per target and routes it to the current Region leader.
3. The Datanode's Region server dispatches each request to the Region engine. In standalone mode, the same request is sent to an embedded Region server instead of over RPC.

#### DDL

The statement executor converts DDL into a task. In distributed mode, Metasrv runs that task as a persisted procedure, updates metadata, and coordinates Region operations on Datanodes. Standalone mode uses the same statement boundary with local implementations of the metadata and procedure services.

### Deployment

The following picture shows a typical deployment of GreptimeDB in the cloud. The `Frontend` instances
form a cluster to serve the requests from clients:

![frontend](/frontend.png)

## Details

- [Table Sharding][2]
- [Distributed Querying][3]

[1]: /user-guide/protocols/overview.md
[2]: ./table-sharding.md
[3]: ./distributed-querying.md
