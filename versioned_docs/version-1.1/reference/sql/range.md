---
keywords: [range queries, time series data, SQL syntax, FILL options, TO options, BY options, ORDER BY, nested range expressions]
description: Explains range queries in SQL for time series data, including syntax, FILL options, TO options, BY options, ORDER BY in aggregate functions, and nested range expressions.
---

# RANGE QUERY

Querying and aggregating data within a range of time is a common query pattern for time series data, such as the `Range selector` in `PromQL`. GreptimeDB supports Range queries in SQL, which is used to summarize time series data into time chunks and aggregate data on time chunks. As part of the `SELECT` statement, Range query can be flexibly combined with SQL to provide more powerful time series data query capabilities in SQL.

## Syntax

Range query uses `Time Index` column as the timeline basis for aggregation. A legal Range query syntax structure is as follows:

```sql
SELECT
  AGGR_FUNCTION(column1, column2,..) RANGE INTERVAL [FILL FILL_OPTION],
  ...
FROM table_name
  [ WHERE <where_clause>]
ALIGN INTERVAL [ TO TO_OPTION ] [BY (columna, columnb,..)] [FILL FILL_OPTION]
  [ ORDER BY <order_by_clause>]
[ LIMIT <limit_clause>];

INTERVAL :=  TIME_INTERVAL | ( INTERVAL expr ) 
```

- Keyword `ALIGN`, required field, followed by parameter `INTERVAL`, `ALIGN` specifies the step of Range query.
   - Subkeyword `TO`, optional field, specifies the time point to which Range query is aligned. For legal `TO_OPTION` parameters, see [TO Option](#to-option).
   - Subkeyword `BY`, optional field, followed by parameter `(columna, columnb,..)`, describes the aggregate key. For legal `BY_OPTION` parameters, see [BY Option](#by-option).
- The parameter `INTERVAL` is mainly used to give the length of a period of time. There are two parameter forms:
   - Strings based on the `PromQL Time Durations` format (eg: `3h`, `1h30m`). Visit the [Prometheus documentation](https://prometheus.io/docs/prometheus/latest/querying/basics/#float-literals-and-time-durations) for a more detailed description of this format.
   - `Interval` type. To use the `Interval` type, you need to carry parentheses, (for example: `('1 year 3 hours 20 minutes'::INTERVAL)`). Visit [Interval](./data-types.md#interval-type) for a more detailed description of this format.
- `AGGR_FUNCTION(column1, column2,..) RANGE INTERVAL [FILL FILL_OPTION]` is called a Range expression.
   - `AGGR_FUNCTION(column1, column2,..)` is an aggregate function that represents the expression that needs to be aggregated.
   - Keyword `RANGE`, required field, followed by parameter `INTERVAL` specifies the time range of each data aggregation.
   - Keyword `FILL`, optional field, please see [`FILL` Option](#fill-option) for details.
   - Range expressions can be combined with other operations to implement more complex queries. For details, see [Nested Range Expressions](#nested-range-expressions).
- `FILL` keyword after `ALIGN`, optional field. See [FILL Option](#fill-option) for details.

## `FILL` Option

The `FILL` option specifies the data filling method when there is no data in an aggregated time slot, or the value of the aggregate field is empty.

The `FILL` keyword can be used after the `RANGE` keyword to indicate the filling method for the Range expression.
The `FILL` keyword can also be used after the `ALIGN` keyword to specify the default filling method for a Range expression
if no fill option is provided.

For example, in the following SQL code,
the `max(val) RANGE '10s'` Range expression uses the fill option `LINEAR`, while the `min(val) RANGE '10s'` Range expression,
which does not specify a fill option, uses the fill option `PREV` specified after the `ALIGN` keyword.

```sql
SELECT 
    ts, 
    host, 
    min(val) RANGE '10s',
    max(val) RANGE '10s' FILL LINEAR 
FROM host_val 
ALIGN '5s' BY (host) FILL PREV;
```

`FILL` has the following filling methods:

|   FILL   |                                                                                               DESCRIPTION                                                                                                |
| :------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|  `NULL`  |                                                                                Fill directly with `NULL`                                                                                |
|  `PREV`  |                                                                                    Fill with data from previous point                                                                                    |
| `LINEAR` | Use [linear interpolation](https://en.wikipedia.org/wiki/Linear_interpolation) to fill the data. If an integer type is filled with `LINEAR`, the variable type of the column will be implicitly converted to a floating point type during calculation |
|   `X`    |                                           Fill in a constant, the data type of the constant must be consistent with the variable type of the Range expression                                            |

Take the following table as an example:

```sql
DROP TABLE IF EXISTS host_val;
CREATE TABLE host_val (
    ts TIMESTAMP TIME INDEX,
    host STRING,
    val DOUBLE,
    PRIMARY KEY (host)
);

INSERT INTO host_val VALUES
    ('1970-01-01 00:00:00', 'host1', 0),
    ('1970-01-01 00:00:15', 'host1', 6),
    ('1970-01-01 00:00:00', 'host2', 6),
    ('1970-01-01 00:00:15', 'host2', 12);
```

```sql
+---------------------+-------+------+
| ts                  | host  | val  |
+---------------------+-------+------+
| 1970-01-01 00:00:00 | host1 |    0 |
| 1970-01-01 00:00:15 | host1 |    6 |
| 1970-01-01 00:00:00 | host2 |    6 |
| 1970-01-01 00:00:15 | host2 |   12 |
+---------------------+-------+------+
```

The result of each `FILL` option is as follows:

<Tabs>

<TabItem value="NO FILL" label="NO FILL">

```sql
SELECT ts, host, min(val) RANGE '5s' FROM host_val ALIGN '5s';
```

```sql
+---------------------+-------+----------------------------+
| ts                  | host  | min(host_val.val) RANGE 5s |
+---------------------+-------+----------------------------+
| 1970-01-01 00:00:00 | host1 |                          0 |
| 1970-01-01 00:00:15 | host1 |                          6 |
| 1970-01-01 00:00:00 | host2 |                          6 |
| 1970-01-01 00:00:15 | host2 |                         12 |
+---------------------+-------+----------------------------+
```

</TabItem>

<TabItem value="FILL NULL" label="FILL NULL">

```sql
SELECT ts, host, min(val) RANGE '5s' FILL NULL FROM host_val ALIGN '5s';
```

```sql
+---------------------+-------+--------------------------------------+
| ts                  | host  | min(host_val.val) RANGE 5s FILL NULL |
+---------------------+-------+--------------------------------------+
| 1970-01-01 00:00:00 | host2 |                                    6 |
| 1970-01-01 00:00:05 | host2 |                                 NULL |
| 1970-01-01 00:00:10 | host2 |                                 NULL |
| 1970-01-01 00:00:15 | host2 |                                   12 |
| 1970-01-01 00:00:00 | host1 |                                    0 |
| 1970-01-01 00:00:05 | host1 |                                 NULL |
| 1970-01-01 00:00:10 | host1 |                                 NULL |
| 1970-01-01 00:00:15 | host1 |                                    6 |
+---------------------+-------+--------------------------------------+

```

</TabItem>

<TabItem value="FILL PREV" label="FILL PREV">

```sql
SELECT ts, host, min(val) RANGE '5s' FILL PREV FROM host_val ALIGN '5s';
```

```sql
+---------------------+-------+--------------------------------------+
| ts                  | host  | min(host_val.val) RANGE 5s FILL PREV |
+---------------------+-------+--------------------------------------+
| 1970-01-01 00:00:00 | host1 |                                    0 |
| 1970-01-01 00:00:05 | host1 |                                    0 |
| 1970-01-01 00:00:10 | host1 |                                    0 |
| 1970-01-01 00:00:15 | host1 |                                    6 |
| 1970-01-01 00:00:00 | host2 |                                    6 |
| 1970-01-01 00:00:05 | host2 |                                    6 |
| 1970-01-01 00:00:10 | host2 |                                    6 |
| 1970-01-01 00:00:15 | host2 |                                   12 |
+---------------------+-------+--------------------------------------+
```

</TabItem>

<TabItem value="FILL LINEAR" label="FILL LINEAR">

```sql
SELECT ts, host, min(val) RANGE '5s' FILL LINEAR FROM host_val ALIGN '5s';
```

```sql
+---------------------+-------+----------------------------------------+
| ts                  | host  | min(host_val.val) RANGE 5s FILL LINEAR |
+---------------------+-------+----------------------------------------+
| 1970-01-01 00:00:00 | host2 |                                      6 |
| 1970-01-01 00:00:05 | host2 |                                      8 |
| 1970-01-01 00:00:10 | host2 |                                     10 |
| 1970-01-01 00:00:15 | host2 |                                     12 |
| 1970-01-01 00:00:00 | host1 |                                      0 |
| 1970-01-01 00:00:05 | host1 |                                      2 |
| 1970-01-01 00:00:10 | host1 |                                      4 |
| 1970-01-01 00:00:15 | host1 |                                      6 |
+---------------------+-------+----------------------------------------+
```

</TabItem>

<TabItem value="FILL Constant Value 6.0" label="FILL Constant Value 6.0">

```sql [FILL Constant Value 6.0]
SELECT ts, host, min(val) RANGE '5s' FILL 6 FROM host_val ALIGN '5s';
```

```sql
+---------------------+-------+-----------------------------------+
| ts                  | host  | min(host_val.val) RANGE 5s FILL 6 |
+---------------------+-------+-----------------------------------+
| 1970-01-01 00:00:00 | host2 |                                 6 |
| 1970-01-01 00:00:05 | host2 |                                 6 |
| 1970-01-01 00:00:10 | host2 |                                 6 |
| 1970-01-01 00:00:15 | host2 |                                12 |
| 1970-01-01 00:00:00 | host1 |                                 0 |
| 1970-01-01 00:00:05 | host1 |                                 6 |
| 1970-01-01 00:00:10 | host1 |                                 6 |
| 1970-01-01 00:00:15 | host1 |                                 6 |
+---------------------+-------+-----------------------------------+
```

</TabItem>

</Tabs>

If there are multiple Range expressions but only one of them specifies the `Fill` option, the other Range expressions will use the `FILL NULL` method to fill in the missing time slots.
The following two SQL statements are equivalent in output:

```sql
SELECT 
    ts, 
    host, 
    min(val) RANGE '10s',
    max(val) RANGE '10s' FILL LINEAR 
FROM host_val 
ALIGN '5s';
```

```sql
SELECT 
    ts, 
    host, 
    min(val) RANGE '10s' FILL NULL,
    max(val) RANGE '10s' FILL LINEAR 
FROM host_val 
ALIGN '5s';
```

The result of the above SQL is as follows:

```sql
+---------------------+-------+---------------------------------------+-----------------------------------------+
| ts                  | host  | min(host_val.val) RANGE 10s FILL NULL | max(host_val.val) RANGE 10s FILL LINEAR |
+---------------------+-------+---------------------------------------+-----------------------------------------+
| 1969-12-31 23:59:55 | host1 |                                     0 |                                       0 |
| 1970-01-01 00:00:00 | host1 |                                     0 |                                       0 |
| 1970-01-01 00:00:05 | host1 |                                  NULL |                      2.9999999999999996 |
| 1970-01-01 00:00:10 | host1 |                                     6 |                                       6 |
| 1970-01-01 00:00:15 | host1 |                                     6 |                                       6 |
| 1969-12-31 23:59:55 | host2 |                                     6 |                                       6 |
| 1970-01-01 00:00:00 | host2 |                                     6 |                                       6 |
| 1970-01-01 00:00:05 | host2 |                                  NULL |                                       9 |
| 1970-01-01 00:00:10 | host2 |                                    12 |                                      12 |
| 1970-01-01 00:00:15 | host2 |                                    12 |                                      12 |
+---------------------+-------+---------------------------------------+-----------------------------------------+
```

## `TO` Option

The `TO` keyword specifies the origin time point to which the range query is aligned.
`TO` option along with `RANGE` option and `ALIGN INTERVAL` determine the time range windows.
Please refer to [Time Range Window](/user-guide/query-data/sql.md#time-range-window) for details.

The default value of the `TO` option is the current query client timezone. To set the timezone,
please refer to [MySQL client](/user-guide/protocols/mysql.md#time-zone) or [PostgreSQL client](/user-guide/protocols/postgresql.md#time-zone).
Other valid `TO` options are:

|     TO      |                                     DESCRIPTION                                      |
| :---------: | :----------------------------------------------------------------------------------: |
|    `NOW`    |                             Align to current query time                              |
| `Timestamp` | Align to a user-specified timestamp, supports timestamp format `RFC3339` / `ISO8601` |


Suppose we have a table `host_val` with the following data:

```sql
DROP TABLE IF EXISTS host_val;
CREATE TABLE host_val (
    ts TIMESTAMP TIME INDEX,
    host STRING,
    val DOUBLE,
    PRIMARY KEY (host)
);

INSERT INTO host_val VALUES
    ('2023-01-01 23:00:00', 'host1', 0),
    ('2023-01-02 01:00:00', 'host1', 1),
    ('2023-01-01 23:00:00', 'host2', 2),
    ('2023-01-02 01:00:00', 'host2', 3);
```

```sql
+---------------------+-------+------+
| ts                  | host  | val  |
+---------------------+-------+------+
| 2023-01-01 23:00:00 | host1 |    0 |
| 2023-01-02 01:00:00 | host1 |    1 |
| 2023-01-01 23:00:00 | host2 |    2 |
| 2023-01-02 01:00:00 | host2 |    3 |
+---------------------+-------+------+
```

The query results by each `TO` options shown below:

<Tabs>

<TabItem value="Default to timezone" label="Default to timezone">

```sql
-- Querying the database timezone using the MySQL protocol, currently in the UTC timezone
SELECT @@time_zone;
```

```sql
+-------------+
| @@time_zone |
+-------------+
| UTC         |
+-------------+
```

```sql
-- If we do not specify the `TO` keyword,
-- the timezone will be used as the default origin alignment time. 
SELECT ts, host, min(val) RANGE '1d' FROM host_val ALIGN '1d';
```

```sql
+---------------------+-------+----------------------------+
| ts                  | host  | min(host_val.val) RANGE 1d |
+---------------------+-------+----------------------------+
| 2023-01-01 00:00:00 | host1 |                          0 |
| 2023-01-02 00:00:00 | host1 |                          1 |
| 2023-01-01 00:00:00 | host2 |                          2 |
| 2023-01-02 00:00:00 | host2 |                          3 |
+---------------------+-------+----------------------------+
```

</TabItem>

<TabItem value="NOW" label="NOW">

```sql
-- If you want to align the origin time to the current time,
-- use the `NOW` keyword.
-- Assume that the current query time is `2023-01-02T09:16:40.503000`.
SELECT ts, host, min(val) RANGE '1d' FROM host_val ALIGN '1d' TO NOW;
```

```sql
+----------------------------+-------+----------------------------+
| ts                         | host  | min(host_val.val) RANGE 1d |
+----------------------------+-------+----------------------------+
| 2023-01-01 09:54:55.456000 | host1 |                          0 |
| 2023-01-01 09:54:55.456000 | host2 |                          2 |
+----------------------------+-------+----------------------------+

```

</TabItem>

<TabItem value="Specific Timestamp" label="Specific Timestamp">

```sql
-- If you want to align the origin time to a specific timestamp,
-- for example, "+08:00" Beijing time on December 1, 2023,
-- you can set the `TO` option to the specific timestamp '2023-01-01T00:00:00+08:00'.
SELECT ts, host, min(val) RANGE '1d' FROM host_val ALIGN '1d' TO '2023-01-01T00:00:00+08:00';
```

```sql
+---------------------+-------+----------------------------+
| ts                  | host  | min(host_val.val) RANGE 1d |
+---------------------+-------+----------------------------+
| 2023-01-01 16:00:00 | host1 |                          0 |
| 2023-01-01 16:00:00 | host2 |                          2 |
+---------------------+-------+----------------------------+

```

</TabItem>

</Tabs>

If you want to query data for a specific time range, you can specify the timestamp using the `TO` keyword.
For example, to query the daily minimum value of `val` between `00:45` and `06:45`,
you can use `2023-01-01T00:45:00` as the `TO` option along with a `6h` range.

```sql
SELECT ts, host, min(val) RANGE '6h' FROM host_val ALIGN '1d' TO '2023-01-01T00:45:00';
```

```sql
+---------------------+-------+----------------------------+
| ts                  | host  | min(host_val.val) RANGE 6h |
+---------------------+-------+----------------------------+
| 2023-01-02 00:45:00 | host2 |                          3 |
| 2023-01-02 00:45:00 | host1 |                          1 |
+---------------------+-------+----------------------------+
```

## `BY` Option

`BY` option describes the aggregate key. If this field is not given, the primary key of the table is used as the aggregate key by default. If the table does not specify a primary key, the `BY` keyword cannot be omitted.

Suppose we have a tale `host_val` with the following data:

```sql
DROP TABLE IF EXISTS host_val;
CREATE TABLE host_val (
    ts TIMESTAMP TIME INDEX,
    host STRING,
    val DOUBLE,
    PRIMARY KEY (host)
);

INSERT INTO host_val VALUES
    ('2023-01-01 23:00:00', 'host1', 0),
    ('2023-01-02 01:00:00', 'host1', 1),
    ('2023-01-01 23:00:00', 'host2', 2),
    ('2023-01-02 01:00:00', 'host2', 3);
```

```sql
+---------------------+-------+------+
| ts                  | host  | val  |
+---------------------+-------+------+
| 2023-01-01 23:00:00 | host1 |    0 |
| 2023-01-02 01:00:00 | host1 |    1 |
| 2023-01-01 23:00:00 | host2 |    2 |
| 2023-01-02 01:00:00 | host2 |    3 |
+---------------------+-------+------+
```

The following SQL uses `host` as the aggregate key:

```sql
SELECT 
    ts, 
    host, 
    min(val) RANGE '10s' 
FROM host_val ALIGN '5s' BY (host);
```

```sql
+---------------------+-------+-----------------------------+
| ts                  | host  | min(host_val.val) RANGE 10s |
+---------------------+-------+-----------------------------+
| 2023-01-01 22:59:55 | host1 |                           0 |
| 2023-01-01 23:00:00 | host1 |                           0 |
| 2023-01-02 00:59:55 | host1 |                           1 |
| 2023-01-02 01:00:00 | host1 |                           1 |
| 2023-01-01 22:59:55 | host2 |                           2 |
| 2023-01-01 23:00:00 | host2 |                           2 |
| 2023-01-02 00:59:55 | host2 |                           3 |
| 2023-01-02 01:00:00 | host2 |                           3 |
+---------------------+-------+-----------------------------+
```

You can also use the `BY` keyword to declare other columns as the basis for data aggregation.
For example, the following RANGE query uses the string length `length(host)` of the `host` column as the basis for data aggregation.

```sql
SELECT 
    ts, 
    length(host), 
    min(val) RANGE '10s' 
FROM host_val ALIGN '5s' BY (length(host));
```

Get after running

```sql
+---------------------+---------------------------------+-----------------------------+
| ts                  | character_length(host_val.host) | min(host_val.val) RANGE 10s |
+---------------------+---------------------------------+-----------------------------+
| 2023-01-01 22:59:55 |                               5 |                           0 |
| 2023-01-01 23:00:00 |                               5 |                           0 |
| 2023-01-02 00:59:55 |                               5 |                           1 |
| 2023-01-02 01:00:00 |                               5 |                           1 |
+---------------------+---------------------------------+-----------------------------+
```

You can explicitly use `BY ()`,
which means you do not need to use aggregation keys and aggregate all data into a group.
**However, if you omit the `BY` keyword directly, it means using the primary key of the table as the aggregate key.**

```sql
SELECT
     ts,
     min(val) RANGE '10s'
FROM host_val ALIGN '5s' BY ();
```

Get after running

```sql
+---------------------+-----------------------------+
| ts                  | min(host_val.val) RANGE 10s |
+---------------------+-----------------------------+
| 2023-01-01 22:59:55 |                           0 |
| 2023-01-01 23:00:00 |                           0 |
| 2023-01-02 00:59:55 |                           1 |
| 2023-01-02 01:00:00 |                           1 |
+---------------------+-----------------------------+
```

## `ORDER BY` option in aggregate functions

Range queries support the use of `order by` expressions in the parameters of the `first_value` and `last_value` aggregate functions. By default, the data is sorted in ascending order based on the time index column.

Take this table as an example:

```sql
DROP TABLE IF EXISTS host_val;
CREATE TABLE host_val (
    ts TIMESTAMP TIME INDEX,
    host STRING,
    val DOUBLE,
    addon DOUBLE,
    PRIMARY KEY (host)
);

INSERT INTO host_val VALUES
    ('1970-01-01 00:00:00', 'host1', 0, 3),
    ('1970-01-01 00:00:01', 'host1', 1, 2),
    ('1970-01-01 00:00:02', 'host1', 2, 1);
```

```sql
+---------------------+-------+------+-------+
| ts                  | host  | val  | addon |
+---------------------+-------+------+-------+
| 1970-01-01 00:00:00 | host1 |    0 |     3 |
| 1970-01-01 00:00:01 | host1 |    1 |     2 |
| 1970-01-01 00:00:02 | host1 |    2 |     1 |
+---------------------+-------+------+-------+
```

When the `order by` expression is not specified in the function parameter, the default behavior is to sort the data in ascending order based on the time index column. The following two SQL statements are equivalent:

```sql
SELECT ts, first_value(val) RANGE '5s', last_value(val) RANGE '5s' FROM host_val ALIGN '5s';
```

```sql
SELECT ts, first_value(val order by ts ASC) RANGE '5s', last_value(val order by ts ASC) RANGE '5s' FROM host_val ALIGN '5s';
```

Get after query

```sql
+---------------------+------------------------------------+-----------------------------------+
| ts                  | first_value(host_val.val) RANGE 5s | last_value(host_val.val) RANGE 5s |
+---------------------+------------------------------------+-----------------------------------+
| 1970-01-01 00:00:00 |                                  0 |                                 2 |
+---------------------+------------------------------------+-----------------------------------+
```

You can specify your own sorting rules. For example, the following SQL sorts the data by the `addon` column in ascending order:

```sql
SELECT ts, first_value(val ORDER BY addon ASC) RANGE '5s', last_value(val ORDER BY addon ASC) RANGE '5s' FROM host_val ALIGN '5s';
```

Get after query

```sql
+---------------------+-----------------------------------------------------------------------------+----------------------------------------------------------------------------+
| ts                  | first_value(host_val.val) ORDER BY [host_val.addon ASC NULLS LAST] RANGE 5s | last_value(host_val.val) ORDER BY [host_val.addon ASC NULLS LAST] RANGE 5s |
+---------------------+-----------------------------------------------------------------------------+----------------------------------------------------------------------------+
| 1970-01-01 00:00:00 |                                                                           2 |                                                                          0 |
+---------------------+-----------------------------------------------------------------------------+----------------------------------------------------------------------------+
```

## Nested Range Expressions

Range expressions support flexible nesting, and range expressions can be combined with various operations to provide more powerful query capabilities.

Take the following table as an example:

```sql
DROP TABLE IF EXISTS host_val;
CREATE TABLE host_val (
    ts TIMESTAMP TIME INDEX,
    host STRING,
    val DOUBLE,
    PRIMARY KEY (host)
);

INSERT INTO host_val VALUES
    ('2023-01-01 08:00:00', 'host1', 1.1),
    ('2023-01-01 08:00:05', 'host1', 2.2),
    ('2023-01-01 08:00:00', 'host2', 3.3),
    ('2023-01-01 08:00:05', 'host2', 4.4);
```

```sql
+---------------------+-------+------+
| ts                  | host  | val  |
+---------------------+-------+------+
| 2023-01-01 08:00:00 | host1 |  1.1 |
| 2023-01-01 08:00:05 | host1 |  2.2 |
| 2023-01-01 08:00:00 | host2 |  3.3 |
| 2023-01-01 08:00:05 | host2 |  4.4 |
+---------------------+-------+------+
```

1. Aggregation functions support calculations both internally and externally:

```sql
SELECT ts, host, 2.0 * min(val * 2.0) RANGE '10s' FROM host_val ALIGN '5s';
```

Get after running

```sql
+---------------------+-------+-------------------------------------------------------+
| ts                  | host  | Float64(2) * min(host_val.val * Float64(2)) RANGE 10s |
+---------------------+-------+-------------------------------------------------------+
| 2023-01-01 07:59:55 | host1 |                                                   4.4 |
| 2023-01-01 08:00:00 | host1 |                                                   4.4 |
| 2023-01-01 08:00:05 | host1 |                                                   8.8 |
| 2023-01-01 07:59:55 | host2 |                                                  13.2 |
| 2023-01-01 08:00:00 | host2 |                                                  13.2 |
| 2023-01-01 08:00:05 | host2 |                                                  17.6 |
+---------------------+-------+-------------------------------------------------------+
```


2. Scalar functions are supported both inside and outside aggregate functions:
    - `min(round(val)) RANGE '10s'` means that each value is rounded using the `round` function before aggregation
    - `round(min(val) RANGE '10s')` means rounding the result of each aggregation using the `round` function

```sql
SELECT ts, host, min(round(val)) RANGE '10s' FROM host_val ALIGN '5s';
```
Get after running

```sql
+---------------------+-------+------------------------------------+
| ts                  | host  | min(round(host_val.val)) RANGE 10s |
+---------------------+-------+------------------------------------+
| 2023-01-01 07:59:55 | host1 |                                  1 |
| 2023-01-01 08:00:00 | host1 |                                  1 |
| 2023-01-01 08:00:05 | host1 |                                  2 |
| 2023-01-01 07:59:55 | host2 |                                  3 |
| 2023-01-01 08:00:00 | host2 |                                  3 |
| 2023-01-01 08:00:05 | host2 |                                  4 |
+---------------------+-------+------------------------------------+
```


```sql
SELECT ts, host, round(min(val) RANGE '10s') FROM host_val ALIGN '5s';
```

Get after running

```sql
+---------------------+-------+------------------------------------+
| ts                  | host  | round(min(host_val.val) RANGE 10s) |
+---------------------+-------+------------------------------------+
| 2023-01-01 07:59:55 | host2 |                                  3 |
| 2023-01-01 08:00:00 | host2 |                                  3 |
| 2023-01-01 08:00:05 | host2 |                                  4 |
| 2023-01-01 07:59:55 | host1 |                                  1 |
| 2023-01-01 08:00:00 | host1 |                                  1 |
| 2023-01-01 08:00:05 | host1 |                                  2 |
+---------------------+-------+------------------------------------+
```

3. Multiple Range expressions can also evaluate together, and Range expressions support the distributive law. The following two Range query are legal and equivalent:

```sql
SELECT ts, host, max(val) RANGE '10s' - min(val) RANGE '10s' FROM host_val ALIGN '5s';
```

```sql
SELECT ts, host, (max(val) - min(val)) RANGE '10s' FROM host_val ALIGN '5s';
```

Get after running

```sql
+---------------------+-------+-----------------------------------------------------------+
| ts                  | host  | max(host_val.val) RANGE 10s - min(host_val.val) RANGE 10s |
+---------------------+-------+-----------------------------------------------------------+
| 2023-01-01 07:59:55 | host2 |                                                         0 |
| 2023-01-01 08:00:00 | host2 |                                        1.1000000000000005 |
| 2023-01-01 08:00:05 | host2 |                                                         0 |
| 2023-01-01 07:59:55 | host1 |                                                         0 |
| 2023-01-01 08:00:00 | host1 |                                                       1.1 |
| 2023-01-01 08:00:05 | host1 |                                                         0 |
+---------------------+-------+-----------------------------------------------------------+
```

But note that the `RANGE` keyword apply to the expression before the `RANGE` keyword. The following Range query is illegal because the `RANGE` keyword apply to the expression `2.0`, not the expression `min(val * 2.0) * 2.0`

```sql
SELECT ts, host, min(val * 2.0) * 2.0 RANGE '10s' FROM host_val ALIGN '5s';
```

```sql
ERROR 1815 (HY000): sql parser error: Can't use the RANGE keyword in Expr 2.0 without function
```

Expressions can be bracketed, and the `RANGE` keyword is automatically applied to any aggregate functions contained within the brackets:

```sql
SELECT ts, host, (min(val * 2.0) * 2.0) RANGE '10s' FROM host_val ALIGN '5s';
```

After running, we get:

```sql
+---------------------+-------+-------------------------------------------------------+
| ts                  | host  | min(host_val.val * Float64(2)) RANGE 10s * Float64(2) |
+---------------------+-------+-------------------------------------------------------+
| 2023-01-01 07:59:55 | host2 |                                                  13.2 |
| 2023-01-01 08:00:00 | host2 |                                                  13.2 |
| 2023-01-01 08:00:05 | host2 |                                                  17.6 |
| 2023-01-01 07:59:55 | host1 |                                                   4.4 |
| 2023-01-01 08:00:00 | host1 |                                                   4.4 |
| 2023-01-01 08:00:05 | host1 |                                                   8.8 |
+---------------------+-------+-------------------------------------------------------+
```

Nesting of Range expressions is not allowed. Nested Range queries are illegal:

```sql
SELECT ts, host, max(min(val) RANGE '10s') RANGE '10s' FROM host_val ALIGN '5s';
```

```sql
ERROR 1815 (HY000): Range Query: Nest Range Query is not allowed
```

