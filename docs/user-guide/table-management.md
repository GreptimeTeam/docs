# Table Management

## Introduction

GreptimeDB provides table management functionality on both MySQL and gRPC protocol.

## MySQL

You can use standard MySQL client to connect to a running GreptimeDB instance.

``` bash
$ mysql -h 127.0.0.1 -P 4002
mysql>
```

### Creating a Table

In this example, we are going to create a table named `monitor`

``` shell
mysql> CREATE TABLE monitor (
    ->   host STRING,
    ->   ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ->   cpu DOUBLE DEFAULT 0,
    ->   memory DOUBLE,
    ->   TIME INDEX (ts),
    ->   PRIMARY KEY(host)) ENGINE=mito WITH(regions=1);
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

> TBD:  Creating table in distributed mode.

### List Existing Tables

You can use `show tables` statement to list existing tables

``` shell
mysql> show tables;
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

``` shell
mysql> show tables like monitor;
+---------+
| Tables  |
+---------+
| monitor |
+---------+
1 row in set (0.00 sec)
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

``` shell
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
