# Learn about Usage

Welcome to GreptimeCloud. This document will introduce the usage calculation algorithms of GreptimeCloud. To monitor service usage, you can go to the [GreptimeCloud Console](https://console.greptime.cloud/).

## Capacity Unit

All requests to GreptimeCloud are measured in capacity units, which reflect the size and complexity of the request. The measurement methods of write capacity unit and read capacity unit are different, see following for details.

### WCU (Write Capacity Unit)

Each API call to write data to your table is a write request.
WCU is calculated based on the total size of the insert rows in one request.
A standard write capacity unit can write rows up to 1KB.
For rows larger than 1KB, additional write capacity units are required.

:::tip NOTE
The capacity unit may be subject to change in the future.
:::

The following steps are used to determine the size of each request:

1. Get the size of the data type of each column in the table schema. You can find details about the size of each data type in the [Data Types](/reference/data-types.md) documentation.
2. Sum up the sizes of all columns in the request. If a column is not present in the request, its size depends on the column's default value. If the default value is null, the size is 0; otherwise, it is the size of the data type.
3. Multiply the sum by the number of rows to be written.

Here's an example of how to calculate the WCU for a table with the following schema:

```shell
+-------------+----------------------+------+------+---------------------+---------------+
| Column      | Type                 | Key  | Null | Default             | Semantic Type |
+-------------+----------------------+------+------+---------------------+---------------+
| host        | String               | PRI  | YES  |                     | TAG           |
| idc         | String               | PRI  | YES  |                     | TAG           |
| cpu_util    | Float64              |      | YES  |                     | FIELD         |
| memory_util | Float64              |      | YES  |                     | FIELD         |
| disk_util   | Float64              |      | YES  |                     | FIELD         |
| ts          | TimestampMillisecond | PRI  | NO   | current_timestamp() | TIMESTAMP     |
+-------------+----------------------+------+------+---------------------+---------------+
```

You have a write request as following:

```shell
INSERT INTO system_metrics VALUES ("host1", "a", 11.8, 10.3, 10.3, 1667446797450);
```

Based on the size of the data types in your table schema, the size of each row is 38 bytes (5+1+8+8+8+8), and the WCU of this request is 1 according to the calculation algorithm.

To reduce the WCU usage, use batched `INSERT` statements to insert multiple rows in a single statement, rather than sending a separate statement per row. For example:

```shell
INSERT INTO system_metrics
VALUES
    ("host1", "idc_a", 11.8, 10.3, 10.3, 1667446797450),
    ("host1", "idc_a", 80.1, 70.3, 90.0, 1667446797550),
    # ...... 22 rows
    ("host1", "idc_b", 90.0, 39.9, 60.6, 1667446798250);
```

The size of the request is 950 bytes (38 x 25). The WCU of this request is 1. If you insert 40 rows in a single statement, the size is 1520 bytes (38 x 40), and the WCU of this request is 2.

### RCU (Read Capacity Unit)

Each API call to read data from your table is a read request. RCU is the server resource consumed in one request. It depends on the following items:

- CPU time consumed by the request
- Scanned data size by the request

A standard read capacity unit can consume CPU time up to 1ms or scan up to 1KB data. For cpu time or scanned data larger than 1ms or 1KB, additional read capacity units are required.

:::tip NOTE
The capacity unit may be subject to change in the future.
:::

For example, suppose there is a read request consuming 2.5ms CPU time and scanning 2KB data. All of these costs add up to 5 RCUs:

- 3 RCU from 2.5ms CPU time
- 2 RCU from 2KB scanned data

To lower the RCU, you can design the table schema and queries carefully. Here are some tips:

- Use indexes to support the efficient execution of queries in GreptimeDB. Without indexes, GreptimeDB must scan the entire table to process the query. If an index matches the query, GreptimeDB can use the index to limit the data scanned. Consider using a column with high cardinality as the primary key and use it in the `WHERE` clause.
- Use queries that match a smaller percentage of data for better selectivity. For instance, an equality match on the time index field and a high cardinality tag field can efficiently limit the data scanned. Note that the inequality operator `!=` is not efficient because it always scans all data.

## Storage Capacity

GreptimeCloud stores data in object storage such as S3, and measures the size of your total data saved in database.

## Data retention

Depends on the pricing plan, GreptimeCloud may apply a default retention policy
for your data. Data will be deleted after its retention period expired.

## Tech Preview Plan

Tech preview plan provides the following free tier for users to try GreptimeCloud:

- Write capacity unit (WCU): 800 WCU/s per service.
- Storage capacity: 10GB per service.
- Account limits: 3 services per team.
- Data retention policy: By default, data written in the last three months is retained.

:::tip NOTE
The plan may change in the future. If you have any questions about it, please contact [feedback@greptime.cloud](mailto:feedback@greptime.cloud).
:::
