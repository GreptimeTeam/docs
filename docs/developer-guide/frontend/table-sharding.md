# Table Sharding

## Introduction

Clustering and sharding are essential to ensure a distributed database, like Greptime DB, is highly
scalable and available. While this document mainly talks about Sharding, that is, how data is
distributed and queried across GreptimeDB clusters, you can find more details on Clustering here
[insert links to the article] since it is closely related to Fault Tolerance.

## Partition

In GreptimeDB, logically, data is sharded in partitions. Because GreptimeDB is using "table" to
group data and SQL to query them, we borrow the word "partition", which is a concept commonly used
in OLTP databases.

In GreptimeDB, a table can be horizontally partitioned in multiple ways and it uses the same
partitioning types (and corresponding syntax) as in MySQL. Currently, GreptimeDB supports "RANGE
partitioning" and "RANGE COLUMNS partitioning".

In RANGE partitioning, each partition includes only a portion of the data from the table, and is
grouped by some column(s) value range. For example, we can partition a table in GreptimeDB like
this:

```sql
CREATE TABLE my_table (
  a INT,
  others STRING,
)
PARTITION BY RANGE (a) (
  PARTITION p0 VALUES LESS THAN (10),
  PARTITION p1 VALUES LESS THAN (20),
  PARTITION p2 VALUES LESS THAN MAXVALUE,
)
```

`my_table` that we created above has 3 partitions. Partition "p0" contains a portion of data that
only has rows of column "a < 10"; partition "p1" contains rows of "10 <= a < 20"; partition "p2"
includes the remaining rows of "a >= 20".

> Important: value range must be strictly increased, and ends with "MAXVALUE".
> Note: currently expressions are not supported in "PARTITION BY RANGE" syntax, you can only supply
> column names.

## Region

The data within a table is logically split after creating partitions. You may ask the question "
how is the data, which is physically distributed, stored in GreptimeDB? The answer is in "Region".
"Region" is a group of a table's data stored together inside a Datanode instance physically. Our
"auto-admin" will move regions among Datanodes automatically, according to the states of Datanodes.
Also, "auto-admin" can split or merge regions according to their data volume or access pattern.

![Table Sharding](../../public/table-sharding.png)
