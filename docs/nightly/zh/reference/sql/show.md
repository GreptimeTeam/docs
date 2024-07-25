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
create database with(ttl='7d');
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
