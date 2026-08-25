---
keywords: [table sharding, partition, region, datanode, metasrv, data distribution]
description: Explains how table data in GreptimeDB is sharded and distributed, including the concepts of partition and region.
---

# Table Sharding

The sharding of stored data is essential to any distributed database. This document will describe how table's data in GreptimeDB is being sharded, and distributed.

## Partition

For the syntax of creating a partitioned table, please refer to the [Table Sharding](/user-guide/deployments-administration/manage-data/table-sharding.md) section in the User Guide.

## Region

The data within a table is logically split after creating partitions. You may ask the question "
how are the data, after being logically partitioned, stored in the GreptimeDB? The answer is in "`Region`"s.

Each region is corresponding to a partition, and stores the data in the partition. The regions are distributed among
`Datanode`s. `Metasrv` manages the route information that maps regions to Datanodes.
If the partition layout needs to change after table creation, GreptimeDB supports explicit
[repartitioning](/user-guide/deployments-administration/manage-data/repartition.md) through split and merge operations.

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
