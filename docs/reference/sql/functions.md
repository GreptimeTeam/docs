# Functions

<!--
The outling of this document is a little strange, as the content is classified by company functions and feature functions. We plan to tidy up the content in the future when out functions are more stable.
-->

## Datafusion Functions
Since GreptimeDB's query engine is built based on Apache Arrow DataFusion, GreptimeDB inherits all built-in
functions in DataFusion. These functions include:

**Aggregate functions**: such as COUNT(), SUM(), MIN(), MAX(), etc. For a detailed list, please refer to [Aggregate Functions](https://arrow.apache.org/datafusion/user-guide/sql/aggregate_functions.html)

**Scalar functions**: such as ABS(), COS(), FLOOR(), etc. For a detailed list, please refer to [Scalar Functions](https://arrow.apache.org/datafusion/user-guide/sql/scalar_functions.html)

In summary, GreptimeDB supports all SQL aggregate functions and scalar functions in DataFusion. Users can safely
use these rich built-in functions in GreptimeDB to manipulate and analyze data.

### `arrow_cast`

`arrow_cast` function is from DataFusion's [`arrow_cast`](https://arrow.apache.org/datafusion/user-guide/sql/scalar_functions.html#arrow-cast). It's illustrated as:

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

Please refer to [API documentation](https://greptimedb.rs/script/python/rspython/builtins/greptime_builtin/index.html#functions)

## Time and Date

### `date_trunc`

`date_trunc` function follows the same API with PostgreSQL's [`date_trunc`](https://www.postgresql.org/docs/current/functions-datetime.html#FUNCTIONS-DATETIME-TRUNC). It's illustrated as:

```sql
date_trunc(field, source [, time_zone ])
```

Valid fields are:
- microseconds
- milliseconds
- second
- minute
- hour
- day
- week
- month
- quarter
- year
- decade
- century
- millennium

### INTERVAL

The interval data type allows you to store and manipulate a period of time in years, months, days, hours etc. It's illustrated as:

```sql
INTERVAL [fields] [(p)]
```

Valid types are:
- YEAR
- MONTH
- DAY
- HOUR
- MINUTE
- SECOND
- YEAR TO MONTH
- DAY TO HOUR
- DAY TO MINUTE
- DAY TO SECOND
- HOUR TO MINUTE
- HOUR TO SECOND
- MINUTE TO SECOND

The optional precision `p` is the number of fraction digits retained in the second field.

For example:

```sql
SELECT
	now(),
	now() - INTERVAL '1 year 3 hours 20 minutes'
             AS "3 hours 20 minutes ago of last year";
```

Output:
```sql
+----------------------------+-------------------------------------+
| now()                      | 3 hours 20 minutes ago of last year |
+----------------------------+-------------------------------------+
| 2023-07-05 11:43:37.861340 | 2022-07-05 08:23:37.861340          |
+----------------------------+-------------------------------------+
```

### `::timestamp`

The `::timestamp` grammar casts the string literal to the timestamp type. All the SQL types are valid to be in the position of `timestamp`.

Example:

```sql
MySQL [(none)]> select '2021-07-01 00:00:00'::timestamp;
```

Output:

```sql
+-----------------------------+
| Utf8("2021-07-01 00:00:00") |
+-----------------------------+
| 2021-07-01 08:00:00         |
+-----------------------------+
1 row in set (0.000 sec)
```

### `date_part`

`date_part` function follows the same API with PostgreSQL's [`date_part`](https://www.postgresql.org/docs/current/functions-datetime.html#FUNCTIONS-DATETIME-EXTRACT). It's illustrated as:

```sql
date_part(field, source)
```

Some commonly used fields are:
- century
- decade
- year
- quarter
- month
- day
- dow (day of week)
- doy (day of year)
- hour
- minute
- second
- milliseconds
- microseconds
- nanoseconds

### More Functions

GreptimeDB compiled PostgreSQL's date functions. Please refer to [PostgreSQL's documentation](https://www.postgresql.org/docs/current/functions-datetime.html) for more functions.

