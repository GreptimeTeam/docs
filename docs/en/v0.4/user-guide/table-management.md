# Table Management

[Data Model](./concepts/data-model.md) should be read before this guide.

GreptimeDB provides table management functionalities via SQL. The following guide
uses [MySQL Command-Line Client](https://dev.mysql.com/doc/refman/8.0/en/mysql.html) to demonstrate it.

For more explanations of the `SQL` syntax, please see the [SQL reference](/en/v0.4/reference/sql/overview.md).

## Create Database

The default database is `public`. You can create a database manully.

```sql
CREATE DATABASE test;
```

```sql
Query OK, 1 row affected (0.05 sec)
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

## Create Table

:::tip NOTE
GreptimeDB offers a schemaless approach to writing data that eliminates the need to manually create tables using additional protocols. See [Automatic Schema Generation](/en/v0.4/user-guide/write-data/overview.md#automatic-schema-generation).
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
  ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP TIME INDEX,
  cpu DOUBLE DEFAULT 0,
  memory DOUBLE,
  PRIMARY KEY(host));
```

```sql
Query OK, 0 row affected (0.03 sec)
```

:::warning NOTE
GreptimeDB does not currently support changing the data model of existing columns after a table has been created.
Therefore, it is important to carefully design your data model before creating tables.
:::

### `CREATE TABLE` syntax

- Timestamp column: GreptimeDB is a time-series database system, a timestamp column must
  be explicitly specified by `TIME INDEX` keyword when creating tables. The data type of
  the timestamp column must be `TIMESTAMP`type.
- Primary key:  The columns in primary key are similar to tags in other other time-series systems like [InfluxDB][1]. The primary key columns with the time index column are used to uniquely define a series of data, which is similar
  to time series like [InfluxDB][2]. 
- Table options: when creating a table, you can specify a set of table options, click [here](../reference/sql/create.md#table-options) for more details.

[1]: https://docs.influxdata.com/influxdb/v1.8/concepts/glossary/#tag-key
[2]: https://docs.influxdata.com/influxdb/v1/concepts/glossary/#series

## Describe Table

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

## Alter Table

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

Notice: currently only adding/dropping columns is allowed, altering column definition will soon be supported.

## Drop Table

`DROP TABLE [db.]table` is used to drop the table in `db` or the current database in-use.Drop the table `test` in the current database:

```sql
DROP TABLE monitor;
```

```sql
Query OK, 1 row affected (0.01 sec)
```

## HTTP API

Using the following code to create a table through POST method:

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

For more information about SQL HTTP request, please refer to [API document](/en/v0.4/reference/sql/http-api.md).
