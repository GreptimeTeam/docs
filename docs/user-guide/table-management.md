# Table Management

GreptimeDB provides table management functionalities via SQL. The following guide
uses [MySQL Command-Line Client](https://dev.mysql.com/doc/refman/8.0/en/mysql.html) to demonstrate it.

## Create a database

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

## Create Table

**GreptimeDB is a schema-less database without creating tables in advance. The table and columns will be created automatically when [writing data](./write-data.md) with protocol gRPC, InfluxDB, OpentsDB, Prometheus remote write.** 

You can still crate a table manully via SQL if you have some special demands. In this example, we are going to create a table named `monitor`.

```sql
CREATE TABLE monitor (
  host STRING,
  ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP TIME INDEX,
  cpu DOUBLE DEFAULT 0,
  memory DOUBLE,
  PRIMARY KEY(host)) ENGINE=mito WITH(regions=1);
```

``` sql
Query OK, 0 row affected (0.03 sec)
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


## List Existing Tables

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

## Describe Table

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


## Alter Table

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


## Drop Table

`DROP TABLE [db.]table` is used to drop the table in `db` or the current database in-use.Drop the table `test` in the current database:

```sql
DROP TABLE monitor;
```
```sql
Query OK, 1 row affected (0.01 sec)
```
**Note: GreptimeDB V0.1 drops the table at the conceptual level, without actually deleting the content of the table. We will fix it ASAP.**

## HTTP API

`/sql` only accepts one parameter:

- sql: the SQL statement.

The API Result contains:

- code: the result integer code. Zero means success, otherwise failure.
- output: the SQL executed result, including schema and rows.

Create table through POST method:

```shell
curl http://localhost:4000/v1/sql -d "sql=CREATE TABLE HTTP_API_TEST(name STRING, value DOUBLE, ts TIMESTAMP default CURRENT_TIMESTAMP, PRIMARY KEY(name), TIME INDEX(ts))"
```

```json
{"code":0,"output":[{"affectedrows":1}],"execution_time_ms":10}
```
