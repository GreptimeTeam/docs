---
keywords: [SQL SHOW commands, database information, table details, SHOW DATABASES, SHOW TABLES, SHOW CREATE]
description: Provides information on the SHOW keyword in SQL for displaying database and table details, including various SHOW commands with syntax and examples.
---

# SHOW

The `SHOW` keyword provides database and table information.

## SHOW DATABASES

Show all databases:

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

Show databases by `LIKE` pattern:

```sql
SHOW DATABASES LIKE 'p%';
```

Show databases by `where` expr:

```sql
SHOW DATABASES WHERE Schemas='test_public_schema';
```

Show all databases with options:

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

Shows the `CREATE DATABASE` statement that creates the named database:

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

Show all tables:

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

Show tables in the `test` database:

```sql
SHOW TABLES FROM test;
```

Show tables by `like` pattern:

```sql
SHOW TABLES like '%prometheus%';
```

Show tables by `where` expr:

```sql
SHOW TABLES FROM test WHERE Tables='numbers';
```

## SHOW FULL TABLES

```sql
SHOW FULL TABLES [IN | FROM] [DATABASE] [LIKE pattern] [WHERE query]
```

It will list all tables and table types in the database:

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

* `Tables`: the table names.
* `Table_type`: the table types, such as `BASE_TABLE`, `TEMPORARY`, and  `VIEW` etc.

It supports `like` and `where` query too:

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

Shows the `CREATE TABLE` statement that creates the named table:

```sql
SHOW CREATE TABLE [table]
```

For example:

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

* `Table`: the table name.
* `Create Table`: The SQL to create the table.

:::note
When a table has no explicit `ttl` or `compaction.*` settings, `SHOW CREATE TABLE` displays the database-level settings in the `WITH(...)` clause. This reflects the actual effective settings for the table, as these options are dynamically resolved at runtime with the following priority: table-level > database-level > defaults.
:::

## SHOW CREATE FLOW

Shows the `CREATE FLOW` statement that creates the flow task.

For example:
  
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

Show all flows:

```sql
public=> SHOW FLOWS;
```

```sql
     Flows      
----------------
 filter_numbers
(1 row)
```
also support `LIKE` expression:
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

To show the view's definition:

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

List all views:

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

Of course, it supports `LIKE`:

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

And `where`:

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
List all currently running queries, essentially an alias for `SELECT id, catalog, query, elapsed_time FROM INFORMATION_SCHEMA.PROCESS_LIST`:

```sql
SHOW PROCESSLIST;
```

Output:
```
+-----------------------+----------+------------------+-----------------+
| Id                    | Catalog  | Query            | Elapsed Time    |
+-----------------------+----------+------------------+-----------------+
| 192.168.50.164:4001/0 | greptime | SHOW PROCESSLIST | 00:00:00.002000 |
+-----------------------+----------+------------------+-----------------+
1 row in set (0.00 sec)
```

At the same time, you can specify the `FULL` parameter to output all columns of the `INFORMATION_SCHEMA.PROCESS_LIST` table:
```sql
SHOW FULL PROCESSLIST;
```

Output:
```sql
+-----------------------+----------+--------------------+------------------------+---------------------+----------------------------+-----------------+-----------------------+
| Id                    | Catalog  | Schema             | Client                 | Frontend            | Start Time                 | Elapsed Time    | Query                 |
+-----------------------+----------+--------------------+------------------------+---------------------+----------------------------+-----------------+-----------------------+
| 192.168.50.164:4001/0 | greptime | information_schema | mysql[127.0.0.1:34692] | 192.168.50.164:4001 | 2025-06-30 07:17:46.423000 | 00:00:00.003000 | SHOW FULL PROCESSLIST |
+-----------------------+----------+--------------------+------------------------+---------------------+----------------------------+-----------------+-----------------------+
```

## SHOW TRIGGERS

Please refer to the [Trigger syntax](/reference/sql/trigger-syntax.md#show-triggers) documentation.

## SHOW CREATE TRIGGER

Please refer to the [Trigger syntax](/reference/sql/trigger-syntax.md#show-create-trigger) documentation.

## Extensions to SHOW Statements

Some extensions to `SHOW` statements accompany the implementation of [`INFORMATION_SCHEMA`](/reference/sql/information-schema/overview.md) just like MySQL, they also accept a `WHERE` clause that provides more flexibility in specifying which rows to display. 

GreptimeDB supports some extensions for MySQL compatibility, it's good for tools like [Navicat for MySQL](https://www.navicat.com/en/products/navicat-for-mysql) or [dbeaver](https://dbeaver.io/) to connect GreptimeDB.

```sql
SHOW CHARACTER SET;
```

Output just like the `INFORMATION_SCHEMA.CHARACTER_SETS` table:

```sql
+---------+---------------+-------------------+--------+
| Charset | Description   | Default collation | Maxlen |
+---------+---------------+-------------------+--------+
| utf8    | UTF-8 Unicode | utf8_bin          |      4 |
+---------+---------------+-------------------+--------+
```

`SHOW COLLATION` for `INFORMATION_SCHEMA.COLLATIONS` table.

```sql
SHOW INDEX FROM monitor;
```

To list all indexes in a table:

```sql
+---------+------------+------------+--------------+-------------+-----------+-------------+----------+--------+------+----------------------------+---------+---------------+---------+------------+
| Table   | Non_unique | Key_name   | Seq_in_index | Column_name | Collation | Cardinality | Sub_part | Packed | Null | Index_type                 | Comment | Index_comment | Visible | Expression |
+---------+------------+------------+--------------+-------------+-----------+-------------+----------+--------+------+----------------------------+---------+---------------+---------+------------+
| monitor |          1 | PRIMARY    |            1 | host        | A         |        NULL |     NULL |   NULL | YES  | greptime-inverted-index-v1 |         |               | YES     |       NULL |
| monitor |          1 | TIME INDEX |            1 | ts          | A         |        NULL |     NULL |   NULL | NO   | greptime-inverted-index-v1 |         |               | YES     |       NULL |
+---------+------------+------------+--------------+-------------+-----------+-------------+----------+--------+------+----------------------------+---------+---------------+---------+------------+
```

Which is the extension of `INFORMATION_SCHEMA.TABLE_CONSTRAINTS`.

List all the columns in a table:

```sql
SHOW COLUMNS FROM monitor;
```

Output just like `INFORMATION_SCHEMA.COLUMNS`:

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

All these `SHOW` extensions accept `WHERE`:

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

To list all regions in a table:
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

It is the extension of `INFORMATION_SCHEMA.REGION_PEERS` and supports `WHERE` too.

The syntax is
```sql
SHOW REGION FROM [table] [IN database] [WHERE where]
```

Other `SHOW` statements:
* `SHOW STATUS`  and `SHOW VARIABLES` are not supported, just return empty results.
* `SHOW TABLE STATUS` is the extension of  `INFORMATION_SCHEMA.TABLES`.
