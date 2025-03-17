---
keywords: [request capacity units, WCU, RCU, CU usage, optimization tips]
description: Introduces the calculation algorithms for request capacity units (WCU and RCU) and provides tips for optimizing CU usage.
---

# Request Capacity Unit

This document introduces the calculation algorithms for request capacity units. To monitor your service usage, you can visit the [GreptimeCloud Console](https://console.greptime.cloud/).

All requests to GreptimeCloud are measured in capacity units, which reflect the size and complexity of the request. The measurement methods of write capacity unit and read capacity unit are different, see following for details.

### Write capacity unit (WCU)

Each API call to write data to your table is a write request.
WCU is calculated based on the total size of the insert rows in one request.
A standard write capacity unit can write rows up to 1KB.
For rows larger than 1KB, additional write capacity units are required.

:::tip NOTE
The capacity unit may be subject to change in the future.
:::

The following steps are used to determine the size of each request:

1. Get the size of the data type of each column in the table schema. You can find details about the size of each data type in the [Data Types](/reference/sql/data-types.md) documentation.
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

### Read capacity unit (RCU)

Each API call to read data from your table is a read request.
RCU is the data size scanned and loaded into server's memory in one request. 
A standard read capacity unit can scan up to 1MB data. For scanned data larger than 1MB, additional read capacity units are required.

:::tip NOTE
The capacity unit may be subject to change in the future.
:::

Suppose there is a read request scanning 2.5MB data. The RCU of this request is 3 according to calculation algorithm.

To lower the RCU, you can design the table schema and queries carefully. Here are some tips:

- Use indexes to support the efficient execution of queries in GreptimeDB. Without indexes, GreptimeDB must scan the entire table to process the query. If an index matches the query, GreptimeDB can use the index to limit the data scanned. Consider using a column with high cardinality as the primary key and use it in the `WHERE` clause.
- Use queries that match a smaller percentage of data for better selectivity. For instance, an equality match on the time index field and a high cardinality tag field can efficiently limit the data scanned. Note that the inequality operator `!=` is not efficient because it always scans all data.

## Monitoring CU Usage via HTTP Response

GreptimeCloud provides information on CU (Capacity Unit) usage through HTTP response headers. This enhancement allows you to conveniently track CU consumption for requests. For instance, when making a write request like following:

```bash
curl -s -i -XPOST -w '\n' \
    "https://<host>/v1/influxdb/api/v2/write?db=<dbname>&precision=ms&u=<username>&p=<password>" \
    --data-binary \
    'monitor,host=127.0.0.1 cpu=0.1,memory=0.4 1667446797450
     monitor,host=127.0.0.2 cpu=0.2,memory=0.3 1667446798450
     monitor,host=127.0.0.1 cpu=0.5,memory=0.2 1667446798450'
```

The response headers will include information such as:

```
HTTP/2 204 
date: Wed, 10 Apr 2024 03:29:36 GMT
x-greptime-metrics: {"greptime_cloud_wcu":1}
strict-transport-security: max-age=15724800; includeSubDomains
access-control-allow-origin: *
access-control-allow-credentials: true
access-control-allow-methods: OPTIONS
access-control-allow-headers: DNT,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization
access-control-max-age: 1728000
```

Here, the `x-greptime-metrics` header includes the value of `greptime_cloud_wcu`, indicating the consumed WCU for the particular write request. Similarly, for read requests, you can inspect `greptime_cloud_rcu`. This capability provides valuable insights into CU utilization, facilitating better resource management and optimization efforts.

## Usage metrics

You can view the usage at the [GreptimeCloud Console](https://console.greptime.cloud/).
The maximum WCU and RCU utilized are aggregated by time range and presented in the usage charts.
