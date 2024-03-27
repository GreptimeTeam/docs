# Timezone

## Timezone Settings

You can set the default timezone for the GreptimeDB database by configuring `default_timezone` in either `frontend` or `standalone` when starting GreptimeDB. The configured default timezone for the database is referred to as `system_time_zone`.

When executing each query or modification, users can also specify a timezone for that operation. The timezone specified by the user will override the default database timezone. The user-specified timezone is referred to as `time_zone`, which defaults to the database's default timezone. Below are the ways to specify and query user timezones in different protocols.

### MySQL

You can use the SELECT statement in MySQL to query the default database timezone and the user-specified timezone.

```SQL
SELECT @@system_time_zone, @@time_zone;
```

```SQL
+--------------------+-------------+
| @@system_time_zone | @@time_zone |
+--------------------+-------------+
| UTC                | UTC         |
+--------------------+-------------+
```

You can modify the user timezone using the SET statement.

```SQL
SET time_zone = '+1:00'
```

After modification, querying again will yield:

```SQL
+--------------------+-------------+
| @@system_time_zone | @@time_zone |
+--------------------+-------------+
| UTC                | +01:00      |
+--------------------+-------------+
```

### PostgreSQL

You can use the SHOW statement in PostgreSQL to query the default database timezone and the user-specified timezone.

```SQL
public=> SHOW VARIABLES system_time_zone;
 TIME_ZONE 
-----------
 UTC
```

```SQL
public=> SHOW VARIABLES time_zone;
 TIME_ZONE 
-----------
 UTC
```

You can modify the user timezone using the SET statement.

```SQL
SET TIMEZONE TO '+1:00'
```

After modification, querying again will yield:

```SQL
public=> SHOW VARIABLES time_zone;                                                                                                                
 TIME_ZONE 
-----------
 +01:00
```

### HTTP

GreptimeDB supports the `x-greptime-timezone` field in the HTTP header of the HTTP protocol. You can specify this field in HTTP requests to specify the timezone for the current query.

```bash
curl -X POST \
-H 'x-greptime-timezone: +1:00' \
-H 'Authorization: Basic Z3JlcHRpbWVfdXNlcjpncmVwdGltZV9wd2Q=' \
-H 'Content-Type: application/x-www-form-urlencoded' \
-d 'sql=SHOW VARIABLES time_zone;' \
http://localhost:4000/v1/sql?db=public
```
˜
After the query, the result will be:

```json
{"output":[{"records":{"schema":{"column_schemas":[{"name":"TIME_ZONE","data_type":"String"}]},"rows":[["+01:00"]]}}],"execution_time_ms":27}
```

## Timezone Impact on SQL Queries

### `Insert` Statement

In an `Insert` statement, if you provides a timestamp in string format without specifying a timezone, the default timezone for that time is the `time_zone`.

```sql
INSERT INTO test values
       (1, '2024-01-01 00:00:00'),
       (2, '2024-01-02 08:00:00'),
       (3, '2024-01-03 16:00:00'),
       (4, '2024-01-04 00:00:00'),
       (5, '2024-01-05 00:00:00+08:00');
```

In this SQL statement, the first four data entries do not specify a timezone, so the `time_zone` is used as the timezone. The last entry specifies a timezone, so its timezone remains unchanged.

### `ALTER` Statement

In an `ALTER` statement, if you provides a timestamp in string format without specifying a timezone, the default timezone for that time is the `time_zone`.

```sql
ALTER TABLE test1 ADD COLUMN ts1 TIMESTAMP DEFAULT '2024-01-30 00:01:01' PRIMARY KEY;
```

In this SQL statement, `'2024-01-30 00:01:01'` does not specify a timezone, so the `time_zone` is used as the timezone.

### `where` Condition Statement

In a `where` condition statement, if you provides a timestamp in string format without specifying a timezone, the default timezone for that time is the `time_zone`.

```sql
SELECT * from test where ts <= '2024-01-03 16:00:00';
```

In this SQL statement, `'2024-01-03 16:00:00'` does not specify a timezone, so the `time_zone` is used as the timezone.

### SQL Functions

If you does not specify the output timezone in the timezone parameter of the `date_format` function, the `time_zone` is used as the timezone.

```sql
select date_format(ts, '%Y-%m-%d %H:%M:%S:%3f') from test;
```

In the above example, `'%Y-%m-%d %H:%M:%S:%3f'` does not specify a timezone, so the `time_zone` is used as the timezone.

If you does not specify the output timezone in the timezone parameter of the `to_unixtime` function, the `time_zone` is used as the timezone.

```sql
select to_unixtime('2024-01-02 00:00:00');
```

In the above example, `'2024-01-02 00:00:00'` does not specify a timezone, so the `time_zone` is used as the timezone.

### Range Queries

Timezone settings affect the default alignment time for Range queries. Please refer to [Range Queries](../../reference/sql/range.md#to-option) for further reading.