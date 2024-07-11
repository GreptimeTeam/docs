# Table Sharding

GreptimeDB supports table sharding, which is essential to a distributed database. A sharded table is divided into multiple partitions, and each partition is stored in a region. GreptimeDB manages the data in region level. Table sharding can achieve better performance and scalability.

This document will describe the when and how to configure table sharding.

## When to shard a table

Inside GreptimeDB, both data management and scheduling are based on the region level. And each region is corresponding to a table partition. Thus when you have a table that is too large to fit into a single node, or the table is too hot to be served by a single node, you should consider sharding it.

## Partition Rule Set

GreptimeDB uses value ranges of columns to partition data. The partition rule is a combination of a partition name and a partition condition. Partition rule's grammar is:

```sql
CREATE TABLE (...)
PARTITION ON COLUMNS (<COLUMN LIST>) (
    <RULE LIST>
);
```

The syntax mainly consists of two parts:
- `PARTITION ON COLUMNS` followed by a comma-separated list of column names, which specifies which columns might be used for partitioning. The partition list specified here is only used as an "allow list", and in reality only a portion of the columns specified here will be used for partitioning.
- `RULE LIST` is a list of multiple partition rules, each of which is a combination of a partition name and a partition condition. The expressions here can use `=`, `!=`, `>`, `>=`, `<`, `<=`, `AND`, `OR`, column name and literals.

Here is a concrete example that shard `my_table` into 3 partitions based on column `a`:

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

You can also define the rule set based on multiple primary key columns. For example, if you have a table with two primary key columns `series` and `host`, you can partition the table like this:

```sql
CREATE TABLE my_table (
  series INT,
  host STRING,
  ts TIMESTAMP TIME INDEX,
  PRIMARY KEY (series, host)
)
PARTITION ON COLUMNS (series, host) (
  host < "banana" AND series < 10,                             -- partition purple
  host < "banana" AND series >= 10,                            -- partition yellow
  host >= "banana" AND host < "watermelon",                    -- partition blue
  host >= "watermelon" AND host < "raspberry" AND series <= 20 -- partition green
  host >= "watermelon" AND series > 20,                        -- partition gray
  host >= "raspberry" AND series <= 20,                        -- partition pink
);
```

This partition rule can be illustrated in a 2-dimensional space like this:

![table-sharding-partition](/table-sharding-partition.png)

Two things need stress in this complex example:
- Each column in the partition rule are evaluated **separately**, this is different from the traditional storage system like MySQL or TiKV. Hence you can write whatever complex rule you want without considering the "primary key order" or "physical storage order".
- String comparison is based on the lexicographical order. E.g., string `"10"` is less than string `"2"`.
