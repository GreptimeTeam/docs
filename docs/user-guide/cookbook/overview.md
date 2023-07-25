# Overview

🧑‍🍳 Mastering GreptimeDB with delicious recipes

## Query latest 5 minutes of data

```sql
SELECT * from system_metrics WHERE
  ts >= now() - INTERVAL '5 minutes';
```

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

## Group by time interval

```sql
select date_trunc('day', ts) as dt, avg(val)
from system_metrics
group by dt
```

This query groups the data by day and calculates the average value of each day.

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

## Cast number literal to timestamp

```sql
select * from system_metrics where ts > arrow_cast(1690252336408, 'Timestamp(Millisecond, None)')
```

This query casts the number literal `1690252336408` (Unix Epoch `2023-07-25 10:32:16.408` in millisecond resolution) to the timestamp type with millisecond precision.

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

## Cast string literal to timestamp

```sql
select * from system_metrics where ts > '2023-07-25 10:32:16.408'::timestamp
```

This query uses the `::` grammar to cast the string literal to the timestamp type. All the SQL types are valid to be in the position of `timestamp`.

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

## Extract the day of the year from timestamp

```sql
MySQL [(none)]> SELECT date_part('DOY', '2021-07-01 00:00:00');
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
