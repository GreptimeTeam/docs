# Usage and Limits

Welcome to GreptimeCloud. This document will introduce the usage and limits of GreptimeCloud. To monitor service usage, you can go to the [GreptimeCloud Console](https://console.greptime.cloud/).

Here is the overview of limits, see following sections for details of each items.

- WCU: Write capacity unit. Every service can use 100 WCU.
- RCU: Read capacity unit, Every service can use 100 RCU.
- Storage capacity: 5GB.
- Account limits: 5 services per account.

## Capacity Unit

All requests to GreptimeCloud are measured in capacity units, which reflect the size and complexity of the request. The measurement methods of write capacity unit and read capacity unit are different, see following for details. 

### WCU

Each API call to write data to your table is a write request. WCU (Write capacity unit) is calculated based on the size of the insert rows in a request. The conversion equivalency between WCU and request size is: **1 WCU = 1 KB**.

:::tip NOTE
The conversion equivalency may be subject to change in the future.
:::

We will use the following steps to determine the size of each request:

1. Get the size of the data type of each column in the table schema. You can find details about the size of each data type in the [Data Types](/reference/data-types.md) documentation.
2. Sum up the sizes of all columns in the request. If a column is not present in the request, its size depends on the column's default value. If the default value is null, the size is 0; otherwise, it is the size of the data type.
3. Multiply the sum by the number of rows to be written.

Here's an example of how to calculate the WCU for a table with the following schema:

```shell
+-------------+----------------------+------+---------------------+---------------+
| Field       | Type                 | Null | Default             | Semantic Type |
+-------------+----------------------+------+---------------------+---------------+
| host        | String               | NO   |                     | PRIMARY KEY   |
| idc         | String               | YES  | idc0                | PRIMARY KEY   |
| cpu_util    | Float64              | YES  |                     | FIELD         |
| memory_util | Float64              | YES  |                     | FIELD         |
| disk_util   | Float64              | YES  |                     | FIELD         |
| ts          | TimestampMillisecond | NO   | current_timestamp() | TIME INDEX    |
+-------------+----------------------+------+---------------------+---------------+
```

You have a write request as following:

```shell
INSERT INTO system_metrics VALUES ("host1", "a", 11.8, 10.3, 10.3, 1667446797450);
```

Based on the size of the data types in your table schema, the size of each row is 38 bytes (5+1+8+8+8+8). Using the conversion equivalency, 38 bytes = 1 WCU.

To reduce the WCU usage, use batched `INSERT` statements to insert multiple rows in a single statement, rather than sending a separate statement per row. For example:

```shell
INSERT INTO system_metrics
VALUES
    ("host1", "idc_a", 11.8, 10.3, 10.3, 1667446797450),
    ("host1", "idc_a", 80.1, 70.3, 90.0, 1667446797550),
    # ...... 22 rows
    ("host1", "idc_b", 90.0, 39.9, 60.6, 1667446798250);
```

The size of the request is 950 bytes (38 * 25). Using the conversion equivalency, 950 bytes is also 1 WCU.

### RCU

Each API call to read data from your table is a read request. RCU is the server resource consumed by the query. It depends on the following items:

- CPU time consumed by the query
- Scanned data size

The conversion equivalency between RCU and impact items is: 

- **1 RCU = 1ms cpu time**
- **1 RCU = 100KB scanned data**

:::tip NOTE
The conversion equivalencies may be subject to change in the future.
:::

For example, suppose there is a query consuming 3ms CPU time and scanning 200KB data. All of these costs add up to 5 RCUs:

- 3ms cpu time = 3 RCU
- 200KB scanned data = 2 RCU

To lower the RCU, you can design the table schema and queries carefully. Here are some tips:

- Use indexes to support the efficient execution of queries in GreptimeDB. Without indexes, GreptimeDB must scan the entire table to process the query. If an index matches the query, GreptimeDB can use the index to limit the data scanned. Consider using a column with high cardinality as the primary key and use it in the `WHERE` clause.
- Use queries that match a smaller percentage of documents for better selectivity. For instance, an equality match on the time index field and a high cardinality tag field can efficiently limit the data scanned. Note that the inequality operator `!=` is not efficient because it always scans all data.

## Storage Capacity

GreptimeCloud stores data in cloud service such as S3. More cloud storage will be supported in the future.
