# Table Sharding

The sharding of stored data is essential to any distributed database. This document will describe how table's data in GreptimeDB is being sharded, and distributed.

## Partition

In GreptimeDB, logically, data is sharded in partitions. Because GreptimeDB is using "table" to
group data and SQL to query them, we borrow the word "partition", which is a concept commonly used
in OLTP databases.

Each partition includes only a portion of the data from the table, and is
grouped by some column(s) value range. For example, we can partition a table in GreptimeDB like
this:

```sql
CREATE TABLE (...)
PARTITION ON COLUMNS (<COLUMN LIST>) (
    <RULE LIST>
);
```

The syntax mainly consists of two parts:
- `PARTITION ON COLUMNS` followed by a comma-separated list of column names, which specifies which columns might be used for partitioning. The partition list specified here is only used as an "allow list", and in reality only a portion of the columns specified here will be used for partitioning.
- `RULE LIST` is a list of multiple partition rules, each of which is a combination of a partition name and a partition condition. The expressions here can use `=`, `!=`, `>`, `>=`, `<`, `<=`, `AND`, `OR`, column name and literals.

Here is a concrete example:

```sql
CREATE TABLE my_table (
  a INT PRIMARY KEY,
  b STRING,
  ts TIMESTAMP TIME INDEX,
)
PARTITION ON COLUMNS (a) (
  a < 10,
  a >= 10 AND a < 20,
  a >= 20,
);
```

The above `my_table` has 3 partitions. The first partition contains rows where "a < 10", the second partition contains rows where "10 <= a < 20", and the third partition contains all rows where "a >= 20".

::: warning Important

1. The ranges of all partitions must not overlap.
2. The columns used for partitioning must be specified in `ON COLUMNS`

:::

::: tip Note
Currently expressions are not supported in "PARTITION BY RANGE" syntax, you can only supply column names.
:::

## Region

The data within a table is logically split after creating partitions. You may ask the question "
how are the data, after being logically partitioned, stored in the GreptimeDB? The answer is in "`Region`"s.

Each region is corresponding to a partition, and stores the data in the partition. The regions are distributed among
`Datanode`s. Our
`metasrv` will move regions among Datanodes automatically, according to the states of Datanodes.
Also, `metasrv` can split or merge regions according to their data volume or access pattern.

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
