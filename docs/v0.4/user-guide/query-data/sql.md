# SQL

GreptimeDB supports full SQL for you to query data from a database. Here are some query examples for the `monitor` so you can get familiar with using SQL alongside GreptimeDB functions.

## SELECT

To select all the data from the `monitor` table, use the `SELECT` statement:

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

Please refer to [SELECT](/v0.4/reference/sql/select.md) for more information.

### Use Functions

You can use the `count()` function to get the number of all rows in the table:

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

Please refer to [Functions](/v0.4/reference/sql/functions.md) for more information.

### Group By

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

Please refer to [GROUP BY](/v0.4/reference/sql/group_by.md) for more information.

### Time and Date Examples

#### Query Latest 5 Minutes of Data

```sql
SELECT * from system_metrics WHERE ts >= now() - INTERVAL '5 minutes';
```

Please refer to [INTERVAL](/v0.4/reference/sql/functions.md#interval) for more information.

#### Cast Number Literal to Timestamp

```sql
select * from system_metrics where ts > arrow_cast(1690252336408, 'Timestamp(Millisecond, None)')
```

This query casts the number literal `1690252336408` (Unix Epoch `2023-07-25 10:32:16.408` in millisecond resolution) to the timestamp type with millisecond precision.

Please refer to [arrow_cast](/v0.4/reference/sql/functions.md#arrow-cast) for more information.

#### Cast string literal to timestamp

```sql
select * from system_metrics where ts > '2023-07-25 10:32:16.408'::timestamp
```

This query uses the `::` grammar to cast the string literal to the timestamp type. All the SQL types are valid to be in the position of `timestamp`.

Please refer to [::timestamp](/v0.4/reference/sql/functions.md#timestamp) for more information.

#### Extract the day of the year from timestamp

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

The `DOY` in the SQL statement is the abbreviation of `day of the year`. Please refer to [date_part](/v0.4/reference/sql/functions.md#date-part) for more information.

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

For more information about SQL HTTP request, please refer to [API document](/v0.4/reference/sql/http-api.md).
