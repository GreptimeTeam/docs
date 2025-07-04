---
keywords: [MySQL 协议, 连接数据库, 管理表, 写入数据, 查询数据, 时区]
description: 介绍如何通过 MySQL 协议连接和使用 GreptimeDB。
---

# MySQL

## 连接数据库

你可以通过 MySQL 连接到 GreptimeDB，端口为 `4002`。

```shell
mysql -h <host> -P 4002 -u <username> -p
```

- 请参考[鉴权认证](/user-guide/deployments-administration/authentication/overview.md) 来设置 GreptimeDB 的用户名和密码。
- 如果你想使用其他端口连接 MySQL，请参考配置文档中的[协议选项](/user-guide/deployments-administration/configuration.md#协议选项)。


## 管理表

请参考[表管理](/user-guide/deployments-administration/manage-data/basic-table-operations.md)。

## 写入数据

请参考[写入数据](/user-guide/ingest-data/for-iot/sql.md).

## 查询数据

请参考[查询数据](/user-guide/query-data/sql.md).

## 时区

GreptimeDB 的 MySQL 协议接口遵循原始 MySQL 服务器的 [时区处理方式](https://dev.mysql.com/doc/refman/8.0/en/time-zone-support.html)。

默认情况下，MySQL 使用服务器的时区来处理时间戳。要覆盖这一行为，可以使用 SQL 语句 `SET time_zone = '<value>';` 来为当前会话设置 `time_zone` 变量。`time_zone` 的值可以是：

- 服务器的时区：`SYSTEM`。
- UTC 的偏移量，例如 `+08:00`。
- 任何时区的命名，例如 `Europe/Berlin`。

一些 MySQL 客户端，例如 Grafana 的 MySQL 数据源，允许你为当前会话设置时区。想要知道当前设定的时区，可以通过 SQL 语句 `SELECT @@time_zone;` 来查询。

你可以使用 `SELECT` 来查看当前的时区设置。例如：

```sql
SELECT @@system_time_zone, @@time_zone;
```

结果显示系统时区和会话时区都设置为 `UTC`：

```SQL
+--------------------+-------------+
| @@system_time_zone | @@time_zone |
+--------------------+-------------+
| UTC                | UTC         |
+--------------------+-------------+
```

将会话时区更改为 `+1:00`：

```SQL
SET time_zone = '+1:00'
```

你可以看到系统时区和会话时区之间的差异：

```SQL
SELECT @@system_time_zone, @@time_zone;

+--------------------+-------------+
| @@system_time_zone | @@time_zone |
+--------------------+-------------+
| UTC                | +01:00      |
+--------------------+-------------+
```

有关时区如何影响数据的插入和查询，请参考 [写入数据](/user-guide/ingest-data/for-iot/sql.md#时区) 和 [查询数据](/user-guide/query-data/sql.md#时区) 中的 SQL 文档。
