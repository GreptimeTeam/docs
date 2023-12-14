# RANGE QUERY

Querying and aggregating data within a range of time is a common query pattern for time series data, such as the `Range selector` in `PromQL`. GreptimeDB supports Range queries in SQL, which is used to summarize time series data into time chunks and aggregate data on time chunks. As part of the `SELECT` statement, Range query can be flexibly combined with SQL to provide more powerful time series data query capabilities in SQL.

## Syntax

Range query uses `Time Index` column as the timeline basis for aggregation. A legal Range query syntax structure is as follows:

```sql
SELECT
  AGGR_FUNCTION(column1, column2,..) RANGE INTERVAL [FILL FILL_OPTION],
  ...
FROM table_name
ALIGN INTERVAL [ TO TO_OPTION ] [BY (columna, columnb,..)] [FILL FILL_OPTION];

INTERVAL :=  TIME_INTERVAL | ( INTERVAL expr ) 
```

- Keyword `ALIGN`, required field, followed by parameter `INTERVAL`, `ALIGN` specifies the step of Range query.
   - Subkeyword `TO`, optional field, specifies the time point to which Range query is aligned. For legal `TO_OPTION` parameters, see [TO Option](#to-option).
   - Subkeyword `BY`, optional field, followed by parameter `(columna, columnb,..)`, describes the aggregate key. For legal `BY_OPTION` parameters, see [BY Option](#by-option).
- The parameter `INTERVAL` is mainly used to give the length of a period of time. There are two parameter forms:
   - Strings based on the `PromQL Time Durations` format (eg: `3h`, `1h30m`). Visit the [Prometheus documentation](https://prometheus.io/docs/prometheus/latest/querying/basics/#time-durations) for a more detailed description of this format.
   - `Interval` type. To use the `Interval` type, you need to carry parentheses, (for example: `(INTERVAL '1 year 3 hours 20 minutes')`). Visit [Interval](./functions.md#interval) for a more detailed description of this format.
- `AGGR_FUNCTION(column1, column2,..) RANGE INTERVAL [FILL FILL_OPTION]` is called a Range expression.
   - `AGGR_FUNCTION(column1, column2,..)` is an aggregate function that represents the expression that needs to be aggregated.
   - Keyword `RANGE`, required field, followed by parameter `INTERVAL` specifies the time range of each data aggregation.
   - Keyword `FILL`, optional field, please see [`FILL` Option](#fill-option) for details.
   - Range expressions can be combined with other operations to implement more complex queries. For details, see [Nested Range Expressions](#nested-range-expressions).
- `FILL` keyword after `ALIGN`, optional field. See [FILL Option](#fill-option) for details.

## `FILL` OPTION

`FILL` option specifies the data filling method when the aggregate field is empty.

The `FILL` keyword can be used after the `RANGE` keyword to indicate the filling method for the Range expression.
The `FILL` keyword can also be used after the `BY` keyword to specify the default filling method for a Range expression
if no fill option is provided.

For example, in the following SQL code,
the `max(cpu) RANGE '10s'` Range expression uses the fill option `LINEAR`, while the `min(cpu) RANGE '10s'` Range expression,
which does not specify a fill option, uses the fill option `PREV` specified after the `BY` keyword.

```sql
SELECT 
    ts, 
    host, 
    min(cpu) RANGE '10s',
    max(cpu) RANGE '10s' FILL LINEAR 
FROM host_cpu 
ALIGN '5s' BY (host) FILL PREV;
```

`FILL` has the following filling methods:

|   FILL   |                                                                                               DESCRIPTION                                                                                                |
| :------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|  `NULL`  |                                                                                Fill directly with `NULL` (default method)                                                                                |
|  `PREV`  |                                                                                    Fill with data from previous point                                                                                    |
| `LINEAR` | Use the data of the two previous points to average. If an integer type is filled with `LINEAR`, the variable type of the column will be implicitly converted to a floating point type during calculation |
|   `X`    |                                           Fill in a constant, the data type of the constant must be consistent with the variable type of the Range expression                                            |


Take the following table as an example:

```sql
+---------------------+-------+------+
| ts                  | host  | cpu  |
+---------------------+-------+------+
| 2023-01-01 08:00:00 | host1 |  4.5 |
| 2023-01-01 08:00:05 | host1 | NULL |
| 2023-01-01 08:00:10 | host1 |  6.5 |
+---------------------+-------+------+
```

The result of each `FILL` option is as follows:

::: code-group

```sql [NULL]

> SELECT ts, min(cpu) RANGE '5s' FILL NULL FROM host_cpu ALIGN '5s';

+---------------------+--------------------------------------+
| ts                  | MIN(host_cpu.cpu) RANGE 5s FILL NULL |
+---------------------+--------------------------------------+
| 2023-01-01 08:00:00 |                                  4.5 |
| 2023-01-01 08:00:05 |                                 NULL |
| 2023-01-01 08:00:10 |                                  6.5 |
+---------------------+--------------------------------------+

```

```sql [PREV]

> SELECT ts, min(cpu) RANGE '5s' FILL PREV FROM host_cpu ALIGN '5s';

+---------------------+--------------------------------------+
| ts                  | MIN(host_cpu.cpu) RANGE 5s FILL PREV |
+---------------------+--------------------------------------+
| 2023-01-01 08:00:00 |                                  4.5 |
| 2023-01-01 08:00:05 |                                  4.5 |
| 2023-01-01 08:00:10 |                                  6.5 |
+---------------------+--------------------------------------+
```

```sql [LINEAR]

> SELECT ts, min(cpu) RANGE '5s' FILL LINEAR FROM host_cpu ALIGN '5s';

+---------------------+----------------------------------------+
| ts                  | MIN(host_cpu.cpu) RANGE 5s FILL LINEAR |
+---------------------+----------------------------------------+
| 2023-01-01 08:00:00 |                                    4.5 |
| 2023-01-01 08:00:05 |                                    5.5 |
| 2023-01-01 08:00:10 |                                    6.5 |
+---------------------+----------------------------------------+
```

```sql [Constant Value 6.0]

> SELECT ts, min(cpu) RANGE '5s' FILL 6.0 FROM host_cpu ALIGN '5s';

+---------------------+-----------------------------------+
| ts                  | MIN(host_cpu.cpu) RANGE 5s FILL 6 |
+---------------------+-----------------------------------+
| 2023-01-01 08:00:00 |                               4.5 |
| 2023-01-01 08:00:05 |                                 6 |
| 2023-01-01 08:00:10 |                               6.5 |
+---------------------+-----------------------------------+
```

:::

## TO OPTION

The `TO` keyword specifies the origin time point to which the range query is aligned.
`TO` option along with `RANGE` option and `ALIGN INTERVAL` determine the time range windows.
Please refer to [Time Range Window](/user-guide/query-data/sql.md#time-range-window) for details.

The default value of `TO` option is Unix time 0. Other valid `TO` options are:

|     TO      |                                     DESCRIPTION                                      |
| :---------: | :----------------------------------------------------------------------------------: |
|    `NOW`    |                             Align to current query time                              |
| `Timestamp` | Align to a user-specified timestamp, supports timestamp format `RFC3339` / `ISO8601` |


Suppose we have a tale `host` with the following data:

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

::: code-group

```sql [Default Unix time 0]

-- If we do not specify the `TO` keyword,
-- the default value Unix time 0 will be used as the alignment time. 

> SELECT ts, host, min(val) RANGE '1d' FROM host ALIGN '1d';

+---------------------+-------+----------------------------------+
| ts                  | host  | MIN(host.val) RANGE 1d FILL NULL |
+---------------------+-------+----------------------------------+
| 2023-01-03 00:00:00 | host2 |                                3 |
| 2023-01-02 00:00:00 | host2 |                                2 |
| 2023-01-03 00:00:00 | host1 |                                1 |
| 2023-01-02 00:00:00 | host1 |                                0 |
+---------------------+-------+----------------------------------+
```

```sql [NOW]

-- If you want to align the query time to the current time,
-- use the `NOW` keyword.
-- Assume that the current query time is `2023-01-02T08:42:46.371000`.

> SELECT ts, host, min(val) RANGE '1d' FROM host ALIGN '1d' TO NOW;

+----------------------------+-------+----------------------------------+
| ts                         | host  | MIN(host.val) RANGE 1d FILL NULL |
+----------------------------+-------+----------------------------------+
| 2023-01-02 08:42:46.371000 | host1 |                                0 |
| 2023-01-02 08:42:46.371000 | host2 |                                2 |
+----------------------------+-------+----------------------------------+

```

```sql [Specific Timestamp]

-- If you want to align the query time to a specific timestamp,
-- for example, "+08:00" Beijing time on December 1, 2023,
-- you can set the `TO` option to the specific timestamp '2023-01-01T00:00:00+08:00'.

SELECT ts, host, min(val) RANGE '1d' FROM host ALIGN '1d' TO '2023-01-01T00:00:00+08:00';

+---------------------+-------+----------------------------------+
| ts                  | host  | MIN(host.val) RANGE 1d FILL NULL |
+---------------------+-------+----------------------------------+
| 2023-01-02 16:00:00 | host2 |                                2 |
| 2023-01-02 16:00:00 | host1 |                                0 |
+---------------------+-------+----------------------------------+

```

:::

If you want to query data for a specific time range, you can specify the timestamp using the `TO` keyword.
For example, to query the daily minimum value of `val` between `00:45` and `06:45`,
you can use `1900-01-01T06:45:00` as the `TO` option along with a `6h` range.

```sql
SELECT ts, host, min(val) RANGE '6h' FROM host ALIGN '1d' TO '1900-01-01T06:45:00';
```

```sql
+---------------------+-------+----------------------------------+
| ts                  | host  | MIN(host.val) RANGE 6h FILL NULL |
+---------------------+-------+----------------------------------+
| 2023-01-02 06:45:00 | host1 |                                1 |
| 2023-01-02 06:45:00 | host2 |                                3 |
+---------------------+-------+----------------------------------+
```

## BY OPTION

`BY` Option describes the aggregate key. If this field is not given, the primary key of the table is used as the aggregate key by default. If the table does not specify a primary key, the `BY` keyword cannot be omitted.

Suppose we have a tale `host` with the following data:

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

The following SQL uses `host` as the aggragate key:

```sql
SELECT 
    ts, 
    host, 
    min(val) RANGE '10s' 
FROM host ALIGN '5s' BY (host);
```

You can also use the `BY` keyword to declare other columns as the basis for data aggregation.
For example, the following RANGE query uses the string length `length(host)` of the `host` column as the basis for data aggregation.

```sql
SELECT 
    ts, 
    length(host), 
    min(val) RANGE '10s' 
FROM host ALIGN '5s' BY (length(host));
```

Get after running

```sql
+---------------------+-----------------------------+-----------------------------------+
| ts                  | character_length(host.host) | MIN(host.val) RANGE 10s FILL NULL |
+---------------------+-----------------------------+-----------------------------------+
| 2023-01-01 23:00:00 |                           5 |                                 0 |
| 2023-01-01 23:00:05 |                           5 |                                 0 |
| 2023-01-02 01:00:05 |                           5 |                                 1 |
| 2023-01-02 01:00:00 |                           5 |                                 1 |
+---------------------+-----------------------------+-----------------------------------+
```

You can explicitly use `BY ()`,
which means you do not need to use aggregation keys and aggregate all data into a group.
**However, if you omit the `BY` keyword directly, it means using the primary key of the table as the aggregate key.**

```sql
SELECT
     ts,
     min(val) RANGE '10s'
FROM host ALIGN '5s' BY ();
```

Get after running

```sql
+---------------------+-----------------------------------+
| ts                  | MIN(host.val) RANGE 10s FILL NULL |
+---------------------+-----------------------------------+
| 2023-01-01 23:00:05 |                                 0 |
| 2023-01-02 01:00:05 |                                 1 |
| 2023-01-01 23:00:00 |                                 0 |
| 2023-01-02 01:00:00 |                                 1 |
+---------------------+-----------------------------------+
```

## Nested Range Expressions

Range expressions support flexible nesting, and range expressions can be combined with various operations to provide more powerful query capabilities.

Take the following table as an example:

```sql
+---------------------+-------+------+
| ts                  | host  | cpu  |
+---------------------+-------+------+
| 2023-01-01 08:00:00 | host1 |  1.1 |
| 2023-01-01 08:00:05 | host1 |  2.2 |
| 2023-01-01 08:00:00 | host2 |  3.3 |
| 2023-01-01 08:00:05 | host2 |  4.4 |
+---------------------+-------+------+
```

1. Aggregation functions support calculations both internally and externally：

```sql
SELECT ts, host, 2.0 * min(cpu * 2.0) RANGE '10s' FROM host_cpu ALIGN '5s';
```

Get after running

```sql
+---------------------+-------+-----------------------------------------------------------------+
| ts                  | host  | Float64(2) * MIN(host_cpu.cpu * Float64(2)) RANGE 10s FILL NULL |
+---------------------+-------+-----------------------------------------------------------------+
| 2023-01-01 08:00:00 | host2 |                                                            13.2 |
| 2023-01-01 08:00:10 | host2 |                                                            17.6 |
| 2023-01-01 08:00:05 | host2 |                                                            13.2 |
| 2023-01-01 08:00:10 | host1 |                                                             8.8 |
| 2023-01-01 08:00:05 | host1 |                                                             4.4 |
| 2023-01-01 08:00:00 | host1 |                                                             4.4 |
+---------------------+-------+-----------------------------------------------------------------+
```


2. Scalar functions are supported both inside and outside aggregate functions:
    - `min(round(cpu)) RANGE '10s'` means that each value is rounded using the `round` function before aggregation
    - `round(min(cpu) RANGE '10s')` means rounding the result of each aggregation using the `round` function

```sql
SELECT ts, host, min(round(cpu)) RANGE '10s' FROM host_cpu ALIGN '5s';
```
Get after running

```sql
+---------------------+-------+----------------------------------------------+
| ts                  | host  | MIN(round(host_cpu.cpu)) RANGE 10s FILL NULL |
+---------------------+-------+----------------------------------------------+
| 2023-01-01 08:00:05 | host1 |                                            1 |
| 2023-01-01 08:00:00 | host1 |                                            1 |
| 2023-01-01 08:00:10 | host1 |                                            2 |
| 2023-01-01 08:00:00 | host2 |                                            3 |
| 2023-01-01 08:00:10 | host2 |                                            4 |
| 2023-01-01 08:00:05 | host2 |                                            3 |
+---------------------+-------+----------------------------------------------+
```


```sql
SELECT ts, host, round(min(cpu) RANGE '10s') FROM host_cpu ALIGN '5s';
```

Get after running

```sql
+---------------------+-------+----------------------------------------------+
| ts                  | host  | round(MIN(host_cpu.cpu) RANGE 10s FILL NULL) |
+---------------------+-------+----------------------------------------------+
| 2023-01-01 08:00:00 | host2 |                                            3 |
| 2023-01-01 08:00:10 | host2 |                                            4 |
| 2023-01-01 08:00:05 | host2 |                                            3 |
| 2023-01-01 08:00:05 | host1 |                                            1 |
| 2023-01-01 08:00:00 | host1 |                                            1 |
| 2023-01-01 08:00:10 | host1 |                                            2 |
+---------------------+-------+----------------------------------------------+
```

3. Multiple Range expressions can also evaluate together, and Range expressions support the distributive law. The following two Range query are legal and equivalent:

```sql
SELECT ts, host, max(cpu) RANGE '10s' - min(cpu) RANGE '10s' FROM host_cpu ALIGN '5s';

SELECT ts, host, (max(cpu) - min(cpu)) RANGE '10s' FROM host_cpu ALIGN '5s';
```

Get after running

```sql
+---------------------+-------+-------------------------------------------------------------------------------+
| ts                  | host  | MAX(host_cpu.cpu) RANGE 10s FILL NULL - MIN(host_cpu.cpu) RANGE 10s FILL NULL |
+---------------------+-------+-------------------------------------------------------------------------------+
| 2023-01-01 08:00:10 | host1 |                                                                             0 |
| 2023-01-01 08:00:05 | host1 |                                                                           1.1 |
| 2023-01-01 08:00:00 | host1 |                                                                             0 |
| 2023-01-01 08:00:05 | host2 |                                                                           1.1 |
| 2023-01-01 08:00:10 | host2 |                                                                             0 |
| 2023-01-01 08:00:00 | host2 |                                                                             0 |
+---------------------+-------+-------------------------------------------------------------------------------+
```

But note that the `RANGE` keyword apply to the expression before the `RANGE` keyword. The following Range query is illegal because the `RANGE` keyword apply to the expression `2.0`, not the expression `min(cpu * 2.0) * 2.0`

```sql
SELECT ts, host, min(cpu * 2.0) * 2.0 RANGE '10s' FROM host_cpu ALIGN '5s';

ERROR 1815 (HY000): sql parser error: Can't use the RANGE keyword in Expr 2.0 without function
```

Expressions can be bracketed, and the `RANGE` keyword is automatically applied to any aggregate functions contained within the brackets:

```sql
SELECT ts, host, (min(cpu * 2.0) * 2.0) RANGE '10s' FROM host_cpu ALIGN '5s';
```

After running, we get:

```sql
+---------------------+-------+-----------------------------------------------------------------+
| ts                  | host  | MIN(host_cpu.cpu * Float64(2)) RANGE 10s FILL NULL * Float64(2) |
+---------------------+-------+-----------------------------------------------------------------+
| 2023-01-01 08:00:00 | host2 |                                                            13.2 |
| 2023-01-01 08:00:10 | host2 |                                                            17.6 |
| 2023-01-01 08:00:05 | host2 |                                                            13.2 |
| 2023-01-01 08:00:00 | host1 |                                                             4.4 |
| 2023-01-01 08:00:10 | host1 |                                                             8.8 |
| 2023-01-01 08:00:05 | host1 |                                                             4.4 |
+---------------------+-------+-----------------------------------------------------------------+
```

Nesting of Range expressions is not allowed. Nested Range queries are illegal:

```sql
SELECT ts, host, max(min(cpu) RANGE '10s') RANGE '10s' FROM host_cpu ALIGN '5s';

ERROR 1815 (HY000): Range Query: Nest Range Query is not allowed
```

