---
keywords: [table sharding, partition, region, datanode, metasrv, data distribution]
description: Explains how table data in GreptimeDB is sharded and distributed, including the concepts of partition and region.
---

# Table Sharding

GreptimeDB shards a table into Regions. Partition expressions define which rows belong to each Region, while Region routes define which Datanode currently owns each Region.

## Partition

A partition is a logical row set described by an expression over one or more columns. The partition layout must cover the table's input domain so each row has one target Region. See [Table Sharding](/user-guide/deployments-administration/manage-data/table-sharding.md) for the SQL syntax and supported expressions.

## Region

Each partition maps to one Region. Region IDs remain the storage and routing identity used by Frontend, Datanode, and Metasrv. Multiple Regions from the same table may be placed on one Datanode.

The relationship between partition and region can be viewed as the following diagram:

```text
                       ┌───────┐
                       │       │
                       │ Table │
                       │       │
                       └───┬───┘
                           │
        Range [Start, end) │ Horizontally Split Data
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        │                  │                  │
  ┌─────▼─────┐      ┌─────▼─────┐      ┌─────▼─────┐
  │           │      │           │      │           │
  │ Partition │      │ Partition │      │ Partition │
  │           │      │           │      │           │
  │    P0     │      │    P1     │      │    Px     │
  └─────┬─────┘      └─────┬─────┘      └─────┬─────┘
        │                  │                  │
        │                  │                  │  One-to-one mapping of
┌───────┼──────────────────┼───────┐          │  Partition and Region
│       │                  │       │          │
│ ┌─────▼─────┐      ┌─────▼─────┐ │    ┌─────▼─────┐
│ │           │      │           │ │    │           │
│ │   Region  │      │   Region  │ │    │   Region  │
│ │           │      │           │ │    │           │
│ │     R0    │      │     R1    │ │    │     Ry    │
│ └───────────┘      └───────────┘ │    └───────────┘
│                                  │
└──────────────────────────────────┘
  Could be placed in one Datanode
```

## Routing and Pruning

For writes, Frontend evaluates the partition rule for each row, groups rows by Region, and sends Region requests to the current leaders from the route table.

For queries, the distributed planner compares query predicates with the partition expressions. It scans only Regions that can satisfy the predicates. If partition metadata is missing or cannot be interpreted safely, the planner falls back to all Regions rather than risk omitting data.

## Changing the Partition Layout

[Repartitioning](/user-guide/deployments-administration/manage-data/repartition.md) changes an existing layout through explicit split and merge operations. Metasrv runs the change as a persisted procedure, updates the Region routes and partition expressions, and invalidates stale table-route caches. New requests use the published layout after their Frontend refreshes that metadata.
