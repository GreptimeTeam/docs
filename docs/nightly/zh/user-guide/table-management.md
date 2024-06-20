# 管理表

在阅读本文档之前请先阅读 [数据模型](./concepts/data-model.md).

GreptimeDB 通过 SQL 提供了表管理的功能，下面通过 [MySQL Command-Line Client](https://dev.mysql.com/doc/refman/8.0/en/mysql.html) 来演示它。

以下部分更详细的关于 SQL 语法的解释，请参考 [SQL reference](/reference/sql/overview.md)。

## 创建数据库

默认的数据库是 `public`，可以手动创建一个数据库。

```sql
CREATE DATABASE test;
```

```sql
Query OK, 1 row affected (0.05 sec)
```

创建一个具有 7 天 `TTL`（数据存活时间）的数据库，也就是该数据库中的所有表如果没有单独设置 TTL 选项，都将继承此选项值。

```sql
CREATE DATABASE test WITH (ttl='7d');
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

:::tip NOTE
注意：GreptimeDB 提供了一种 schemaless 方法来写入数据，不需要使用额外的协议手动创建表。参见 [自动生成表结构](/user-guide/write-data/overview.md#自动生成表结构)\*\*。
:::

如果您有特殊需要，仍然可以通过 SQL 手动创建表。假设我们想要创建一个名为 `monitor` 的表，其数据模型如下：

- `host` 是独立机器的主机名，是 `Tag` 列，用于在查询时过滤数据。
- `ts` 是收集数据的时间，是 `Timestamp` 列。它也可以在查询数据时用作时间范围的过滤器。
- `cpu` 和 `memory` 是机器的 CPU 利用率和内存利用率，是包含实际数据且未索引的 `Field` 列。

创建表的 SQL 代码如下。在 SQL 中，我们使用 PRIMARY KEY 来指定 `Tag`，使用 `TIME INDEX` 来指定 `Timestamp` 列，其余列是 `Field`。

```sql
CREATE TABLE monitor (
  host STRING,
  ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP() TIME INDEX,
  cpu FLOAT64 DEFAULT 0,
  memory FLOAT64,
  PRIMARY KEY(host)) ENGINE=mito;
```

```sql
Query OK, 0 row affected (0.03 sec)
```

创建一个具有 7 天 `TTL`（数据存活时间）的表：

```sql
CREATE TABLE monitor (
  host STRING,
  ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP() TIME INDEX,
  cpu FLOAT64 DEFAULT 0,
  memory FLOAT64,
  PRIMARY KEY(host)
) ENGINE=mito WITH (ttl='7d');
```


:::warning NOTE
GreptimeDB 目前不支持在创建表后更改 TIME INDEX 约束，
因此，在创建表之前，仔细选择适当的 TIME INDEX 列。
:::

### `CREATE TABLE` 语法

- 时间戳列：GreptimeDB 是一个时序数据库系统，在创建表时，必须用 `TIME INDEX` 关键字明确指定时间序列的列。
  时间序列的列的数据类型必须是 `TIMESTAMP`。
- 主键：`Primary key`指定的主键列类似于其他时序系统中的 Tag，比如 [InfluxDB][1]。 主键和时间戳列用于唯一地定义一条时间线，这类似于其他时间序列系统中的时间线的概念，如 [InfluxDB][2]。
- 表选项：当创建一个表时，可以指定一组表选项，点击[这里](/reference/sql/create.md#table-options)了解更多细节。

[1]: https://docs.influxdata.com/influxdb/v1.8/concepts/glossary/#tag-key
[2]: https://docs.influxdata.com/influxdb/v1/concepts/glossary/#series

## 描述表

显示表的详细信息：

```sql
DESC TABLE monitor;
```

```sql
+--------+----------------------+------+------+---------------------+---------------+
| Column | Type                 | Key  | Null | Default             | Semantic Type |
+--------+----------------------+------+------+---------------------+---------------+
| host   | String               | PRI  | YES  |                     | TAG           |
| ts     | TimestampMillisecond | PRI  | NO   | current_timestamp() | TIMESTAMP     |
| cpu    | Float64              |      | YES  | 0                   | FIELD         |
| memory | Float64              |      | YES  |                     | FIELD         |
+--------+----------------------+------+------+---------------------+---------------+
4 rows in set (0.01 sec)
```

Semantic Type 列描述了表的数据模型。`host` 是 `Tag` 列，`ts` 是 `Timestamp` 列，`cpu` 和 `memory` 是 `Field` 列。

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

:::danger 危险操作
表删除后不可撤销！请谨慎操作！
:::

`DROP TABLE [db.]table` 用于删除 `db` 或当前正在使用的数据库中的表。

删除当前数据库中的表 `test`：

```sql
DROP TABLE monitor;
```

```sql
Query OK, 1 row affected (0.01 sec)
```

## 删除数据库

:::danger 危险操作
数据库删除后不可撤销！请谨慎操作！
:::

可以使用 `DROP DATABASE` 删除数据库。
例如，删除 `test` 数据库：

```sql
DROP DATABASE test;
```

请前往 [DROP](/reference/sql/drop.md#drop-database) 文档了解更多内容。

## HTTP API

使用以下代码，通过 POST 方法创建一个表：

```shell
curl -X POST \
  -H 'authorization: Basic {{authorization if exists}}' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'sql=CREATE TABLE monitor (host STRING, ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP(), cpu FLOAT64 DEFAULT 0, memory FLOAT64, TIME INDEX (ts), PRIMARY KEY(host)) ENGINE=mito' \
http://localhost:4000/v1/sql?db=public
```

```json
{ "code": 0, "output": [{ "affectedrows": 1 }], "execution_time_ms": 10 }
```

关于 SQL HTTP 请求的更多信息，请参考 [API 文档](/reference/sql/http-api.md)。

## 时区

SQL 客户端会话中指定的时区将影响创建或更改表时的默认时间戳值。
如果将时间戳列的默认值设置为不带时区的字符串，则该默认值会被自动添加客户端的时区信息。

有关客户端时区的影响，请参考 [写入数据](./write-data/sql.md#时区) 文档中的时区部分。
