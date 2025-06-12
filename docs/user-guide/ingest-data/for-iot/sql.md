---
keywords: [SQL, MySQL, PostgreSQL, create table, insert data, timestamp, time zone, data ingestion]
description: Guide on executing SQL statements to create tables and insert data into GreptimeDB, with examples using the `monitor` table.
---

# SQL

You can execute SQL statements using [MySQL](/user-guide/protocols/mysql.md) or [PostgreSQL](/user-guide/protocols/postgresql.md) clients, 
and access GreptimeDB using the MySQL or PostgreSQL protocol with any programming language of your preference, such as Java JDBC.
We will use the `monitor` table as an example to show how to write data.

## Create a table

Before inserting data, you need to create a table. For example, create a table named `monitor`:

```sql
CREATE TABLE monitor (
  host STRING,
  ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP() TIME INDEX,
  cpu FLOAT64 DEFAULT 0,
  memory FLOAT64,
  PRIMARY KEY(host));
```

The above statement will create a table with the following schema:

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

For more information about the `CREATE TABLE` statement,
please refer to [table management](/user-guide/deployments-administration/manage-data/basic-table-operations.md#create-a-table).

## Insert data

Let's insert some testing data to the `monitor` table. You can use the `INSERT INTO` SQL statements:

```sql
INSERT INTO monitor
VALUES
    ("127.0.0.1", 1702433141000, 0.5, 0.2),
    ("127.0.0.2", 1702433141000, 0.3, 0.1),
    ("127.0.0.1", 1702433146000, 0.3, 0.2),
    ("127.0.0.2", 1702433146000, 0.2, 0.4),
    ("127.0.0.1", 1702433151000, 0.4, 0.3),
    ("127.0.0.2", 1702433151000, 0.2, 0.4);
```

```sql
Query OK, 6 rows affected (0.01 sec)
```

You can also insert data by specifying the column names:

```sql
INSERT INTO monitor (host, ts, cpu, memory)
VALUES
    ("127.0.0.1", 1702433141000, 0.5, 0.2),
    ("127.0.0.2", 1702433141000, 0.3, 0.1),
    ("127.0.0.1", 1702433146000, 0.3, 0.2),
    ("127.0.0.2", 1702433146000, 0.2, 0.4),
    ("127.0.0.1", 1702433151000, 0.4, 0.3),
    ("127.0.0.2", 1702433151000, 0.2, 0.4);
```

Through the above statement, we have inserted six rows into the `monitor` table.

For more information about the `INSERT` statement, please refer to [`INSERT`](/reference/sql/insert.md).

## Time zone

The time zone specified in the SQL client will affect the timestamp with a string format that does not have time zone information. 
The timestamp value will automatically have the client's time zone information added.

For example, the following SQL set the time zone to `+8:00`:

```sql
SET time_zone = '+8:00';
```

Then insert values into the `monitor` table:

```sql
INSERT INTO monitor (host, ts, cpu, memory)
VALUES
    ("127.0.0.1", "2024-01-01 00:00:00", 0.4, 0.1),
    ("127.0.0.2", "2024-01-01 00:00:00+08:00", 0.5, 0.1);
```

The first timestamp value `2024-01-01 00:00:00` does not have time zone information, so it will automatically have the client's time zone information added.
After inserting, it will be equivalent to the second value `2024-01-01 00:00:00+08:00`.

The result in the `+8:00` time zone client is as follows:

```sql
+-----------+---------------------+------+--------+
| host      | ts                  | cpu  | memory |
+-----------+---------------------+------+--------+
| 127.0.0.1 | 2024-01-01 00:00:00 |  0.4 |    0.1 |
| 127.0.0.2 | 2024-01-01 00:00:00 |  0.5 |    0.1 |
+-----------+---------------------+------+--------+
```

The result in the `UTC` time zone client is as follows:

```sql
+-----------+---------------------+------+--------+
| host      | ts                  | cpu  | memory |
+-----------+---------------------+------+--------+
| 127.0.0.1 | 2023-12-31 16:00:00 |  0.4 |    0.1 |
| 127.0.0.2 | 2023-12-31 16:00:00 |  0.5 |    0.1 |
+-----------+---------------------+------+--------+
```
