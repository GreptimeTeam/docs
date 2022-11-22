# Table Management

## Introduction

GreptimeDB provides table management functionality on both MySQL and gRPC protocol.

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

[1]: <https://docs.influxdata.com/influxdb/v1.8/concepts/glossary/#tag-key>


#### Creating a table in other database

GreptimeDB doesn't support `USE [DATABASE]` statement right now, so you must use `[database].[table]` as the table name to create or manipulate a table in other databases:

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
mysql> alter table monitor add column label varchar null;
Query OK, 0 rows affected (0.03 sec)
```

Notice: currently only adding columns to tables is allowed, deleting columns and altering
column definition will soon be supported.

## gRPC

GreptimeDB now supports gRPC API to create tables. Assume that GreptimeDB instance has been started
and is listening for incoming gRPC requests on `127.0.0.1:4200`

### Create a table

```shell
$ grpcurl -plaintext -d '
{
  "header": { "tenant": "0" },
  "admins": [
    {
      "name": "greptime",
      "exprs": [
        {
          "header": { "version": 1 },
          "create": {
            "table_name": "hello_greptime",
            "column_defs": [
              {
                "name": "c1",
                "datatype": 3,
                "is_nullable": false
              },
              {
                "name": "c2",
                "datatype": 12,
                "is_nullable": true
              },
              {
                "name": "ts",
                "datatype": 15,
                "is_nullable": false
              }
            ],
            "time_index": "ts",
            "create_if_not_exists": true,
            "table_options": {
              "region_id": "0"
            }
          }
        }
      ]
    }
  ]
}
' 127.0.0.1:4200 greptime.v1.Greptime/Batch
```

If the table is created, GreptimeDB will respond like

``` json
{
  "admins": [
    {
      "results": [
        {
          "header": {
            "version": 1
          },
          "mutate": {
            "success": 1
          }
        }
      ]
    }
  ],
  "databases": [{}]
}
```

### List existing table

gRPC API currently does not support listing tables yet.
