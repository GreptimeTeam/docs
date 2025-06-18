---
keywords: [SQL functions, DataFusion functions, aggregate functions, scalar functions, window functions]
description: Provides an overview of the SQL functions available in GreptimeDB, including categories and examples of their usage.
---

import TOCInline from '@theme/TOCInline';

# Functions

<TOCInline toc={toc} />

<!--
The outling of this document is a little strange, as the content is classified by company functions and feature functions. We plan to tidy up the content in the future when out functions are more stable.
-->

## Datafusion Functions

Since GreptimeDB's query engine is built based on Apache Arrow DataFusion, GreptimeDB inherits all built-in
functions in DataFusion. These functions include:

* **Aggregate functions**: such as `COUNT`, `SUM`, `MIN`, `MAX`, etc. For a detailed list, please refer to [Aggregate Functions](./df-functions.md#aggregate-functions)
* **Scalar functions**: such as `ABS`, `COS`, `FLOOR`, etc. For a detailed list, please refer to [Scalar Functions](./df-functions.md#scalar-functions)
* **Window functions**: performs a calculation across a set of table rows that are somehow related to the current row. For a detailed list, please refer to [Window Functions](./df-functions.md#window-functions)

To find all the DataFusion functions, please refer to [DataFusion Functions](./df-functions).

### `arrow_cast`

`arrow_cast` function is from DataFusion's [`arrow_cast`](./df-functions.md#arrow-cast). It's illustrated as:

```sql
arrow_cast(expression, datatype)
```

Where the `datatype` can be any valid Arrow data type in this [list](https://arrow.apache.org/datafusion/user-guide/sql/data_types.html). The four timestamp types are:

- Timestamp(Second, None)
- Timestamp(Millisecond, None)
- Timestamp(Microsecond, None)
- Timestamp(Nanosecond, None)

(Notice that the `None` means the timestamp is timezone naive)

## GreptimeDB Functions

### String Functions

DataFusion [String Function](./df-functions.md#string-functions).

GreptimeDB provides:
* `matches_term(expression, term)` for full text search.

For details, read the [Query Logs](/user-guide/logs/query-logs.md).

### Math Functions

DataFusion [Math Function](./df-functions.md#math-functions).

GreptimeDB provides:

* `clamp(value, lower, upper)` to restrict a given value between a lower and upper bound:

```sql
SELECT CLAMP(10, 0, 1);

+------------------------------------+
| clamp(Int64(10),Int64(0),Int64(1)) |
+------------------------------------+
|                                  1 |
+------------------------------------+
```

```sql
SELECT CLAMP(0.5, 0, 1)

+---------------------------------------+
| clamp(Float64(0.5),Int64(0),Int64(1)) |
+---------------------------------------+
|                                   0.5 |
+---------------------------------------+
```

* `mod(x, y)` to get the remainder of a number divided by another number:
```sql
SELECT mod(18, 4);

+-------------------------+
| mod(Int64(18),Int64(4)) |
+-------------------------+
|                       2 |
+-------------------------+
```

* `pow(x, y)` to get the value of a number raised to the power of another number:
```sql
SELECT pow(2, 10);

+-------------------------+
| pow(Int64(2),Int64(10)) |
+-------------------------+
|                    1024 |
+-------------------------+
```

### Date and Time Functions

DataFusion [Time and Date Function](./df-functions.md#time-and-date-functions).
GreptimeDB provides:

* [date_add](#data_add)
* [date_sub](#data_sub)
* [date_format](#date_format)
* [to_unixtime](#to_unixtime)
* [timezone](#timezone)

#### date_add

*  `date_add(expression, interval)` to add an interval value to Timestamp, Date, or DateTime

```sql
SELECT date_add('2023-12-06'::DATE, '3 month 5 day');
```

```
+----------------------------------------------------+
| date_add(Utf8("2023-12-06"),Utf8("3 month 5 day")) |
+----------------------------------------------------+
| 2024-03-11                                         |
+----------------------------------------------------+
```

#### data_sub

* `date_sub(expression, interval)` to subtract an interval value to Timestamp, Date, or DateTime

```sql
SELECT date_sub('2023-12-06 07:39:46.222'::TIMESTAMP_MS, '5 day'::INTERVAL);
```

```
+-----------------------------------------------------------------------------------------------------------------------------------------+
| date_sub(arrow_cast(Utf8("2023-12-06 07:39:46.222"),Utf8("Timestamp(Millisecond, None)")),IntervalMonthDayNano("92233720368547758080")) |
+-----------------------------------------------------------------------------------------------------------------------------------------+
| 2023-12-01 07:39:46.222000                                                                                                              |
+-----------------------------------------------------------------------------------------------------------------------------------------+
```

#### date_format

* `date_format(expression, fmt)` to format Timestamp, Date, or DateTime into string by the format:

```sql
SELECT date_format('2023-12-06 07:39:46.222'::TIMESTAMP, '%Y-%m-%d %H:%M:%S:%3f');
```

```
+-----------------------------------------------------------------------------------------------------------------------------+
| date_format(arrow_cast(Utf8("2023-12-06 07:39:46.222"),Utf8("Timestamp(Millisecond, None)")),Utf8("%Y-%m-%d %H:%M:%S:%3f")) |
+-----------------------------------------------------------------------------------------------------------------------------+
| 2023-12-06 07:39:46:222                                                                                                     |
+-----------------------------------------------------------------------------------------------------------------------------+
```

Supported specifiers refer to the [chrono::format::strftime](https://docs.rs/chrono/latest/chrono/format/strftime/index.html) module.

#### to_unixtime

* `to_unixtime(expression)` to convert the expression into the Unix timestamp in seconds. The argument can be integers (Unix timestamp in milliseconds), Timestamp, Date, DateTime, or String. If the argument is the string type, the function will first try to convert it into a DateTime, Timestamp, or Date.

```sql
select to_unixtime('2023-03-01T06:35:02Z');
```

```
+-------------------------------------------+
| to_unixtime(Utf8("2023-03-01T06:35:02Z")) |
+-------------------------------------------+
|                                1677652502 |
+-------------------------------------------+
```

```sql
select to_unixtime('2023-03-01'::date);
```

```
+---------------------------------+
| to_unixtime(Utf8("2023-03-01")) |
+---------------------------------+
|                      1677628800 |
+---------------------------------+
```

#### timezone

* `timezone()` to retrieve the current session timezone:

```sql
select timezone();
```

```
+------------+
| timezone() |
+------------+
| UTC        |
+------------+
```

### System Functions

* `isnull(expression)` to check whether an expression is `NULL`:
```sql
 SELECT isnull(1);

 +------------------+
| isnull(Int64(1)) |
+------------------+
|                0 |
+------------------+
```

```sql
SELECT isnull(NULL);

+--------------+
| isnull(NULL) |
+--------------+
|            1 |
+--------------+
```


* `build()` retrieves the GreptimeDB build info.
* `version()` retrieves the GreptimeDB version.
* `database()` retrieves the current session database:

```sql
select database();

+------------+
| database() |
+------------+
| public     |
+------------+
```

### Admin Functions

GreptimeDB provides `ADMIN` statement to run the administration functions, please refer to [ADMIN](/reference/sql/admin.md) reference.

### JSON Functions

GreptimeDB provide functions for jsons. [Learn more about these functions](./json.md)

## Geospatial Functions

GreptimeDB provide functions for geo-index, trajectory analytics. [Learn more
about these functions](./geo.md)

## Vector Functions

GreptimeDB supports vector functions for vector operations, such as distance calculation, similarity measurement, etc. [Learn more about these functions](./vector.md)

## Approximate Functions

GreptimeDB supports some approximate functions for data analysis, such as approximate count distinct(hll), approximate quantile(uddsketch), etc. [Learn more about these functions](./approximate.md)
