---
keywords: [pg, pgsql, GreptimeDB, SQL table operations, create table, alter table, drop table, describe table, show tables, HTTP API, time zone]
description: Covers basic table operations in GreptimeDB, including creating, describing, showing, altering, and dropping tables, as well as executing SQL statements through the HTTP API and understanding time zone effects.
---

# Basic Table Operations

[Data Model](/user-guide/concepts/data-model.md) should be read before this guide.

GreptimeDB provides table management functionalities via SQL. The following guide
uses [MySQL Command-Line Client](https://dev.mysql.com/doc/refman/8.0/en/mysql.html) to demonstrate it.

For more explanations of the `SQL` syntax, please see the [SQL reference](/reference/sql/overview.md).

## Create a database

The default database is `public`. You can create a database manually.

```sql
CREATE DATABASE test;
```

```sql
Query OK, 1 row affected (0.05 sec)
```

Create a database with a `TTL` (Time-To-Live) of seven days, which means all the tables in this database will inherit this option if they don't have their own `TTL` setting:

```sql
CREATE DATABASE test with(ttl='7d');
```

You can list all the existing databases.

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

Using `like` syntax:

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

Then change the database:

```sql
USE test;
```

Change back to `public` database:

```sql
USE public;
```

## Create a table

:::tip NOTE
GreptimeDB offers a schemaless approach to writing data that eliminates the need to manually create tables using additional protocols. See [Automatic Schema Generation](/user-guide/ingest-data/overview.md#automatic-schema-generation).
:::

You can still create a table manually via SQL if you have specific requirements.
Suppose we want to create a table named monitor with the following data model:

- `host` is the hostname of the collected standalone machine, which should be a `Tag` that used to filter data when querying.
- `ts` is the time when the data is collected, which should be the `Timestamp`. It can also used as a filter when querying data with a time range.
- `cpu` and `memory` are the CPU utilization and memory utilization of the machine, which should be `Field` columns that contain the actual data and are not indexed.

The SQL code for creating the table is shown below. In SQL, we use the primary key to specify `Tag`s and the `TIME INDEX` to specify the `Timestamp` column. The remaining columns are `Field`s.

```sql
CREATE TABLE monitor (
  host STRING,
  ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP() TIME INDEX,
  cpu FLOAT64 DEFAULT 0,
  memory FLOAT64,
  PRIMARY KEY(host));
```

```sql
Query OK, 0 row affected (0.03 sec)
```

Create the table  with a `TTL` (Time-To-Live) of seven days:

```sql
CREATE TABLE monitor (
  host STRING,
  ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP() TIME INDEX,
  cpu FLOAT64 DEFAULT 0,
  memory FLOAT64,
  PRIMARY KEY(host)
) WITH (ttl='7d');
```

:::warning NOTE
GreptimeDB does not currently support changing the TIME INDEX after a table has been created.
Therefore, it is important to carefully choose your TIME INDEX column before creating tables.
:::

### `CREATE TABLE` syntax

- Timestamp column: GreptimeDB is a time-series database system, a timestamp column must
  be explicitly specified by `TIME INDEX` keyword when creating tables. The data type of
  the timestamp column must be `TIMESTAMP`type.
- Primary key: The columns in primary key are similar to tags in other other time-series systems like [InfluxDB][1]. The primary key columns with the time index column are used to uniquely define a series of data, which is similar
  to time series like [InfluxDB][2].
- Table options: when creating a table, you can specify a set of table options, click [here](/reference/sql/create.md#table-options) for more details.

### Table name constraints

GreptimeDB supports a limited set of special characters in table names, but they must adhere to the following constraints:
- A valid GreptimeDB table name must start with a letter (either lowercase or uppercase) or `-` / `_` / `:`.
- The rest part of table name can be alphanumeric or special characters within: `-` / `_` / `:` / `@` / `#`.
- Any table name containing special characters must be quoted with backquotes.
- Any table name containing uppercase letters must be quoted with backquotes.

Here are some examples:
```sql
-- ✅ Ok
create table a (ts timestamp time index);

-- ✅ Ok
create table a0 (ts timestamp time index);

-- 🚫 Invalid table name
create table 0a (ts timestamp time index);

-- 🚫 Invalid table name
create table -a (ts timestamp time index);

-- ✅ Ok
create table `-a` (ts timestamp time index);

-- ✅ Ok
create table `a@b` (ts timestamp time index);

-- 🚫 Invalid table name
create table memory_HugePages (ts timestamp time index);

-- ✅ Ok
create table `memory_HugePages` (ts timestamp time index);
```


[1]: https://docs.influxdata.com/influxdb/v1.8/concepts/glossary/#tag-key
[2]: https://docs.influxdata.com/influxdb/v1/concepts/glossary/#series

## Describe a table

Show table information in detail:

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

The Semantic Type column describes the data model of the table. The `host` is a `Tag` column, `ts` is a `Timestamp` column, and cpu and memory are `Field` columns.

## Show Table Definition and Indexes

Use `SHOW CREATE TABLE table_name` to get the statement when creating the table:

```sql
SHOW CREATE TABLE monitor;
```

```
+---------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Table   | Create Table                                                                                                                                                                                                                              |
+---------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| monitor | CREATE TABLE IF NOT EXISTS `monitor` (
  `host` STRING NULL,
  `ts` TIMESTAMP(3) NOT NULL DEFAULT current_timestamp(),
  `cpu` DOUBLE NULL DEFAULT 0,
  `memory` DOUBLE NULL,
  TIME INDEX (`ts`),
  PRIMARY KEY (`host`)
)

ENGINE=mito
 |
+---------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
```

List all indexes in a table:

```sql
SHOW INDEXES FROM monitor;
```


```sql
+---------+------------+------------+--------------+-------------+-----------+-------------+----------+--------+------+----------------------------+---------+---------------+---------+------------+
| Table   | Non_unique | Key_name   | Seq_in_index | Column_name | Collation | Cardinality | Sub_part | Packed | Null | Index_type                 | Comment | Index_comment | Visible | Expression |
+---------+------------+------------+--------------+-------------+-----------+-------------+----------+--------+------+----------------------------+---------+---------------+---------+------------+
| monitor |          1 | PRIMARY    |            1 | host        | A         |        NULL |     NULL |   NULL | YES  | greptime-inverted-index-v1 |         |               | YES     |       NULL |
| monitor |          1 | TIME INDEX |            1 | ts          | A         |        NULL |     NULL |   NULL | NO   | greptime-inverted-index-v1 |         |               | YES     |       NULL |
+---------+------------+------------+--------------+-------------+-----------+-------------+----------+--------+------+----------------------------+---------+---------------+---------+------------+
```

For more info about `SHOW` statement, please read the [SHOW reference](/reference/sql/show.md#show).

## List Existing Tables

You can use `show tables` statement to list existing tables

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

Notice: `scripts` table is a built-in table that holds User-Defined Functions (UDFs).
Currently only table name filtering is supported. You can filter existing tables by their names.

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

List tables in other databases:

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

## Alter a table

You can alter the schema of existing tables just like in MySQL database

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

The `ALTER TABLE` statement also supports adding, removing, and renaming columns, as well as modifying the column datatype, etc. Please refer to the [ALTER reference](/reference/sql/alter.md) for more information.

## Drop a table

:::danger danger
`DROP TABLE` cannot be undone. Use it with care!
:::

`DROP TABLE [db.]table` is used to drop the table in `db` or the current database in-use.Drop the table `test` in the current database:

```sql
DROP TABLE monitor;
```

```sql
Query OK, 1 row affected (0.01 sec)
```

## Drop a database

:::danger danger
`DROP DATABASE` cannot be undone. Use it with care!
:::

You can use `DROP DATABASE` to drop a database.
For example, to drop the `test` database:

```sql
DROP DATABASE test;
```

Please refer to the [DROP](/reference/sql/drop.md#drop-database) document for more details.

## HTTP API

You can execute the SQL statements through the HTTP API.
For example,
using the following code to create a table through POST method:

```shell
curl -X POST \
  -H 'authorization: Basic {{authorization if exists}}' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'sql=CREATE TABLE monitor (host STRING, ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP(), cpu FLOAT64 DEFAULT 0, memory FLOAT64, TIME INDEX (ts), PRIMARY KEY(host))' \
http://localhost:4000/v1/sql?db=public
```

```json
{ "code": 0, "output": [{ "affectedrows": 1 }], "execution_time_ms": 10 }
```

For more information about SQL HTTP request, please refer to [API document](/user-guide/protocols/http.md#post-sql-statements).

## Time zone

The specified time zone in the SQL client session will affect the default timestamp value when creating or altering a table.
If you set the default value of a timestamp column to a string without a time zone,
the client's time zone information will be automatically added.

For more information about the effect of the client time zone, please refer to the [time zone](/user-guide/ingest-data/for-iot/sql.md#time-zone) section in the write data document.

