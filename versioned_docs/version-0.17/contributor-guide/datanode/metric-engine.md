---
keywords: [Metric engine, small tables, logical table, physical table, storage optimization]
description: Overview of the Metric engine in GreptimeDB, its concepts, architecture, and design for handling small tables.
---

# Metric Engine

## Overview

The `Metric` engine is a component of GreptimeDB, and it's an implementation of the storage engine. It mainly targets scenarios with a large number of small tables for observable metrics.

Its main feature is to use synthetic physical wide tables to store a large amount of small table data, achieving effects such as reuse of the same column and metadata. This reduces storage overhead for small tables and improves columnar compression efficiency. The concept of a table becomes even more lightweight under the `Metric` engine.

## Concepts

The `Metric` engine introduces two new concepts: "logical table" and "physical table". From the user's perspective, logical tables are exactly like ordinary ones. From a storage point-of-view, physical Regions are just regular Regions.

### Logical Table

A logical table refers to user-defined tables. Just like any other ordinary table, its definition includes the name of the table, column definitions, index definitions etc. All operations such as queries or write-ins by users are based on these logical tables. Users don't need to worry about differences between logical and ordinary tables during usage.

From an implementation standpoint, a logical table is virtual; it doesn't directly read or write physical data but maps read/write requests into corresponding requests for physical tables in order to implement data storage and querying.

### Physical Table

A physical table is a table that actually stores data, possessing several physical Regions defined by partition rules.

## Architecture and Design

The main design architecture of the `Metric` engine is as follows:

![Arch](/metric-engine-arch.png)

In the current version implementation, the `Metric` engine reuses the `Mito` engine to achieve storage and query capabilities for physical data. It also provides access to both physical tables and logical tables simultaneously.

Regarding partitioning, logical tables have identical partition rules and Region distribution as physical tables. This makes sense because the data of logical tables are directly stored in physical tables, so their partition rules are consistent.

Concerning routing metadata, the routing address of a logical table is a logical address - what its corresponding physical table is - then through this physical table for secondary routing to obtain the real physical address. This indirect routing method can significantly reduce the number of metadata modifications required when Region migration scheduling occurs in Metric engines.

Operationally speaking, The `Metric` engine only supports limited operations on physical tables to prevent misoperations such as prohibiting writing into or deleting from a physical table which could affect user's logic-table data. Generally speaking, users can consider that they have read-only access to these physical tables.

To improve performance during simultaneous DDL (Data Definition Language) operations on many tables, the 'Metric' engine has introduced some batch DDL operations. These batch DDL operations can merge lots of DDL actions into one request thereby reducing queries and modifications times for metadata thus enhancing performance. This feature is particularly beneficial in scenarios such as the automatic creation requests brought about by large amounts of metrics during Prometheus Remote Write cold start-up, as well as the modification requests for numerous route-tables mentioned earlier during migration of many physical regions.
 
Apart from physical data regions belonging to physical tables, the 'Metric' engine creates an additional metadata region physically for each individual physical data region used in storing some metadata needed by itself while maintaining mapping and other states. This metadata includes the mapping relationship between logical tables and physical tables, the mapping relationship between logical columns and physical columns etc.
