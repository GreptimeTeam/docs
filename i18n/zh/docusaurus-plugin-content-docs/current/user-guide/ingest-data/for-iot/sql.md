---
keywords: [SQL, 数据写入, 创建表, 插入数据, 时区设置]
description: 介绍如何使用 SQL 将数据写入 GreptimeDB，包括创建表、插入数据和时区设置等内容。
---

# SQL

你可以使用 [MySQL](/user-guide/protocols/mysql.md) 或 [PostgreSQL](/user-guide/protocols/postgresql.md) 客户端执行 SQL 语句，
使用任何你喜欢的编程语言（如 Java JDBC）通过 MySQL 或 PostgreSQL 协议访问 GreptimeDB。

我们将使用 `monitor` 表作为示例来展示如何写入数据。有关如何创建 `monitor` 表的 SQL 示例，请参见[表管理](/user-guide/deployments-administration/manage-data/basic-table-operations.md#创建表)。

## 创建表

在插入数据之前，你需要创建一个表。例如，创建一个名为 `monitor` 的表：

```sql
CREATE TABLE monitor (
    host STRING,
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP() TIME INDEX,
    cpu FLOAT64 DEFAULT 0,
    memory FLOAT64,
    PRIMARY KEY(host));
```

上述语句将创建一个具有以下 schema 的表：

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

有关 `CREATE TABLE` 语句的更多信息，请参阅[表管理](/user-guide/deployments-administration/manage-data/basic-table-operations.md#create-a-table)。

## 插入数据

让我们向 `monitor` 表中插入一些测试数据。你可以使用 `INSERT INTO` 语句：

```sql
INSERT INTO monitor
VALUES
    ("127.0.0.1", 1702433141000, 0.5, 0.2),
    ("127.0.0.2", 1702433141000, 0.3, 0.1),
    ("127.0.0.1", 1702433146000, 0.3, 0.2),
    ("127.0.0.2", 1702433146000, 0.2, 0.4),
    ("127.0.0.1", 1702433151000, 0.4, 0.3),
    ("127.0.0.2", 1702433151000, 0.2, 0.4);
```

```sql
Query OK, 6 rows affected (0.01 sec)
```

你还可以插入数据时指定列名：

```sql
INSERT INTO monitor (host, ts, cpu, memory)
VALUES
    ("127.0.0.1", 1702433141000, 0.5, 0.2),
    ("127.0.0.2", 1702433141000, 0.3, 0.1),
    ("127.0.0.1", 1702433146000, 0.3, 0.2),
    ("127.0.0.2", 1702433146000, 0.2, 0.4),
    ("127.0.0.1", 1702433151000, 0.4, 0.3),
    ("127.0.0.2", 1702433151000, 0.2, 0.4);
```

通过上面的语句，我们成功的向 `monitor` 表中插入了六条数据。请参考 [`INSERT`](/reference/sql/insert.md) 获得更多写入数据的相关信息。

## 时区

SQL 客户端中指定的时区将影响没有时区信息的字符串格式的时间戳。
该时间戳值将会自动添加客户端的时区信息。

例如，下面的 SQL 将时区设置为 `+8:00`：

```sql
SET time_zone = '+8:00';
```

然后向 `monitor` 表中插入值：

```sql
INSERT INTO monitor (host, ts, cpu, memory)
VALUES
    ("127.0.0.1", "2024-01-01 00:00:00", 0.4, 0.1),
    ("127.0.0.2", "2024-01-01 00:00:00+08:00", 0.5, 0.1);
```

第一个时间戳值 `2024-01-01 00:00:00` 没有时区信息，因此它将自动添加客户端的时区信息。
在插入数据后，它将等同于第二个值 `2024-01-01 00:00:00+08:00`。

`+8:00` 时区下的结果如下：

```sql
+-----------+---------------------+------+--------+
| host      | ts                  | cpu  | memory |
+-----------+---------------------+------+--------+
| 127.0.0.1 | 2024-01-01 00:00:00 |  0.4 |    0.1 |
| 127.0.0.2 | 2024-01-01 00:00:00 |  0.5 |    0.1 |
+-----------+---------------------+------+--------+
```

`UTC` 时区下的结果如下：

```sql
+-----------+---------------------+------+--------+
| host      | ts                  | cpu  | memory |
+-----------+---------------------+------+--------+
| 127.0.0.1 | 2023-12-31 16:00:00 |  0.4 |    0.1 |
| 127.0.0.2 | 2023-12-31 16:00:00 |  0.5 |    0.1 |
+-----------+---------------------+------+--------+
```
