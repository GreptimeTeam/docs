# Table Management

## Introduction

GreptimeDB provides table management functionalities via SQL. The following guide
uses [MySQL Command-Line Client](https://dev.mysql.com/doc/refman/8.0/en/mysql.html) to demonstrate it.

## MySQL

You can use standard MySQL client to connect to a running GreptimeDB instance.

``` bash
$ mysql -h 127.0.0.1 -P 4002
mysql>
```

[PostgreSQL client](./supported-protocols/postgresql.md) is supported too.


### Creating a database

The default database is `public`, you can create a database:

```sql
CREATE DATABASE test;
```

```sql
Query OK, 1 row affected (0.05 sec)
```

### List Existing Databases

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

### Creating a Table

In this example, we are going to create a table named `monitor`

```sql
CREATE TABLE monitor (
  host STRING,
  ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cpu DOUBLE DEFAULT 0,
  memory DOUBLE,
  TIME INDEX (ts),
  PRIMARY KEY(host)) ENGINE=mito WITH(regions=1);
```

``` sql
Query OK, 1 row affected (0.03 sec)
```

#### `CREATE TABLE` syntax

- Timestamp column: GreptimeDB is a time-series database system, a time-series column must
be explicitly specified by `TIME INDEX` keyword when creating tables. The data type of
time-series column can be both `BIGINT` or `TIMESTAMP`. If `BIGINT` is chosen as the
data type for the time-series column, the inserted value of that column will be
automatically converted to a timestamp in milliseconds.
- Primary key: primary key is used to uniquely define a series of data, which is similar
to tags in other time-series systems like [InfluxDB][1].
- Table options: when creating a table, you can specify a set of table options, click [here](../reference/sql/create.md#table-options) for more details.

[1]: <https://docs.influxdata.com/influxdb/v1.8/concepts/glossary/#tag-key>


#### Creating a table in other database

GreptimeDB doesn't support `USE [DATABASE]` statement at the moment, so you must use `[database].[table]` as the table name to create or manipulate a table in other databases:

```sql
CREATE TABLE test.monitor (
  host STRING,
  ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cpu DOUBLE DEFAULT 0,
  memory DOUBLE,
  TIME INDEX (ts),
  PRIMARY KEY(host)) ENGINE=mito WITH(regions=1);
```

``` sql
Query OK, 1 row affected (0.03 sec)
```


### List Existing Tables

You can use `show tables` statement to list existing tables

``` sql
show tables;
```
``` sql
+------------+
| Tables     |
+------------+
| monitor    |
| scripts    |
+------------+
3 rows in set (0.00 sec)
```

Notice: `script` table is a built-in table that holds User-Defined Functions (UDFs).
Currently only table name filtering is supported. You can filter existing tables by their names.

``` sql
show tables like monitor;
```
``` sql
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

### Describe Table

Show table information in detail:

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


### Alter Table

You can alter the schema of existing tables just like in MySQL database

``` sql
alter table monitor add label varchar;
```

```sql
Query OK, 0 rows affected (0.03 sec)
```

``` sql
alter table monitor drop column label;
```

```sql
Query OK, 0 rows affected (0.03 sec)
```


Notice: currently only adding/dropping columns is allowed, altering column definition will soon be supported.
