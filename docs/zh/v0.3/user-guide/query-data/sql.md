# SQL

GreptimeDB 在查询数据时支持完整的 `SQL` 语法。这里有一些示例通过 SQL 语句和 GreptimeDB 函数来查询 `monitor` 表中的数据。

## SELECT

使用 `SELECT` 查询表中的全部数据：

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

请前往 [SELECT](/v0.3/reference/sql/select.md) 查看更多.

### 函数

使用 `count()` 函数获取表中的全部行数：

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

`avg()` 函数返回某个字段中所有数值的平均值：

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

请前往 [Functions](/v0.3/reference/sql/functions.md) 查看更多.

### Group By

你可以使用 `GROUP BY` 语句将具有相同值的行进行分组汇总，例如查询 `idc` 列中的所有不同值的内存均值：

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

请参考 [GROUP BY](/v0.3/reference/sql/group_by.md) 获取更多相关信息。

### 日期和时间示例

#### 查询最近 5 分钟内的数据

```sql
SELECT * from monitor WHERE ts >= now() - INTERVAL '5 minutes';
```

请参考 [INTERVAL](/v0.3/reference/sql/functions.md#interval) 获取更多信息。

#### 将数字转换为时间戳

```sql
select * from monitor where ts > arrow_cast(1650252336408, 'Timestamp(Millisecond, None)')
```

这个查询将数字 1650252336408（Unix Epoch 2022-04-18 03:25:36.408，毫秒分辨率）转换为带有毫秒精度的时间戳类型。

请参考 [arrow_cast](/v0.3/reference/sql/functions.md#arrow-cast) 获取更多信息.

#### 将字符串时间转换为时间戳

```sql
select * from monitor where ts > '2022-07-25 10:32:16.408'::timestamp
```

这个查询使用 `::` 语法将字符串时间转换为时间戳类型，所有 SQL 类型都可以在 `timestamp` 的位置上使用。

请参考 [::timestamp](/v0.3/reference/sql/functions.md#timestamp) 获取更多信息.

#### 从时间戳中提取一年中的第几天

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

SQL 语句中的 `DOY` 是 `day of the year` 的缩写。请参考 [date_part](/v0.3/reference/sql/functions.md#date-part) 获取更多信息。

## HTTP API

在 HTTP 请求中使用 `POST` 方法来查询数据：

```shell
curl -X POST \
  -H 'authorization: Basic {{authorization if exists}}' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'sql=select * from monitor' \
http://localhost:4000/v1/sql?db=public
```

结果如下：

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

请参考 [API 文档](/v0.3/reference/sql/http-api.md)获取更详细的 HTTP 请求的内容。
