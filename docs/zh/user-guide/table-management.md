# 管理表

GreptimeDB 通过 SQL 提供了表管理的功能，下面通过 [MySQL Command-Line Client](https://dev.mysql.com/doc/refman/8.0/en/mysql.html) 来演示它。

## 创建数据库

默认的数据库是 `public`，可以手动创建一个数据库。

```sql
CREATE DATABASE test;
```

```sql
Query OK, 1 row affected (0.05 sec)
```

列出所有现有的数据库。

```sql
SHOW DATABASES;
```

```sql
+---------+
| Schemas |
+---------+
| test    |
| public  |
+---------+
2 rows in set (0.00 sec)
```

使用 `like` 语法：

```sql
SHOW DATABASES LIKE 'p%';
```

```sql
+---------+
| Schemas |
+---------+
| public  |
+---------+
1 row in set (0.00 sec)
```

然后更改数据库：

```sql
USE test;
```

更改回 `public` 数据库：

```sql
USE public;
```

## 创建表

**注意：GreptimeDB 提供了一种 schemaless 方法来写入数据，不需要使用额外的协议手动创建表。参见 [Automatic Schema Generation](/user-guide/write-data.md#automatic-schema-generation)**。

如果有一些特殊的要求，仍然可以通过 SQL 手动创建一个表。在这个例子中，将创建一个名为 `monitor ` 的表。

```sql
CREATE TABLE monitor (
  host STRING,
  ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP TIME INDEX,
  cpu DOUBLE DEFAULT 0,
  memory DOUBLE,
  PRIMARY KEY(host)) ENGINE=mito WITH(regions=1);
```

```sql
Query OK, 0 row affected (0.03 sec)
```

#### `CREATE TABLE` 语法

- 时间戳列：GreptimeDB 是一个时序数据库系统，在创建表时，必须用 `TIME INDEX` 关键字明确指定时间序列的列。
  时间序列的列的数据类型可以是 `BIGINT` 或 `TIMESTAMP`。如果选择 `BIGINT`，该列的插入值将被自动转换为以毫秒为单位的时间戳。
- 主键：主键用于唯一地定义一系列的数据，这类似于其他时间序列系统中的标签。如 [InfluxDB][1]。
<!-- - 表选项：当创建一个表时，可以指定一组表选项，点击[这里](../reference/sql/create.md#table-options)了解更多细节。 -->

[1]: https://docs.influxdata.com/influxdb/v1.8/concepts/glossary/#tag-key

## 列出现有的表

可以使用 `show tables` 语句来列出现有的表

```sql
SHOW TABLES;
```

```sql
+------------+
| Tables     |
+------------+
| monitor    |
| scripts    |
+------------+
3 rows in set (0.00 sec)
```

注意：`scripts` 表是一个内置的表，用于存放用户定义的函数（UDF）。

其目前只支持表名的过滤，可以通过表名字对其进行过滤。

```sql
SHOW TABLES LIKE monitor;
```

```sql
+---------+
| Tables  |
+---------+
| monitor |
+---------+
1 row in set (0.00 sec)
```

列出其他数据库中的表：

```sql
SHOW TABLES FROM test;
```

```sql
+---------+
| Tables  |
+---------+
| monitor |
+---------+
1 row in set (0.01 sec)
```

## 描述表

详细显示表的信息：

```sql
DESC TABLE monitor;
```

```sql
+--------+-----------+------+---------------------+---------------+
| Field  | Type      | Null | Default             | Semantic Type |
+--------+-----------+------+---------------------+---------------+
| host   | String    | NO   |                     | PRIMARY KEY   |
| ts     | Timestamp | NO   | current_timestamp() | TIME INDEX    |
| cpu    | Float64   | NO   | 0                   | VALUE         |
| memory | Float64   | NO   |                     | VALUE         |
+--------+-----------+------+---------------------+---------------+
4 rows in set (0.01 sec)
```

## 改动表

可以像在 MySQL 数据库中一样，改变现有表的模式

```sql
ALTER TABLE monitor ADD COLUMN label VARCHAR;
```

```sql
Query OK, 0 rows affected (0.03 sec)
```

```sql
ALTER TABLE monitor DROP COLUMN label;
```

```sql
Query OK, 0 rows affected (0.03 sec)
```

注意：目前只允许添加/删除列，将很快支持改变列的定义。

## 删除表

`DROP TABLE [db.]table` 用于删除 `db` 或当前正在使用的数据库中的表。

删除当前数据库中的表 `test`：

```sql
DROP TABLE monitor;
```

```sql
Query OK, 1 row affected (0.01 sec)
```

**注意：GreptimeDB V0.1 在概念层面上删除了该表，但实际上并没有删除该表的内容，我们将尽快解决这个问题**。

## HTTP API

使用以下代码，通过 POST 方法创建一个表：

```shell
curl -X POST \
  -H 'authorization: Basic {{authorization if exists}}' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'sql=CREATE TABLE monitor (host STRING, ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP, cpu DOUBLE DEFAULT 0, memory DOUBLE, TIME INDEX (ts), PRIMARY KEY(host)) ENGINE=mito WITH(regions=1)' \
http://localhost:4000/v1/sql?db=public
```

```json
{ "code": 0, "output": [{ "affectedrows": 1 }], "execution_time_ms": 10 }
```

关于 SQL HTTP 请求的更多信息，请参考 [API 文档](/reference/sql/http-api.md)。
