# Reading/Writing Data

You can read from or write into GreptimeDB using various protocols.

![protocols](../public/b8fade22-59b2-42a8-aab9-a79cdca36d27.png)

This document will focus on two main protocols, SQL and gRPC, to
illustrate reading and writing in GreptimeDB. The list of other
supported protocols can be found here, for detailed ways of how to do it.

Note that writing data in a specific protocol does not mean that you
have to read data with the same protocol. For example, you can write
data through Prometheus endpoint while using MySQL client to read them.

## SQL

GreptimeDB supports executing standard SQL. You can use either MySQL
or PostgreSQL's wire protocol to read from or write into GreptimeDB
through all kinds of client tools or connectors they provide.

The following guide uses standard MySQL clients to demonstrate how to do it.

### Connecting to GreptimeDB

Start GreptimeDB ([Installation](../installation/overview.md)). GreptimeDB will listen to `127.0.0.1:4002` for MySQL connections by default.

Open your favorite terminal, type `mysql -h 127.0.0.1 -P 4002`, and you are
connected to GreptimeDB.

### Creating Table

First, you need to create a table. Take the SQL
in [Getting Started](../getting-started/overview.md) guide as example:

```SQL
CREATE TABLE system_metrics (
     host STRING,
     idc STRING,
     cpu_util DOUBLE,
     memory_util DOUBLE,
     disk_util DOUBLE,
     ts TIMESTAMP,
     PRIMARY KEY(host, idc),
     TIME INDEX(ts)
);
```

```sql
Query OK, 1 row affected (0.01 sec)
```

A table named `system_metrics` was created. You can use `show tables` to view it:

```sql
show tables;
```

```sql
+----------------+
| Tables         |
+----------------+
| numbers        | <- Predefined table for our testing usage.
| scripts        | <- Predefined table for our Python scripts storage.
| system_metrics | <- This is our newly created table!
+----------------+
3 rows in set (0.00 sec)
```

### Inserting Data with SQL

Let's insert some testing data. You can use the `INSERT INTO` SQL
statements:

```sql
INSERT INTO system_metrics
VALUES
    ("host1", "idc_a", 11.8, 10.3, 10.3, 1667446797460),
    ("host2", "idc_a", 80.1, 70.3, 90.0, 1667446797461),
    ("host1", "idc_b", 50.0, 66.7, 40.6, 1667446797462);
```

```sql
Query OK, 3 rows affected (0.01 sec)
```

Then we are good to query it!

### Querying Data with SQL

You can use the `SELECT` statement to query data:

```sql
select * from system_metrics;
```

```sql
+-------+-------+----------+-------------+-----------+---------------------+
| host  | idc   | cpu_util | memory_util | disk_util | ts                  |
+-------+-------+----------+-------------+-----------+---------------------+
| host1 | idc_a |     11.8 |        10.3 |      10.3 | 2022-11-03 03:39:57 |
| host1 | idc_b |       50 |        66.7 |      40.6 | 2022-11-03 03:39:57 |
| host2 | idc_a |     80.1 |        70.3 |        90 | 2022-11-03 03:39:57 |
+-------+-------+----------+-------------+-----------+---------------------+
3 rows in set (0.01 sec)
```

> Note that currently GreptimeDB does not support MySQL's prepared
> statements and only one database can be used.
> You cannot create a database or use "use database" to switch between databases.

## gRPC

GreptimeDB has developed its gRPC service using Arrow Flight RPC, as described in the [Apache Arrow Flight documentation](https://arrow.apache.org/docs/format/Flight.html). For those interested in using our service with Java, we offer an officially supported SDK, which can be found at [./java-sdk.md](https://chat.openai.com/java-sdk.md). Currently, we are actively working on developing SDKs for other programming languages.
