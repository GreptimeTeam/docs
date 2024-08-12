# MySQL

## 连接到服务端

在 MySQL 连接服务器的命令中，使用 `-u` 来设定用户名，使用 `-p` 来表示密码。在下方的示例代码中，请确保用自己的用户名和密码替换 `greptime_user(username)` 和 `greptime_pwd(password)`。

```shell
❯ mysql -h 127.0.0.1 -P 4002 -u greptime_user -p
Enter password:
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 8
Server version: 5.1.10-alpha-msql-proxy Greptime

Copyright (c) 2000, 2023, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```

## 管理表

请参考 [管理表](../table-management.md)。

## 写入数据

请参考 [写入数据](../ingest-data/for-iot/sql.md).

## 读取数据

请参考 [读取数据](../query-data/sql.md).

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

有关时区如何影响数据的插入和查询，请参考 [写入数据](../ingest-data/for-iot/sql.md#时区) 和 [查询数据](../query-data/sql.md#时区) 中的 SQL 文档。
