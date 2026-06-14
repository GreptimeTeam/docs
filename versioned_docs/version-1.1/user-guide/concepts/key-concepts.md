---
keywords: [key concepts, databases, time-series tables, table regions, data types]
description: Introduces the key concepts of GreptimeDB, including databases, time-series tables, table regions, data types, indexes, views, and flows. It explains how these components work together to manage and serve data in GreptimeDB.
---

# Key Concepts

To understand how GreptimeDB manages and serves its data, you need to know about
these building blocks of GreptimeDB.

## Database

Similar to *database* in relational databases, a database is the minimal unit of
data container, within which data can be managed and computed. Users can use the database to achieve data isolation, creating a tenant-like effect.

## Time-Series Table

GreptimeDB designed time-series table to be the basic unit of data storage.
It is similar to a table in a traditional relational database, but requires a timestamp column(We call it **time index**).
The table holds a set of data that shares a common schema, it's a collection of rows and columns:

* Column: a vertical set of values in a table, GreptimeDB distinguishes columns into time index, tag and field.
* Row: a horizontal set of values in a table.

It can be created using SQL `CREATE TABLE`, or inferred from the input data structure using the auto-schema feature.
In a distributed deployment, a table can be split into multiple partitions that sit on different datanodes.

For more information about the data model of the time-series table, please refer to [Data Model](./data-model.md).

## Table Engine

Table engines (also called storage engines) determine how data is stored, managed, and processed within the database. Each engine offers different features, performance characteristics, and trade-offs. GreptimeDB supports `mito` and `metric` engines etc., see [Table Engines](/reference/about-greptimedb-engines.md) for more information.

## Table Region

Each partition of distributed table is called a region. A region may contain a
sequence of continuous data, depending on the partition algorithm. Region
information is managed by Metasrv. It's completely transparent to users who send
write requests or queries.

## Data Types

Data in GreptimeDB is strongly typed. Auto-schema feature provides some
flexibility when creating a table. Once the table is created, data of the same
column must share common data type.

Find all the supported data types in [Data Types](/reference/sql/data-types.md).

## Index

The `index` is a performance-tuning method that allows faster retrieval of records. GreptimeDB provides various kinds of [indexes](/user-guide/manage-data/data-index.md) to accelerate queries.

## View

The `view` is a virtual table that is derived from the result set of a SQL query. It contains rows and columns just like a real table, but it doesn’t store any data itself.
The data displayed in a view is retrieved dynamically from the underlying tables each time the view is queried.

## Flow

A `flow` in GreptimeDB refers to a [continuous aggregation](/user-guide/flow-computation/overview.md) process that continuously updates and materializes aggregated data based on incoming data.
