# Concepts

GreptimeDB is an open-source time-series database with special focus on
scalability, analytical capabilities and efficiency. It's designed to work on
infrastructure of cloud era, and benefits from its elasticity and commodity
storage.

The core developers of GreptimeDB have been building time-series data platform
for years. Based on their best-practices, GreptimeDB is born to give you:

- A standalone binary that scales to highly-available distributed cluster, with
  transparent experience from user's perspective
- Columnar data layout optimised for time-series, compacted, compressed, stored
  on various storage backends
- Flexible index options, tackling high cardinality issues down
- Distributed parallel query execution, leveraging elastic computing resource
- Native SQL, and Python scripting for advanced analytical scenarios
- Widely adopted database protocols and APIs
- Extensible table engine architecture for extensive workloads

## Components

In order to form a robust database cluster and keep complexity at an acceptable
level, there are three main components in GreptimeDB architecture: Datanode,
Frontend and Meta.

- **Datanodes** hold regions of tables and data in Grpetime DB cluster. It
  accepts read and write request sent from *Frontend*, and processes it against
  its data. A single-instance datanode deployment can also be used as Greptime
  DB standalone mode, for local development.
- **Frontend** is a stateless component that can scale to as many as needed. It
  accepts incoming request, authenticates it, translates it from various
  protocols into GreptimeDB's internal one, and forward to certain datanodes
  under guidance from *Meta*.
- **Meta** is the central command of GreptimeDB cluster. In typical deployment,
  at least three nodes is required to setup a reliable meta mini-cluster. *Meta*
  manages database and table information, including how data spread across the
  cluster and where to route requests to. It also keeps monitoring availability
  and performance of datanodes, to ensure its routing table is valid and
  up-to-date.

## Objects

To understand how GreptimeDB manages and serves its data, you need to know
about these building blocks of GreptimeDB.

### Database

Similar to relational databases, database is the minimal unit of data container,
within which data can be managed and computed.

### Table

Table in GreptimeDB is similar to it's in traditional relational database
except it requires a timestamp column. The table holds a set of data that shares
a common schema. It can either be created from SQL CREATE TABLE, or inferred
from the input data structure (the auto-schema feature). In distributed
deployment, a table can be split into multiple partitions that sit on different
datanodes.

### Table Region

Each partition of distributed table is called a region. A region may contain a
sequence of continuous data, depending on the partition algorithm. Region
information is managed by Meta. It's completely transparent to query users.

### Data Types

Data in GreptimeDB is strongly typed, in order to maximum its efficiency and
performance. Auto-schema provides some flexibility when creating a table, but
once the table is created, a column of data must share common data type.

Current provided data type includes:

- Boolean
- Integers (8-bit, 16-bit, 32-bit and 64-bit)
- Unsigned integers (8-bit, 16-bit, 32-bit and 64-bit)
- Float numbers (32-bit and 64-bit)
- Bytes
- String
- Date, datatime and timestamp

There are new types in upcoming releases:

- Compound type like List
- Geometry

## APIs

GreptimeDB provides multiple types of APIs to fit itself into your existing
data stack. Currently, we have these approaches to access the database:

- Database protocols: MySQL and PostgreSQL wire protocols are supported, use
  standard mysql and psql client, or their connectors of many programming
  languages
- HTTP RESTful APIs
- Prometheus remote read/write endpoints
- Influxdb line protocol compatible API over HTTP
- OpenTSDB compatible API over TCP and HTTP
- GRPC endpoints

## What's Next

- See next chapters to [create a table] and [ingest data] into it
- See our [developer guides] for more information about GreptimeDB's components
- Learn [how to contribute] to our code and docs
