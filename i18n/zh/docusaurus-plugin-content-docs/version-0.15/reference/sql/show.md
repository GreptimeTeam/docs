---
keywords: [SHOW 关键字, 数据库信息, 表信息, SQL 示例, SHOW DATABASES]
description: 介绍了 `SHOW` 关键字的各种用法，包括展示数据库、表、视图和索引等信息的语法和示例。
---

# SHOW

`SHOW` 关键字提供数据库和表信息。

## SHOW DATABASES

展示所有数据库：

```sql
SHOW [FULL] DATABASES;
```

```sql
+---------+
| Schemas |
+---------+
| public  |
+---------+
1 row in set (0.01 sec)
```

展示名称符合 `LIKE` 模式的数据库：

```sql
SHOW DATABASES LIKE 'p%';
```

根据 `where` 表达式展示数据库：

```sql
SHOW DATABASES WHERE Schemas='test_public_schema';
```

展示所有数据库，包括它们的选项：

```sql
CREATE DATABASE test WITH(ttl='7d');
SHOW FULL DATABASES;
```

```sql
+--------------------+-------------+
| Database           | Options     |
+--------------------+-------------+
| greptime_private   |             |
| information_schema |             |
| public             |             |
| test               | ttl='7days' |
+--------------------+-------------+
```

## SHOW CREATE DATABASE

展示创建指定数据库的 `CREATE DATABASE` 语句：

```sql
SHOW CREATE DATABASE test;
```

```sql
+----------+------------------------------------------------------------+
| Database | Create Database                                            |
+----------+------------------------------------------------------------+
| test     | CREATE DATABASE IF NOT EXISTS test
WITH(
  ttl = '7days'
) |
+----------+------------------------------------------------------------+
1 row in set (0.01 sec)
```

## SHOW TABLES

展示所有表：

```sql
SHOW TABLES;
```

```sql
+---------+
| Tables  |
+---------+
| numbers |
| scripts |
+---------+
2 rows in set (0.00 sec)
```

展示 `test` 数据库中的所有表：

```sql
SHOW TABLES FROM test;
```

展示名称符合 `LIKE` 模式的表：

```sql
SHOW TABLES like '%prometheus%';
```

根据 `where` 表达式展示表：

```sql
SHOW TABLES FROM test WHERE Tables='numbers';
```

## SHOW FULL TABLES

```sql
SHOW FULL TABLES [IN | FROM] [DATABASE] [LIKE pattern] [WHERE query]
```

将会展示指定数据库（或者默认 `public`）中所有的表及其类型：

```sql
SHOW FULL TABLES;
```

```sql
+---------+------------+
| Tables  | Table_type |
+---------+------------+
| monitor | BASE TABLE |
| numbers | TEMPORARY  |
+---------+------------+
2 rows in set (0.00 sec)
```

* `Tables`: 表的名称
* `Table_type`: 表的类型，例如 `BASE_TABLE`, `TEMPORARY` 和 `VIEW` 等等。

同样也支持 `like` 和 `where` 查询：

```sql
SHOW FULL TABLES FROM public like '%mo%';
```

```sql
+---------+------------+
| Tables  | Table_type |
+---------+------------+
| monitor | BASE TABLE |
+---------+------------+
1 row in set (0.01 sec)
```

```sql
SHOW FULL TABLES WHERE Table_type='BASE TABLE';
```

```sql
+---------+------------+
| Tables  | Table_type |
+---------+------------+
| monitor | BASE TABLE |
+---------+------------+
1 row in set (0.01 sec)
```

## SHOW CREATE TABLE

展示创建指定表的 `CREATE TABLE` 语句：

```sql
SHOW CREATE TABLE [table]
```

例如：

```sql
SHOW CREATE TABLE system_metrics;
```

```sql
+----------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Table          | Create Table                                                                                                                                                                                                                                                                                                                 |
+----------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| system_metrics | CREATE TABLE IF NOT EXISTS `system_metrics` (
  `host` STRING NULL,
  `idc` STRING NULL,
  `cpu_util` DOUBLE NULL,
  `memory_util` DOUBLE NULL,
  `disk_util` DOUBLE NULL,
  `ts` TIMESTAMP(3) NOT NULL DEFAULT current_timestamp(),
  TIME INDEX (`ts`),
  PRIMARY KEY (`host`, `idc`)
)

ENGINE=mito
WITH(
  regions = 1
) |
+----------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
```

* `Table`: 表的名称
* `Create Table`: 用于创建该表的 SQL

## SHOW CREATE FLOW

展示创建指定 Flow 任务的 `CREATE FLOW` 语句。

比如：
  
```sql
public=> SHOW CREATE FLOW filter_numbers;
```

```sql
      Flow      |                      Create Flow                      
----------------+-------------------------------------------------------
 filter_numbers | CREATE OR REPLACE FLOW IF NOT EXISTS filter_numbers  +
                | SINK TO out_num_cnt                                  +
                | AS SELECT number FROM numbers_input WHERE number > 10
(1 row)
```

## SHOW FLOWS

展示当前所有 Flow 任务：

```sql
public=> SHOW FLOWS;
```

```sql
     Flows      
----------------
 filter_numbers
(1 row)
```

同样也支持 `LIKE` 表达式：
```sql
public=> show flows like "filter%";
```

```sql
     Flows      
----------------
 filter_numbers
(1 row)
```

## SHOW CREATE VIEW

用于显示视图（View）的定义：

```sql
SHOW CREATE VIEW cpu_monitor;
```

```
+-------------+--------------------------------------------------------------+
| View        | Create View                                                  |
+-------------+--------------------------------------------------------------+
| cpu_monitor | CREATE VIEW cpu_monitor AS SELECT cpu, host, ts FROM monitor |
+-------------+--------------------------------------------------------------+
```

## SHOW VIEWS

列出所有视图：

```sql
SHOW VIEWS;
```

```sql
+----------------+
| Views          |
+----------------+
| cpu_monitor    |
| memory_monitor |
+----------------+
```

当然，它也支持 `LIKE` 查询：

```sql
SHOW VIEWS LIKE 'cpu%';
```

```sql
+-------------+
| Views       |
+-------------+
| cpu_monitor |
+-------------+
```

以及 `WHERE` 条件：

```sql
SHOW VIEWS WHERE Views = 'memory_monitor';
```

```sql
+----------------+
| Views          |
+----------------+
| memory_monitor |
+----------------+
```

## SHOW PROCESSLIST
列出当前所有正在执行的查询列表，本质上是 `SELECT id, catalog, query, elapsed_time FROM INFORMATION_SCHEMA.PROCESS_LIST` 的别名：

```sql
SHOW PROCESSLIST;
```

输出如下：
```
+-----------------------+----------+------------------+-----------------+
| Id                    | Catalog  | Query            | Elapsed Time    |
+-----------------------+----------+------------------+-----------------+
| 192.168.50.164:4001/0 | greptime | SHOW PROCESSLIST | 00:00:00.002000 |
+-----------------------+----------+------------------+-----------------+
1 row in set (0.00 sec)
```

同时可以指定 `FULL` 参数用于输出 `INFORMATION_SCHEMA.PROCESS_LIST` 表的所有列：
```sql
SHOW FULL PROCESSLIST;
```

输出如下：
```sql
+-----------------------+----------+--------------------+------------------------+---------------------+----------------------------+-----------------+-----------------------+
| Id                    | Catalog  | Schema             | Client                 | Frontend            | Start Time                 | Elapsed Time    | Query                 |
+-----------------------+----------+--------------------+------------------------+---------------------+----------------------------+-----------------+-----------------------+
| 192.168.50.164:4001/0 | greptime | information_schema | mysql[127.0.0.1:34692] | 192.168.50.164:4001 | 2025-06-30 07:17:46.423000 | 00:00:00.003000 | SHOW FULL PROCESSLIST |
+-----------------------+----------+--------------------+------------------------+---------------------+----------------------------+-----------------+-----------------------+
```


## SHOW 语句的扩展

与 MySQL 类似，一些 `SHOW` 语句的扩展伴随着 [`INFORMATION_SCHEMA`](/reference/sql/information-schema/overview.md) 的实现，它们还接受 `WHERE` 子句，提供了在指定显示的行时更大的灵活性。

GreptimeDB 为 MySQL 兼容性实现了这些扩展的一部分，这对于像 [Navicat for MySQL](https://www.navicat.com/en/products/navicat-for-mysql) 或 [dbeaver](https://dbeaver.io/) 这样的工具连接 GreptimeDB 非常有用。

```sql
SHOW CHARACTER SET;
```

输出类似于 `INFORMATION_SCHEMA.CHARACTER_SETS` 表：

```sql
+---------+---------------+-------------------+--------+
| Charset | Description   | Default collation | Maxlen |
+---------+---------------+-------------------+--------+
| utf8    | UTF-8 Unicode | utf8_bin          |      4 |
+---------+---------------+-------------------+--------+
```

使用 `SHOW COLLATION` 来查看 `INFORMATION_SCHEMA.COLLATIONS` 表。

```sql
SHOW INDEX FROM monitor;
```

列出表中的所有索引：

```sql
+---------+------------+------------+--------------+-------------+-----------+-------------+----------+--------+------+----------------------------+---------+---------------+---------+------------+
| Table   | Non_unique | Key_name   | Seq_in_index | Column_name | Collation | Cardinality | Sub_part | Packed | Null | Index_type                 | Comment | Index_comment | Visible | Expression |
+---------+------------+------------+--------------+-------------+-----------+-------------+----------+--------+------+----------------------------+---------+---------------+---------+------------+
| monitor |          1 | PRIMARY    |            1 | host        | A         |        NULL |     NULL |   NULL | YES  | greptime-inverted-index-v1 |         |               | YES     |       NULL |
| monitor |          1 | TIME INDEX |            1 | ts          | A         |        NULL |     NULL |   NULL | NO   | greptime-inverted-index-v1 |         |               | YES     |       NULL |
+---------+------------+------------+--------------+-------------+-----------+-------------+----------+--------+------+----------------------------+---------+---------------+---------+------------+
```

这是 `INFORMATION_SCHEMA.TABLE_CONSTRAINTS` 的扩展。

列出表中的所有列：

```sql
SHOW COLUMNS FROM monitor;
```

输出类似于 `INFORMATION_SCHEMA.COLUMNS`：

```sql
+--------+--------------+------+------------+---------------------+-------+----------------------+
| Field  | Type         | Null | Key        | Default             | Extra | Greptime_type        |
+--------+--------------+------+------------+---------------------+-------+----------------------+
| cpu    | double       | Yes  |            | 0                   |       | Float64              |
| host   | string       | Yes  | PRI        | NULL                |       | String               |
| memory | double       | Yes  |            | NULL                |       | Float64              |
| ts     | timestamp(3) | No   | TIME INDEX | current_timestamp() |       | TimestampMillisecond |
+--------+--------------+------+------------+---------------------+-------+----------------------+
```

所有这些 `SHOW` 扩展都接受 `WHERE` 子句：

```sql
SHOW COLUMNS FROM monitor WHERE Field = 'cpu';
```

```sql
+-------+--------+------+------+---------+-------+---------------+
| Field | Type   | Null | Key  | Default | Extra | Greptime_type |
+-------+--------+------+------+---------+-------+---------------+
| cpu   | double | Yes  |      | 0       |       | Float64       |
+-------+--------+------+------+---------+-------+---------------+
```

列出表中的所有 Region：

```sql
SHOW REGION FROM monitor;
```

```sql
+----------------+---------------+------+--------+
| Table          | Region        | Peer | Leader |
+----------------+---------------+------+--------+
| monitor        | 4398046511104 |    0 | Yes    |
+----------------+---------------+------+--------+
```

这是 `INFORMATION_SCHEMA.REGION_PEERS` 的扩展，并且支持 `WHERE` 子句。

语法是：
```sql
SHOW REGION FROM [table] [IN database] [WHERE where]
```

其他 `SHOW` 扩展语句：
* `SHOW STATUS` 和 `SHOW VARIABLES` 不支持，仅返回空结果。
* `SHOW TABLE STATUS` 是 `INFORMATION_SCHEMA.TABLES` 的扩展。
