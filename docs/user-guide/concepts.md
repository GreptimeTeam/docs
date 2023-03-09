# Concepts

GreptimeDB is an open-source time-series database with a special focus on
scalability, analytical capabilities and efficiency. It's designed to work on
infrastructure of the cloud era, and users benefit from its elasticity and
commodity storage.

Our core developers have been building time-series data platform for
years. Based on their best-practices, GreptimeDB is born to bring you:

- [A standalone binary](https://github.com/GreptimeTeam/greptimedb/releases)
  that scales to highly-available distributed cluster, providing a transparent
  expierence for cluster users
- Optimized columnar layout for handling time-series data; compacted,
  compressed, stored on various storage backends
- Flexible index options, tackling high cardinality issues down
- Distributed, parallel query execution, leveraging elastic computing resource
- Native SQL, and Python scripting for advanced analytical scenarios
- Widely adopted database protocols and APIs
- Extensible table engine architecture for extensive workloads

## Components

In order to form a robust database cluster and keep complexity at an acceptable
level, there are three main components in GreptimeDB architecture: Datanode,
Frontend and Meta.

- [**Datanodes**](../developer-guide/datanode/overview.md) hold regions of
  tables and data in Greptime DB cluster. It accepts read and write request sent
  from *Frontend*, and executes it against its data. A single-instance
  *Datanode* deployment can also be used as GreptimeDB standalone mode, for
  local development.
- [**Frontend**](../developer-guide/frontend/overview.md) is a stateless
  component that can scale to as many as needed. It accepts incoming request,
  authenticates it, translates it from various protocols into GreptimeDB
  cluster's internal one, and forwards to certain *Datanode*s under guidance
  from *Meta*.
- [**Meta**](../developer-guide/meta/overview.md) is the central command of
  GreptimeDB cluster. In typical deployment, at least three nodes is required to
  setup a reliable *Meta* mini-cluster. *Meta* manages database and table
  information, including how data spread across the cluster and where to route
  requests to. It also keeps monitoring availability and performance of
  *Datanode*s, to ensure its routing table is valid and up-to-date.

## Objects

To understand how GreptimeDB manages and serves its data, you need to know about
these building blocks of GreptimeDB.

### Database

Similar to *database* in relational databases, database is the minimal unit of
data container, within which data can be managed and computed.

### Table

Table in GreptimeDB is similar to it in traditional relational database except
it requires a timestamp column. The table holds a set of data that shares a
common schema. It can either be created from SQL `CREATE TABLE`, or inferred
from the input data structure (the auto-schema feature). In distributed
deployment, a table can be split into multiple partitions that sit on different
datanodes.

### Table Region

Each partition of distributed table is called a region. A region may contain a
sequence of continuous data, depending on the partition algorithm. Region
information is managed by Meta. It's completely transparent to users who send
the query.

### Data Types

Data in GreptimeDB is strongly typed. Auto-schema feature provides some
flexibility when creating a table. Once the table is created, data of the same
column must share common data type.

Find all the supported data types in [Data Types](../reference/data-types.md).

## APIs

GreptimeDB provides multiple types of APIs to fit itself into your existing data
stack. Currently, we have these approaches to access the database:

- Database protocols: [MySQL](./supported-protocols/mysql.md) and
  [PostgreSQL](./supported-protocols/postgresql.md) wire protocols are
  supported, use standard mysql and psql client, or their connectors of specific
  programming language
- [HTTP RESTful APIs](./supported-protocols/http-api.md)
- [Prometheus remote read/write](./supported-protocols/prometheus.md) endpoints
- [Influxdb line protocol](./supported-protocols/influxdb.md) compatible API
  over HTTP
- [OpenTSDB compatible API](./supported-protocols/opentsdb.md) over TCP and HTTP
- [gRPC endpoints](./supported-protocols/grpc.md)

## What's Next

- See next chapters for [table management](./table-management.md) and [data
  read/write](./reading-writing-data.md)
- See our [developer guides](../developer-guide/overview.md) for more
  information about GreptimeDB's components
- Learn [how to
  contribute](https://github.com/GreptimeTeam/greptimedb/blob/develop/CONTRIBUTING.md)
  to our code and docs
