# Functions

<!--
The outling of this document is a little strange, as the content is classified by company functions and feature functions. We plan to tidy up the content in the future when out functions are more stable.
-->

## Datafusion Functions

由于 GreptimeDB 的查询引擎是基于 Apache Arrow DataFusion 构建的，因此 GreptimeDB 继承了 DataFusion 中的所有内置函数。这些函数包括：

**Aggregate functions**: 例如 COUNT(), SUM(), MIN(), MAX()。请参考 [Aggregate Functions](https://arrow.apache.org/datafusion/user-guide/sql/aggregate_functions.html) 获取更详细的信息。

**Scalar functions**: 例如 ABS(), COS(), FLOOR(), etc. 请参考 [Scalar Functions](https://arrow.apache.org/datafusion/user-guide/sql/scalar_functions.html)获取更详细的信息。

总之，GreptimeDB 支持 DataFusion 中的所有 SQL 聚合函数和标量函数。
用户可以在 GreptimeDB 中安全地使用这些丰富的内置函数来操作和分析数据。

### `arrow_cast`

`arrow_cast` 方法来自于 DataFusion 的 [`arrow_cast`](https://arrow.apache.org/datafusion/user-guide/sql/scalar_functions.html#arrow-cast)。它的语法如下：

```sql
arrow_cast(expression, datatype)
```

`datatype` 可以是 DataFusion 中的任何有效的 Arrow 数据类型，具体请参考 [list](https://arrow.apache.org/datafusion/user-guide/sql/data_types.html)。四种时间戳类型是：

- Timestamp(Second, None)
- Timestamp(Millisecond, None)
- Timestamp(Microsecond, None)
- Timestamp(Nanosecond, None)

（注意，`None` 表示时间戳是时区无关的）

## GreptimeDB Functions

请参考 [API 文档](https://greptimedb.rs/script/python/rspython/builtins/greptime_builtin/index.html#functions)

### 管理函数

GreptimeDB 提供了一些管理函数来管理数据库和数据：

* `flush_table(table_name)` 通过表名将表的内存表刷写到 SST 文件。
* `flush_region(region_id)` 通过 Region Id 将 Region 的内存表刷写到 SST 文件。可以通过 [PARTITIONS](./information-schema/partitions.md) 表查找一张表的所有 Region Id。
* `compact_table(table_name)` 通过表名为表发起compaction 任务。
* `compact_region(region_id)` 通过 Region Id 为 Region 发起 compaction 任务。
* `migrate_region(region_id, from_peer, to_peer, [timeout])` 在 Datanode 之间迁移 Region，请阅读 [ Region迁移](/user-guide/operations/region-migration.md)。
* `procedure_state(procedure_id)` 通过 Procedure Id 查询 Procedure 状态。

例如：
```sql
-- 刷新表 test --
select flush_table("test");

-- 为表 test 启动一个 compaction 任务 --
select compact_table("test");
```

## Time and Date

### `date_trunc`

`date_trunc` 方法来自于 PostgreSQL 的 [`date_trunc`](https://www.postgresql.org/docs/current/functions-datetime.html#FUNCTIONS-DATETIME-TRUNC)。它的语法如下：

```sql
date_trunc(precision, source [, time_zone ])
```

可用的精度有：

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

INTERVAL 数据类型允许你以年、月、日、小时等为单位存储和操作一段时间。它的语法如下：

```sql
INTERVAL [fields] [(p)]
```

可用的类型有：

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

可选的精度 `p` 是第二个字段中保留的小数位数。

示例：

```sql
SELECT
 now(),
 now() - INTERVAL '1 year 3 hours 20 minutes'
             AS "3 hours 20 minutes ago of last year";
```

输出：

```sql
+----------------------------+-------------------------------------+
| now()                      | 3 hours 20 minutes ago of last year |
+----------------------------+-------------------------------------+
| 2023-07-05 11:43:37.861340 | 2022-07-05 08:23:37.861340          |
+----------------------------+-------------------------------------+
```

### `::timestamp`

`::timestamp` 语法将字符串转换为时间戳类型。所有的 SQL 类型都可以在 `timestamp` 的位置上使用。

示例：

```sql
MySQL [(none)]> select '2021-07-01 00:00:00'::timestamp;
```

输出：

```sql
+-----------------------------+
| Utf8("2021-07-01 00:00:00") |
+-----------------------------+
| 2021-07-01 08:00:00         |
+-----------------------------+
1 row in set (0.000 sec)
```

### `date_part`

`date_part` 方法来自于 PostgreSQL 的 [`date_part`](https://www.postgresql.org/docs/current/functions-datetime.html#FUNCTIONS-DATETIME-EXTRACT)。它的语法如下：

```sql
date_part(field, source)
```

一些常用的字段有：

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

### 更多 Functions

有关时间和日期的更多函数，请参考 DataFusion 文档中的 [Time and Date Functions](https://arrow.apache.org/datafusion/user-guide/sql/scalar_functions.html#time-and-date-functions) 部分。
