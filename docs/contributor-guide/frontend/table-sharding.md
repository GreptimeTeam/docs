---
keywords: [table sharding, partition, region, datanode, metasrv, data distribution]
description: Explains how table data in GreptimeDB is sharded and distributed, including the concepts of partition and region.
---

# Table Sharding

GreptimeDB shards a table into partitions and stores each partition in a Region. This page describes the implementation-level relationship between those objects.

## Partition

The [Table Sharding](/user-guide/deployments-administration/manage-data/table-sharding.md) section in the User Guide documents the partition syntax.

## Region

Each partition maps to one Region, which is the storage and scheduling unit managed by Datanodes. Metasrv stores the route that maps each Region to its Datanode.
If the partition layout needs to change after table creation, GreptimeDB supports explicit
[repartitioning](/user-guide/deployments-administration/manage-data/repartition.md) through split and merge operations.

The relationship is shown below:

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
