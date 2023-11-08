# RANGE QUERY

Querying and aggregating data within a range of time is a common query pattern for time series data, such as the `Range selector` in `PromQL`. GreptimeDB supports Range queries in SQL, which is used to summarize time series data into time chunks and aggregate data on time chunks. As part of the `SELECT` statement, Range query can be flexibly combined with SQL to provide more powerful time series data query capabilities in SQL.

## Syntax

A legal Range query syntax structure is as follows:

```sql
SELECT
   AGGR_FUNCTION(column1, column2,..) RANGE TIME_INTERVAL [FILL FILL_OPTION],
   ...
FROM table_name
ALIGN TIME_INTERVAL [BY (columna, columnb,..)] [FILL FILL_OPTION];
```

- Keyword `ALIGN`, required field, followed by parameter `TIME_INTERVAL`, specifies the step of Range query.
- `TIME_INTERVAL` follows the `Time Durations` type of `PromQL`, visit [Prometheus documentation](https://prometheus.io/docs/prometheus/latest/querying/basics/#time-durations)
Get more detailed instructions.
- Keyword `BY`, optional field, followed by parameters `(columna, columnb,..)`, describing the aggregate key. If this field is not given, the primary key of the table is used as the aggregate key by default.
- `AGGR_FUNCTION(column1, column2,..) RANGE TIME_INTERVAL [FILL FILL_OPTION]` is called a Range expression.
   - `AGGR_FUNCTION(column1, column2,..)` is an aggregate function that represents the expression that needs to be aggregated
   - Keyword `RANGE`, required field, followed by parameter `TIME_INTERVAL` specifies the time range of each data aggregation,
   - Keyword `FILL`, optional field, followed by parameter `FILL_OPTION` specifies the data filling method when the aggregate field is empty.
   - Range expressions can be combined with other operations to implement more complex queries. For details, see [Nested Range Expressions](#nested-range-expressions).
- The keyword `FILL` can be followed by a Range expression as the data filling method of this Range expression; it can also be placed after `ALIGN` as the default data filling method. See [FILL Option](#fill-option) for legal `FILL_OPTION` parameters.
  
## Example

The following `host_cpu` table records the CPU consumed by two machines `host1` and `host2` at a certain time. This table is used as an example to introduce how to perform Range query.

```sql
+---------------------+-------+------+
| ts                  | host  | cpu  |
+---------------------+-------+------+
| 1970-01-01 08:00:00 | host1 |  1.1 |
| 1970-01-01 08:00:05 | host1 |  2.2 |
| 1970-01-01 08:00:00 | host2 |  3.3 |
| 1970-01-01 08:00:05 | host2 |  4.4 |
+---------------------+-------+------+
```

Create a data table using the following SQL statement:

```sql
CREATE TABLE host_cpu (
   ts timestamp(3) time index,
   host STRING PRIMARY KEY,
   cpu Float64,
);

INSERT INTO TABLE host_cpu VALUES
     (0, 'host1', 1.1),
     (5000, 'host1', 2.2),
     (0, 'host2', 3.3),
     (5000, 'host2', 4.4);
```

Run this Range query:

```sql
SELECT 
    ts, 
    host, 
    min(cpu) RANGE '10s',
    max(cpu) RANGE '10s' FILL LINEAR 
FROM host_cpu 
ALIGN '5s' BY (host) FILL PREV;
```

Get after running

```sql
+---------------------+-------+---------------------------------------+-----------------------------------------+
| ts                  | host  | MIN(host_cpu.cpu) RANGE 10s FILL PREV | MAX(host_cpu.cpu) RANGE 10s FILL LINEAR |
+---------------------+-------+---------------------------------------+-----------------------------------------+
| 1970-01-01 08:00:00 | host2 |                                   3.3 |                                     3.3 |
| 1970-01-01 08:00:05 | host2 |                                   3.3 |                                     4.4 |
| 1970-01-01 08:00:10 | host2 |                                   4.4 |                                     4.4 |
| 1970-01-01 08:00:00 | host1 |                                   1.1 |                                     1.1 |
| 1970-01-01 08:00:05 | host1 |                                   1.1 |                                     2.2 |
| 1970-01-01 08:00:10 | host1 |                                   2.2 |                                     2.2 |
+---------------------+-------+---------------------------------------+-----------------------------------------+
```


The above RANGE query counts the minimum and maximum CPU usage of a machine within 10 seconds every 5 seconds:
1. `ALIGN '5s'` specifies the that data statistics should be performed in steps of 5s. The step is aligned to the calendar.
2. `BY (host)` specifies the aggregate key, and the `BY` keyword supports omission. If the `BY` keyword is omitted, the primary key of the data table is used as the aggregate key by default.
3. `max(cpu) RANGE '10s' FILL LINEAR` is a Range expression. `RANGE '10s'` specifies that the time span of the aggregation is 10s, and `FILL LINEAR` specifies that if there is no data within a certain aggregation time, use the `LINEAR` method to fill it.
4. The `FILL` keyword can follow the `RANGE` keyword to indicate the filling method of this Range expression. The `FILL` keyword can also follow the `BY` keyword, as if the `FILL` key is not given The default value for a word's Range expression. `min(cpu) RANGE '10s'` This Range expression does not provide `FILL`, so the default FILL filling method is used, which is `PREV`. If the default FILL is not given, `NULL` is used to fill.

If you want to use Range query, there must be a column of data in the data table declared as `time index` when creating the table. Range query uses this column data as the timeline basis for aggregation. If the data table does not specify a primary key, the keyword `BY` cannot be omitted. Users can also use the `BY` keyword to declare other columns as the basis for data aggregation. For example, the following RANGE query uses the string length `length(host)` of the `host` column as the basis for data aggregation.

```sql
SELECT 
    ts, 
    length(host), 
    min(cpu) RANGE '10s' 
FROM host_cpu ALIGN '5s' BY (length(host));
```

Get after running

```sql
+---------------------+---------------------------------+---------------------------------------+
| ts                  | character_length(host_cpu.host) | MIN(host_cpu.cpu) RANGE 10s FILL NULL |
+---------------------+---------------------------------+---------------------------------------+
| 1970-01-01 08:00:00 |                               5 |                                   1.1 |
| 1970-01-01 08:00:05 |                               5 |                                   1.1 |
| 1970-01-01 08:00:10 |                               5 |                                   2.2 |
+---------------------+---------------------------------+---------------------------------------+
```

Users can explicitly use `BY ()` which mean they do not need to use aggregation keys and aggregate all data into a group. **But if the user directly omits the `BY` keyword, it means using the primary key of the table as the aggregate key.**

```sql
SELECT
     ts,
     min(cpu) RANGE '10s'
FROM host_cpu ALIGN '5s' BY ();
```

Get after running

```sql
+---------------------+---------------------------------------+
| ts                  | MIN(host_cpu.cpu) RANGE 10s FILL NULL |
+---------------------+---------------------------------------+
| 1970-01-01 08:00:05 |                                   1.1 |
| 1970-01-01 08:00:00 |                                   1.1 |
| 1970-01-01 08:00:10 |                                   2.2 |
+---------------------+---------------------------------------+
```

## FILL OPTION

FILL has the following filling methods:

|   FILL   |                                                                                               DESCRIPTION                                                                                                |
| :------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|  `NULL`  |                                                                                        Fill directly with `NULL`                                                                                         |
|  `PREV`  |                                                                                    Fill with data from previous point                                                                                    |
| `LINEAR` | Use the data of the two previous points to average. If an integer type is filled with `LINEAR`, the variable type of the column will be implicitly converted to a floating point type during calculation |
|   `X`    |                                           Fill in a constant, the data type of the constant must be consistent with the variable type of the Range expression                                            |


Take the following table as an example

```sql
+---------------------+-------+------+
| ts                  | host  | cpu  |
+---------------------+-------+------+
| 1970-01-01 08:00:00 | host1 |  4.5 |
| 1970-01-01 08:00:05 | host1 | NULL |
| 1970-01-01 08:00:10 | host1 |  6.5 |
+---------------------+-------+------+
```

Use `NULL` for FILL

```sql
SELECT ts, min(cpu) RANGE '5s' FILL NULL FROM host_cpu ALIGN '5s';
```

Get after running

```sql
+---------------------+--------------------------------------+
| ts                  | MIN(host_cpu.cpu) RANGE 5s FILL NULL |
+---------------------+--------------------------------------+
| 1970-01-01 08:00:00 |                                  4.5 |
| 1970-01-01 08:00:05 |                                 NULL |
| 1970-01-01 08:00:10 |                                  6.5 |
+---------------------+--------------------------------------+
```

Use `PREV` for FILL

```sql
SELECT ts, min(cpu) RANGE '5s' FILL PREV FROM host_cpu ALIGN '5s';
```

Get after running

```sql
+---------------------+--------------------------------------+
| ts                  | MIN(host_cpu.cpu) RANGE 5s FILL PREV |
+---------------------+--------------------------------------+
| 1970-01-01 08:00:00 |                                  4.5 |
| 1970-01-01 08:00:05 |                                  4.5 |
| 1970-01-01 08:00:10 |                                  6.5 |
+---------------------+--------------------------------------+
```

FILL using `LINEAR`

```sql
SELECT ts, min(cpu) RANGE '5s' FILL LINEAR FROM host_cpu ALIGN '5s';
```

Get after running

```sql
+---------------------+----------------------------------------+
| ts                  | MIN(host_cpu.cpu) RANGE 5s FILL LINEAR |
+---------------------+----------------------------------------+
| 1970-01-01 08:00:00 |                                    4.5 |
| 1970-01-01 08:00:05 |                                    5.5 |
| 1970-01-01 08:00:10 |                                    6.5 |
+---------------------+----------------------------------------+
```

Use constant value `6.0` for FILL

```sql
SELECT ts, min(cpu) RANGE '5s' FILL 6.0 FROM host_cpu ALIGN '5s';
```

Get after running

```sql
+---------------------+-----------------------------------+
| ts                  | MIN(host_cpu.cpu) RANGE 5s FILL 6 |
+---------------------+-----------------------------------+
| 1970-01-01 08:00:00 |                               4.5 |
| 1970-01-01 08:00:05 |                                 6 |
| 1970-01-01 08:00:10 |                               6.5 |
+---------------------+-----------------------------------+
```

## Nested Range Expressions

Range expressions support flexible nesting, and range expressions can be combined with various operations to provide more powerful query capabilities.

Take the following table as an example:

```sql
+---------------------+-------+------+
| ts                  | host  | cpu  |
+---------------------+-------+------+
| 1970-01-01 08:00:00 | host1 |  1.1 |
| 1970-01-01 08:00:05 | host1 |  2.2 |
| 1970-01-01 08:00:00 | host2 |  3.3 |
| 1970-01-01 08:00:05 | host2 |  4.4 |
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
| 1970-01-01 08:00:00 | host2 |                                                            13.2 |
| 1970-01-01 08:00:10 | host2 |                                                            17.6 |
| 1970-01-01 08:00:05 | host2 |                                                            13.2 |
| 1970-01-01 08:00:10 | host1 |                                                             8.8 |
| 1970-01-01 08:00:05 | host1 |                                                             4.4 |
| 1970-01-01 08:00:00 | host1 |                                                             4.4 |
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
| 1970-01-01 08:00:05 | host1 |                                            1 |
| 1970-01-01 08:00:00 | host1 |                                            1 |
| 1970-01-01 08:00:10 | host1 |                                            2 |
| 1970-01-01 08:00:00 | host2 |                                            3 |
| 1970-01-01 08:00:10 | host2 |                                            4 |
| 1970-01-01 08:00:05 | host2 |                                            3 |
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
| 1970-01-01 08:00:00 | host2 |                                            3 |
| 1970-01-01 08:00:10 | host2 |                                            4 |
| 1970-01-01 08:00:05 | host2 |                                            3 |
| 1970-01-01 08:00:05 | host1 |                                            1 |
| 1970-01-01 08:00:00 | host1 |                                            1 |
| 1970-01-01 08:00:10 | host1 |                                            2 |
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
| 1970-01-01 08:00:10 | host1 |                                                                             0 |
| 1970-01-01 08:00:05 | host1 |                                                                           1.1 |
| 1970-01-01 08:00:00 | host1 |                                                                             0 |
| 1970-01-01 08:00:05 | host2 |                                                                           1.1 |
| 1970-01-01 08:00:10 | host2 |                                                                             0 |
| 1970-01-01 08:00:00 | host2 |                                                                             0 |
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
| 1970-01-01 08:00:00 | host2 |                                                            13.2 |
| 1970-01-01 08:00:10 | host2 |                                                            17.6 |
| 1970-01-01 08:00:05 | host2 |                                                            13.2 |
| 1970-01-01 08:00:00 | host1 |                                                             4.4 |
| 1970-01-01 08:00:10 | host1 |                                                             8.8 |
| 1970-01-01 08:00:05 | host1 |                                                             4.4 |
+---------------------+-------+-----------------------------------------------------------------+
```

Nesting of Range expressions is not allowed. Nested Range queries are illegal:

```sql
SELECT ts, host, max(min(cpu) RANGE '10s') RANGE '10s' FROM host_cpu ALIGN '5s';

ERROR 1815 (HY000): Range Query: Nest Range Query is not allowed
```