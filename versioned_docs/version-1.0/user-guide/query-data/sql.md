---
keywords: [pg, pgsql, SQL queries, data filtering, time zone handling, functions, range queries, aggregations, GreptimeDB SQL]
description: Comprehensive guide on querying data in GreptimeDB using SQL, covering basic queries, filtering, time zone handling, functions, and advanced features like range queries and aggregations.
---

# SQL

GreptimeDB supports full SQL for querying data from a database.

In this document, we will use the `monitor` table to demonstrate how to query data.
For instructions on creating the `monitor` table and inserting data into it,
Please refer to [table management](/user-guide/deployments-administration/manage-data/basic-table-operations.md#create-a-table) and [Ingest Data](/user-guide/ingest-data/for-iot/sql.md).

## Basic query

The query is represented by the `SELECT` statement.
For example, the following query selects all data from the `monitor` table:

```sql
SELECT * FROM monitor;
```

The query result looks like the following:

```sql
+-----------+---------------------+------+--------+
| host      | ts                  | cpu  | memory |
+-----------+---------------------+------+--------+
| 127.0.0.1 | 2022-11-03 03:39:57 |  0.1 |    0.4 |
| 127.0.0.1 | 2022-11-03 03:39:58 |  0.5 |    0.2 |
| 127.0.0.2 | 2022-11-03 03:39:58 |  0.2 |    0.3 |
+-----------+---------------------+------+--------+
3 rows in set (0.00 sec)
```

Functions are also supported in the `SELECT` field list.
For example, you can use the `count()` function to retrieve the total number of rows in the table:

```sql
SELECT count(*) FROM monitor;
```

```sql
+-----------------+
| COUNT(UInt8(1)) |
+-----------------+
|               3 |
+-----------------+
```

The `avg()` function returns the average value of a certain field:

```sql
SELECT avg(cpu) FROM monitor;
```

```sql
+---------------------+
| AVG(monitor.cpu)    |
+---------------------+
| 0.26666666666666666 |
+---------------------+
1 row in set (0.00 sec)
```

You can also select only the result of a function.
For example, you can extract the day of the year from a timestamp.
The `DOY` in the SQL statement is the abbreviation of `day of the year`:

```sql
SELECT date_part('DOY', '2021-07-01 00:00:00');
```

Output:

```sql
+----------------------------------------------------+
| date_part(Utf8("DOY"),Utf8("2021-07-01 00:00:00")) |
+----------------------------------------------------+
|                                                182 |
+----------------------------------------------------+
1 row in set (0.003 sec)
```

The parameters and results of date functions align with the SQL client's time zone.
For example, when the client's time zone is set to `+08:00`, the results of the two queries below are the same:

```sql
select to_unixtime('2024-01-02 00:00:00');
select to_unixtime('2024-01-02 00:00:00+08:00');
```

Please refer to [SELECT](/reference/sql/select.md) and [Functions](/reference/sql/functions/overview.md) for more information.

## Limit the number of rows returned

Time series data is typically massive.
To save bandwidth and improve query performance,
you can use the `LIMIT` clause to restrict the number of rows returned by the `SELECT` statement.

For example, the following query limits the number of rows returned to 10:

```sql
SELECT * FROM monitor LIMIT 10;
```

## Filter data

You can use the `WHERE` clause to filter the rows returned by the `SELECT` statement.

Filtering data by tags or time index is efficient and common in time series scenarios.
For example, the following query filter data by tag `host`:

```sql
SELECT * FROM monitor WHERE host='127.0.0.1';
```

The following query filter data by time index `ts`, and returns the data after `2022-11-03 03:39:57`:

```sql
SELECT * FROM monitor WHERE ts > '2022-11-03 03:39:57';
```

You can also use the `AND` keyword to combine multiple constraints:

```sql
SELECT * FROM monitor WHERE host='127.0.0.1' AND ts > '2022-11-03 03:39:57';
```

### Filter by time index

Filtering data by the time index is a crucial feature in time series databases.

When working with Unix time values, the database treats them based on the type of the column value.
For instance, if the `ts` column in the `monitor` table has a value type of `TimestampMillisecond`,
you can use the following query to filter the data:

The Unix time value `1667446797000` corresponds to the `TimestampMillisecond` type。

```sql
SELECT * FROM monitor WHERE ts > 1667446797000;
```

When working with a Unix time value that doesn't have the precision of the column value,
you need to use the `::` syntax to specify the type of the time value.
This ensures that the database correctly identifies the type.

For example, `1667446797` represents a timestamp in seconds,
which is different from the default millisecond timestamp of the `ts` column.
You need to specify its type as `TimestampSecond` using the `::TimestampSecond` syntax.
This informs the database that the value `1667446797` should be treated as a timestamp in seconds.

```sql
SELECT * FROM monitor WHERE ts > 1667446797::TimestampSecond;
```

For the supported time data types, please refer to [Data Types](/reference/sql/data-types.md#date-and-time-types).

When using standard `RFC3339` or `ISO8601` string literals,
you can directly use them in the filter condition since the precision is clear.

```sql
SELECT * FROM monitor WHERE ts > '2022-07-25 10:32:16.408';
```

Time and date functions are also supported in the filter condition.
For example, use the `now()` function and the `INTERVAL` keyword to retrieve data from the last 5 minutes:

```sql
SELECT * FROM monitor WHERE ts >= now() - '5 minutes'::INTERVAL;
```

For date and time functions, please refer to [Functions](/reference/sql/functions/overview.md) for more information.

### Time zone

A string literal timestamp without time zone information will be interpreted based on the local time zone of the SQL client. For example, the following two queries are equivalent when the client time zone is `+08:00`:

```sql
SELECT * FROM monitor WHERE ts > '2022-07-25 10:32:16.408';
SELECT * FROM monitor WHERE ts > '2022-07-25 10:32:16.408+08:00';
```

All the timestamp column values in query results are formatted based on the client time zone.
For example, the following code shows the same `ts` value formatted in the client time zones `UTC` and `+08:00` respectively.

<Tabs>

<TabItem value="timezone UTC" label="timezone UTC">

```sql
+-----------+---------------------+------+--------+
| host      | ts                  | cpu  | memory |
+-----------+---------------------+------+--------+
| 127.0.0.1 | 2023-12-31 16:00:00 |  0.5 |    0.1 |
+-----------+---------------------+------+--------+
```

</TabItem>

<TabItem value="timezone +08:00" label="timezone +08:00">

```sql
+-----------+---------------------+------+--------+
| host      | ts                  | cpu  | memory |
+-----------+---------------------+------+--------+
| 127.0.0.1 | 2024-01-01 00:00:00 |  0.5 |    0.1 |
+-----------+---------------------+------+--------+
```

</TabItem>
</Tabs>


### Functions

GreptimeDB offers an extensive suite of built-in functions and aggregation
capabilities tailored to meet the demands of data analytics. Its features
include:

- A comprehensive set of functions inherited from Apache Datafusion query
  engine, featuring a selection of date/time functions that adhere to Postgres
  naming conventions and behaviour.
- Logical data type operations for JSON, Geolocation, and other specialized data
  types.
- Advanced full-text matching capabilities.

See [Functions reference](/reference/sql/functions/overview.md) for more details.

## Order By

The order of the returned data is not guaranteed. You need to use the `ORDER BY` clause to sort the returned data.
For example, in time series scenarios, it is common to use the time index column as the sorting key to arrange the data chronologically:

```sql
-- ascending order by ts
SELECT * FROM monitor ORDER BY ts ASC;
```

```sql
-- descending order by ts
SELECT * FROM monitor ORDER BY ts DESC;
```

## `CASE` Expression

You can use the `CASE` statement to perform conditional logic within your queries.
For example, the following query returns the status of the CPU based on the value of the `cpu` field:

```sql
SELECT
    host,
    ts,
    CASE
        WHEN cpu > 0.5 THEN 'high'
        WHEN cpu > 0.3 THEN 'medium'
        ELSE 'low'
    END AS cpu_status
FROM monitor;
```

The result is shown below:

```sql
+-----------+---------------------+------------+
| host      | ts                  | cpu_status |
+-----------+---------------------+------------+
| 127.0.0.1 | 2022-11-03 03:39:57 | low        |
| 127.0.0.1 | 2022-11-03 03:39:58 | medium     |
| 127.0.0.2 | 2022-11-03 03:39:58 | low        |
+-----------+---------------------+------------+
3 rows in set (0.01 sec)
```

For more information, please refer to [CASE](/reference/sql/case.md).

## Aggregate data by tag

You can use the `GROUP BY` clause to group rows that have the same values into summary rows.
The average memory usage grouped by idc:

```sql
SELECT host, avg(cpu) FROM monitor GROUP BY host;
```

```sql
+-----------+------------------+
| host      | AVG(monitor.cpu) |
+-----------+------------------+
| 127.0.0.2 |              0.2 |
| 127.0.0.1 |              0.3 |
+-----------+------------------+
2 rows in set (0.00 sec)
```

Please refer to [GROUP BY](/reference/sql/group_by.md) for more information.

### Find the latest data of time series

To find the latest point of each time series, you can use `DISTINCT ON` together with `ORDER BY` like in [ClickHouse](https://clickhouse.com/docs/en/sql-reference/statements/select/distinct).

```sql
SELECT DISTINCT ON (host) * FROM monitor ORDER BY host, ts DESC;
```

```sql
+-----------+---------------------+------+--------+
| host      | ts                  | cpu  | memory |
+-----------+---------------------+------+--------+
| 127.0.0.1 | 2022-11-03 03:39:58 |  0.5 |    0.2 |
| 127.0.0.2 | 2022-11-03 03:39:58 |  0.2 |    0.3 |
+-----------+---------------------+------+--------+
2 rows in set (0.00 sec)
```

## Aggregate data by time window

GreptimeDB supports [Range Query](/reference/sql/range.md) to aggregate data by time window.

Suppose we have the following data in the [`monitor` table](/user-guide/deployments-administration/manage-data/basic-table-operations.md#create-a-table):

```sql
+-----------+---------------------+------+--------+
| host      | ts                  | cpu  | memory |
+-----------+---------------------+------+--------+
| 127.0.0.1 | 2023-12-13 02:05:41 |  0.5 |    0.2 |
| 127.0.0.1 | 2023-12-13 02:05:46 | NULL |   NULL |
| 127.0.0.1 | 2023-12-13 02:05:51 |  0.4 |    0.3 |
| 127.0.0.2 | 2023-12-13 02:05:41 |  0.3 |    0.1 |
| 127.0.0.2 | 2023-12-13 02:05:46 | NULL |   NULL |
| 127.0.0.2 | 2023-12-13 02:05:51 |  0.2 |    0.4 |
+-----------+---------------------+------+--------+
```

The following query returns the average CPU usage in a 10-second time range and calculates it every 5 seconds:

```sql
SELECT
    ts,
    host,
    avg(cpu) RANGE '10s' FILL LINEAR
FROM monitor
ALIGN '5s' TO '2023-12-01T00:00:00' BY (host) ORDER BY ts ASC;
```

1. `avg(cpu) RANGE '10s' FILL LINEAR` is a Range expression. `RANGE '10s'` specifies that the time range of the aggregation is 10s, and `FILL LINEAR` specifies that if there is no data within a certain aggregation time, use the `LINEAR` method to fill it.
2. `ALIGN '5s'` specifies the that data statistics should be performed in steps of 5s.
3. `TO '2023-12-01T00:00:00` specifies the origin alignment time. The default value is Unix time 0.
4. `BY (host)` specifies the aggregate key. If the `BY` keyword is omitted, the primary key of the data table is used as the aggregate key by default.
5. `ORDER BY ts ASC` specifies the sorting method of the result set. If you do not specify the sorting method, the order of the results is not guaranteed.

The Response is shown below:

```sql
+---------------------+-----------+----------------------------------------+
| ts                  | host      | AVG(monitor.cpu) RANGE 10s FILL LINEAR |
+---------------------+-----------+----------------------------------------+
| 2023-12-13 02:05:35 | 127.0.0.1 |                                    0.5 |
| 2023-12-13 02:05:40 | 127.0.0.1 |                                    0.5 |
| 2023-12-13 02:05:45 | 127.0.0.1 |                                    0.4 |
| 2023-12-13 02:05:50 | 127.0.0.1 |                                    0.4 |
| 2023-12-13 02:05:35 | 127.0.0.2 |                                    0.3 |
| 2023-12-13 02:05:40 | 127.0.0.2 |                                    0.3 |
| 2023-12-13 02:05:45 | 127.0.0.2 |                                    0.2 |
| 2023-12-13 02:05:50 | 127.0.0.2 |                                    0.2 |
+---------------------+-----------+----------------------------------------+
```

### Time range window

The origin time range window steps forward and backward in the time series to generate all time range windows.
In the example above, the origin alignment time is set to `2023-12-01T00:00:00`, which is also the end time of the origin time window.

The `RANGE` option, along with the origin alignment time, defines the origin time range window that starts from `origin alignment timestamp` and ends at `origin alignment timestamp + range`.

The `ALIGN` option defines the query resolution steps.
It determines the calculation steps from the origin time window to other time windows.
For example, with the origin alignment time `2023-12-01T00:00:00` and `ALIGN '5s'`, the alignment times are `2023-11-30T23:59:55`, `2023-12-01T00:00:00`, `2023-12-01T00:00:05`, `2023-12-01T00:00:10`, and so on.

These time windows are left-closed and right-open intervals
that satisfy the condition `[alignment timestamp, alignment timestamp + range)`.

The following images can help you understand the time range window more visually:

When the query resolution is greater than the time range window, the metrics data will be calculated for only one time range window.

![align > range](/align_greater_than_range.png)

When the query resolution is less than the time range window, the metrics data will be calculated for multiple time range windows.

![align < range](/align_less_than_range.png)

### Align to specific timestamp

The alignment times default based on the time zone of the current SQL client session.
You can change the origin alignment time to any timestamp you want. For example, use `NOW` to align to the current time:

```sql
SELECT
    ts,
    host,
    avg(cpu) RANGE '1w'
FROM monitor
ALIGN '1d' TO NOW BY (host);
```

Or use a `ISO 8601` timestamp to align to a specified time:

```sql
SELECT
    ts,
    host,
    avg(cpu) RANGE '1w'
FROM monitor
ALIGN '1d' TO '2023-12-01T00:00:00+08:00' BY (host);
```

### Fill null values

The `FILL` option can be used to fill null values in the data.
In the above example, the `LINEAR` method is used to fill null values.
Other methods are also supported, such as `PREV` and a constant value `X`.
For more information, please refer to the [FILL OPTION](/reference/sql/range.md#fill-option).

### Syntax

Please refer to [Range Query](/reference/sql/range.md) for more information.

## Table name constraints

If your table name contains special characters or uppercase letters,
you must enclose the table name in backquotes.
For examples, please refer to the [Table name constraints](/user-guide/deployments-administration/manage-data/basic-table-operations.md#table-name-constraints) section in the table creation documentation.

## HTTP API

Use POST method to query data:

```shell
curl -X POST \
  -H 'authorization: Basic {{authorization if exists}}' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'sql=select * from monitor' \
http://localhost:4000/v1/sql?db=public
```

The result is shown below:

```json
{
  "code": 0,
  "output": [
    {
      "records": {
        "schema": {
          "column_schemas": [
            {
              "name": "host",
              "data_type": "String"
            },
            {
              "name": "ts",
              "data_type": "TimestampMillisecond"
            },
            {
              "name": "cpu",
              "data_type": "Float64"
            },
            {
              "name": "memory",
              "data_type": "Float64"
            }
          ]
        },
        "rows": [
          ["127.0.0.1", 1667446797450, 0.1, 0.4],
          ["127.0.0.1", 1667446798450, 0.5, 0.2],
          ["127.0.0.2", 1667446798450, 0.2, 0.3]
        ]
      }
    }
  ],
  "execution_time_ms": 0
}
```

For more information about SQL HTTP request, please refer to [API document](/user-guide/protocols/http.md#post-sql-statements).
