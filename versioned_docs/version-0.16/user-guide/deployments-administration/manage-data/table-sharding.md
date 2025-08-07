---
keywords: [table sharding, GreptimeDB, partitioning methods, distributed tables, data management, SQL, query performance]
description: Explains table sharding in GreptimeDB, including when to shard a table, partitioning methods, creating distributed tables, inserting data, querying data, and inspecting sharded tables.
---

# Table Sharding

Table sharding is a technique used to distribute a large table into multiple smaller tables.
This practice is commonly employed to enhance the performance of database systems.

In GreptimeDB, data is logically sharded into partitions.
Since GreptimeDB uses "tables" to group data and SQL to query them,
we adopt the term "partition," a concept frequently used in OLTP databases.

## When to shard a table

Inside GreptimeDB, both data management and scheduling are based on the region level,
and each region is corresponding to a table partition.
Thus when you have a table that is too large to fit into a single node,
or the table is too hot to be served by a single node,
you should consider sharding it.

A region in GreptimeDB has a relative fixed throughput capacity,
and the number of regions in a table determines the total throughput capacity of the table.
If you want to increase the throughput capacity of a table,
you can increase the number of regions in the table.
Ideally the overall throughput of a table should be proportional to the number of regions.

As for which specific partition column to use or how many regions to create,
it depends on the data distribution and the query pattern.
A general goal is to make the data distribution among regions as even as possible.
And the query pattern should be considered when designing the partition rule set as one query can be processed in parallel among regions.
In other word the query latency is depends on the "slowest" region's latency.

But notice that the increase of regions will bring some basic consumption and increase the complexity of the system.
You need to consider the requirement of data ingest rate, the query performance,
the data distribution on storage system.
You should shard a table only when necessary.

For more information on the relationship between partitions and regions, refer to the [Table Sharding](/contributor-guide/frontend/table-sharding.md) section in the contributor guide.

## Partition

In GreptimeDB, a table can be horizontally partitioned in multiple ways and it uses the same
partitioning types (and corresponding syntax) as in MySQL. Currently, GreptimeDB supports "RANGE COLUMNS partitioning".

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

1. `PARTITION ON COLUMNS` followed by a comma-separated list of column names. This specifies which columns will be used for partitioning. The columns specified here must be of the Tag type (as specified by the PRIMARY KEY). Note that the ranges of all partitions must **not** overlap.

2. `RULE LIST` is a list of multiple partition rules. Each rule is a combination of a partition name and a partition condition. The expressions here can use `=`, `!=`, `>`, `>=`, `<`, `<=`, `AND`, `OR`, column names, and literals.

:::tip Note
Currently expressions are not supported in "PARTITION BY RANGE" syntax.
:::

### Example

## Create a distributed table

You can use the MySQL CLI to [connect to GreptimeDB](/user-guide/protocols/mysql.md) and create a distributed table.
The following example creates a table and partitions it based on the `device_id` column.

```SQL
CREATE TABLE sensor_readings (
    device_id INT16,
    reading_value FLOAT64,
    ts TIMESTAMP DEFAULT current_timestamp(),
    PRIMARY KEY (device_id),
    TIME INDEX (ts)
)
PARTITION ON COLUMNS (device_id) (
  device_id < 100,
  device_id >= 100 AND device_id < 200,
  device_id >= 200
);
```

More partition columns can be used to create more complex partition rules:

```sql
CREATE TABLE sensor_readings (
    device_id INT,
    area STRING,
    reading_value FLOAT64,
    ts TIMESTAMP DEFAULT current_timestamp(),
    PRIMARY KEY (device_id, area),
    TIME INDEX (ts)
)
PARTITION ON COLUMNS (device_id, area) (
  device_id < 100 AND area < 'Sorth',
  device_id < 100 AND area >= 'South',
  device_id >= 100 AND area <= 'East',
  device_id >= 100 AND area > 'East'
);
```

The following content uses the `sensor_readings` table with two partition columns as an example.

## Insert data into the table

The following code inserts 3 rows into each partition of the `sensor_readings` table.

```sql
INSERT INTO sensor_readings (device_id, area, reading_value, ts) 
VALUES (1, 'North', 22.5, '2023-09-19 08:30:00'),
       (10, 'North', 21.8, '2023-09-19 09:45:00'),
       (50, 'North', 23.4, '2023-09-19 10:00:00');

INSERT INTO sensor_readings (device_id, area, reading_value, ts) 
VALUES (20, 'South', 20.1, '2023-09-19 11:15:00'),
       (40, 'South', 19.7, '2023-09-19 12:30:00'),
       (90, 'South', 18.9, '2023-09-19 13:45:00');

INSERT INTO sensor_readings (device_id, area, reading_value, ts) 
VALUES (110, 'East', 25.3, '2023-09-19 14:00:00'),
       (120, 'East', 26.5, '2023-09-19 15:30:00'),
       (130, 'East', 27.8, '2023-09-19 16:45:00');

INSERT INTO sensor_readings (device_id, area, reading_value, ts) 
VALUES (150, 'West', 24.1, '2023-09-19 17:00:00'),
       (170, 'West', 22.9, '2023-09-19 18:15:00'),
       (180, 'West', 23.7, '2023-09-19 19:30:00');
```

:::tip NOTE
Note that when the written data does not meet any of the rules in the partitioning scheme, it will be assigned to the default partition (i.e., the first partition 0 of the table).
:::

## Distributed Read

Simply use the `SELECT` statement to query the data:

```sql
SELECT * FROM sensor_readings order by reading_value desc LIMIT 5;
```

```sql
+-----------+------+---------------+---------------------+
| device_id | area | reading_value | ts                  |
+-----------+------+---------------+---------------------+
|       130 | East |          27.8 | 2023-09-19 16:45:00 |
|       120 | East |          26.5 | 2023-09-19 15:30:00 |
|       110 | East |          25.3 | 2023-09-19 14:00:00 |
|       150 | West |          24.1 | 2023-09-19 17:00:00 |
|       180 | West |          23.7 | 2023-09-19 19:30:00 |
+-----------+------+---------------+---------------------+
5 rows in set (0.02 sec)
```

```sql
SELECT MAX(reading_value) AS max_reading 
FROM sensor_readings;
```

```sql
+-------------+
| max_reading |
+-------------+
|        27.8 |
+-------------+
1 row in set (0.03 sec)
```

```sql
SELECT * FROM sensor_readings 
WHERE area = 'North' AND device_id < 50;
```

```sql
+-----------+-------+---------------+---------------------+
| device_id | area  | reading_value | ts                  |
+-----------+-------+---------------+---------------------+
|        10 | North |          21.8 | 2023-09-19 09:45:00 |
|         1 | North |          22.5 | 2023-09-19 08:30:00 |
+-----------+-------+---------------+---------------------+
2 rows in set (0.03 sec)
```

## Inspect a sharded table

GreptimeDB provides severals system table to check DB's state. For table sharding information, you can query [`information_schema.partitions`](/reference/sql/information-schema/partitions.md) which gives the detail of partitions inside one table, and [`information_schema.region_peers`](/reference/sql/information-schema/region-peers.md) which gives the runtime distribution of regions.
