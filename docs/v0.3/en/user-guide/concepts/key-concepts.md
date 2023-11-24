# Key Concepts

To understand how GreptimeDB manages and serves its data, you need to know about
these building blocks of GreptimeDB.

## Database

Similar to *database* in relational databases, time-series database is the minimal unit of
data container, within which data can be managed and computed.

## Time-Series Table

GreptimeDB designed time-series table to be the basic unit of data storage.
It is similar to a table in a traditional relational database, but requires a timestamp column.
The table holds a set of data that shares a common schema.
It can be created using SQL `CREATE TABLE`, or inferred from the input data structure using the auto-schema feature.
In a distributed deployment, a table can be split into multiple partitions that sit on different datanodes.

For more information about the data model of the time-series table, please refer to [Data Model](./data-model.md).

## Table Region

Each partition of distributed table is called a region. A region may contain a
sequence of continuous data, depending on the partition algorithm. Region
information is managed by Metasrv. It's completely transparent to users who send
the query.

## Data Types

Data in GreptimeDB is strongly typed. Auto-schema feature provides some
flexibility when creating a table. Once the table is created, data of the same
column must share common data type.

Find all the supported data types in [Data Types](../../reference/data-types.md).
