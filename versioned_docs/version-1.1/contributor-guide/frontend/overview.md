---
keywords: [frontend, proxy, protocol, routing, distributed query, tenant management, authorization, flow control, cloud deployment, endpoints]
description: Overview of GreptimeDB's Frontend component - a stateless proxy service for client requests.
---

# Frontend

The **Frontend** is a stateless service that serves as the entry point for client requests in GreptimeDB. It provides a unified interface for multiple database protocols and acts as a proxy that forwards read/write requests to appropriate Datanodes in the distributed system.

## Core Functions

- **Protocol Support**: Multiple database protocols including SQL, PromQL, MySQL, and PostgreSQL. See [Protocols][1] for details
- **Request Routing**: Routes requests to appropriate Datanodes based on metadata
- **Query Distribution**: Splits distributed queries across multiple nodes
- **Response Aggregation**: Combines results from multiple Datanodes
- **Authorization**: Security and access control validation

## Architecture

### Key Components
- **Protocol Handlers**: Handle different database protocols
- **Catalog Manager**: Caches metadata from Metasrv to enable efficient request routing and schema validation
- **Dist Planner**: Converts logical plans to distributed execution plans
- **Request Router**: Determines target Datanodes for each request

### Request Flow

![request flow](/request_flow.png)

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
