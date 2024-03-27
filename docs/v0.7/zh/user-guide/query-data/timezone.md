# 时区

## 时区设置

你可以在启动 GreptimeDB 的时候，通过在 `frontend` 或者 `standalone` 中配置 `default_timezone`，设置当前数据库的默认时区，设置的数据库的默认时区称为 `system_time_zone`。

你在执行每个查询、修改的时候，同样可以为该操作指定一个时区，用户指定的时区会覆盖数据库默认的时区。用户设置的时区称为 `time_zone`，默认等于数据库默认时区。下面介绍在不同协议中指定和查询用户时区的方式。

### MySQL

你可以在 MySQL 中使用 SELECT 语句查询数据库默认时区和用户设置的时区。

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

你可以通过 SET 语句修改用户时区

```SQL
Set time_zone = '+1:00'
```

修改后再次查询，可得到

```SQL
+--------------------+-------------+
| @@system_time_zone | @@time_zone |
+--------------------+-------------+
| UTC                | +01:00      |
+--------------------+-------------+
```

### PostgreSQL

你可以在 PostgreSQL 中使用 SHOW 语句查询数据库默认时区和用户设置的时区。

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

你可以通过 SET 语句修改用户时区

```SQL
SET TIMEZONE TO '+1:00'
```

修改后再次查询，可得到

```SQL
public=> SHOW VARIABLES time_zone;                                                                                                                
 TIME_ZONE 
-----------
 +01:00
```

### HTTP

GreptimeDB 在 HTTP 协议的 HTTP header 中支持了 `x-greptime-timezone`， 你可以在 HTTP 请求中指定该字段，用来指定本次查询的时区。

```bash
curl -X POST \
-H 'x-greptime-timezone: +1:00' \
-H 'Authorization: Basic Z3JlcHRpbWVfdXNlcjpncmVwdGltZV9wd2Q=' \
-H 'Content-Type: application/x-www-form-urlencoded' \
-d 'sql=SHOW VARIABLES time_zone;' \
http://localhost:4000/v1/sql?db=public
```
˜
查询后可得到

```json
{"output":[{"records":{"schema":{"column_schemas":[{"name":"TIME_ZONE","data_type":"String"}]},"rows":[["+01:00"]]}}],"execution_time_ms":27}
```

## 时区对 SQL 查询的影响

### `Insert` 语句

在 `Insert` 语句中，如果你使用字符串的格式给出时间戳，并且该字符串没有指定时区的话，该时间的默认时区为 `time_zone`。

```sql
INSERT INTO test values
       (1, '2024-01-01 00:00:00'),
       (2, '2024-01-02 08:00:00'),
       (3, '2024-01-03 16:00:00'),
       (4, '2024-01-04 00:00:00'),
       (5, '2024-01-05 00:00:00+08:00');
```

以该 SQL 语句为例，前四条数据都没有给出时区，则使用 `time_zone` 作为时区。最后一条数据给出了时区，所以保持该条记录的的时区不变。

### `ALTER` 语句

在 `ALTER` 语句中，如果你使用字符串的格式给出时间戳，并且该字符串没有指定时区的话，该时间的默认时区为 `time_zone`。

```sql
ALTER TABLE test1 ADD COLUMN ts1 TIMESTAMP DEFAULT '2024-01-30 00:01:01' PRIMARY KEY;
```

以该 SQL 语句为例，`'2024-01-30 00:01:01'` 没有给出时区，则使用 `time_zone` 作为时区。

### `where` 条件语句

`where` 条件语句中，如果你使用字符串的格式给出时间戳，并且该字符串没有指定时区的话，该时间的默认时区为 `time_zone`。

```sql
SELECT * from test where ts <= '2024-01-03 16:00:00';
```

以该 SQL 语句为例，`'2024-01-03 16:00:00'` 没有给出时区，则使用 `time_zone` 作为时区。

### SQL 函数

你如果没有在 `date_format` 函数中的时区参数中指定输出的时区，则使用 `time_zone` 作为时区。

```sql
select date_format(ts, '%Y-%m-%d %H:%M:%S:%3f') from test;
```

比如上面 `'%Y-%m-%d %H:%M:%S:%3f'` 没有给出时区，则使用 `time_zone` 作为时区。

你如果没有在 `to_unixtime` 函数中的字符串时间中指定输出的时区，则使用 `time_zone` 作为时区。

```sql
select to_unixtime('2024-01-02 00:00:00');
```

比如上面 `'2024-01-02 00:00:00'` 没有给出时区，则使用 `time_zone` 作为时区。

### Range 查询

时区设置会影响 Range 查询默认对齐到的时间原点，请参考 [Range 查询](../../reference/sql/range.md#to-选项) 进一步阅读。
