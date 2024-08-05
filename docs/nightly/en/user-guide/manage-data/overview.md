# Overview

## Updating data

### Update data with same tags and time index

Updates can be effectively performed by insertions.
By default, if the tags and time index have identical column values, the old data will be replaced with the new one.
For more information about column types, please refer to the [Data Model](../concepts/data-model.md).

:::warning Note
Excessive updates may negatively impact query performance, even though the performance of updates is the same as insertion.
:::

To update data, you can insert new data with the same tag and time index as the existing data.
This updating mechanism is supported by all GreptimeDB protocols in the [Ingest Data documents](/user-guide/ingest-data/overview.md). The following example uses SQL.

Assuming you have a table named `monitor` with the following schema.
The `host` column represents the tag and the `ts` column represents the time index.

```sql
CREATE TABLE monitor (
    host STRING,
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP() TIME INDEX,
    cpu FLOAT64 DEFAULT 0,
    memory FLOAT64,
    PRIMARY KEY(host)
);
```

Insert a new row into the `monitor` table:

```sql
INSERT INTO monitor (host, ts, cpu, memory)
VALUES ("127.0.0.1", "2024-07-11 20:00:00", 0.8, 0.1);
```

Check the data in the table:

```sql
SELECT * FROM monitor;
```

```sql
+-----------+---------------------+------+--------+
| host      | ts                  | cpu  | memory |
+-----------+---------------------+------+--------+
| 127.0.0.1 | 2024-07-11 20:00:00 | 0.8  | 0.1    |
+-----------+---------------------+------+--------+
1 row in set (0.00 sec)
```

To update the data, you can use the same `host` and `ts` values as the existing data and set the new `cpu` value to `0.5`:

```sql
INSERT INTO monitor (host, ts, cpu, memory)
-- The same tag `127.0.0.1` and the same time index 2024-07-11 20:00:00
VALUES ("127.0.0.1", "2024-07-11 20:00:00", 0.5, 0.1);
```

The new data will be:

```sql
SELECT * FROM monitor;
```

```sql
+-----------+---------------------+------+--------+
| host      | ts                  | cpu  | memory |
+-----------+---------------------+------+--------+
| 127.0.0.1 | 2024-07-11 20:00:00 | 0.5  | 0.1    |
+-----------+---------------------+------+--------+
1 row in set (0.01 sec)
```

Note that you **cannot omit** the other columns in the `INSERT INTO` statement if you only want to update one column.
If you omit the other columns,
they will be overwritten with the default values.
For example:

```sql
INSERT INTO monitor (host, ts, cpu)
VALUES ("127.0.0.1", "2024-07-11 20:00:00", 0.5);
```

The default value of the `memory` column in the `monitor` table is `NULL`. Therefore, the new data will be:

```sql
SELECT * FROM monitor;
```

The output will be:

```sql
+-----------+---------------------+------+--------+
| host      | ts                  | cpu  | memory |
+-----------+---------------------+------+--------+
| 127.0.0.1 | 2024-07-11 20:00:00 | 0.5  | NULL   |
+-----------+---------------------+------+--------+
1 row in set (0.01 sec)
```

### Avoid updating data by creating table with `append_mode` option

GreptimeDB supports an `append_mode` option when creating a table,
which always inserts new data to the table.
This is especially useful when you want to keep all historical data, such as logs.

You can only create a table with the `append_mode` option using SQL.
After successfully creating the table,
all protocols [ingest data](/user-guide/ingest-data/overview.md) to the table will always insert new data.

For example, you can create an `app_logs` table with the `append_mode` option as follows.
The `host` and `log_level` columns represent tags, and the `ts` column represents the time index.

```sql
CREATE TABLE app_logs (
    ts TIMESTAMP TIME INDEX,
    host STRING,
    api_path STRING FULLTEXT,
    log_level STRING,
    log STRING FULLTEXT,
    PRIMARY KEY (host, log_level)
) WITH ('append_mode'='true');
```

Insert a new row into the `app_logs` table:

```sql
INSERT INTO app_logs (ts, host, api_path, log_level, log)
VALUES ('2024-07-11 20:00:10', 'host1', '/api/v1/resource', 'ERROR', 'Connection timeout');
```

Check the data in the table:

```sql
SELECT * FROM app_logs;
```

The output will be:

```sql
+---------------------+-------+------------------+-----------+--------------------+
| ts                  | host  | api_path         | log_level | log                |
+---------------------+-------+------------------+-----------+--------------------+
| 2024-07-11 20:00:10 | host1 | /api/v1/resource | ERROR     | Connection timeout |
+---------------------+-------+------------------+-----------+--------------------+
1 row in set (0.01 sec)
```

You can insert new data with the same tag and time index:

```sql
INSERT INTO app_logs (ts, host, api_path, log_level, log)
-- The same tag `host1` and `ERROR`, the same time index 2024-07-11 20:00:10
VALUES ('2024-07-11 20:00:10', 'host1', '/api/v1/resource', 'ERROR', 'Connection reset');
```

Then you will find two rows in the table:

```sql
SELECT * FROM app_logs;
```

```sql
+---------------------+-------+------------------+-----------+--------------------+
| ts                  | host  | api_path         | log_level | log                |
+---------------------+-------+------------------+-----------+--------------------+
| 2024-07-11 20:00:10 | host1 | /api/v1/resource | ERROR     | Connection reset   |
| 2024-07-11 20:00:10 | host1 | /api/v1/resource | ERROR     | Connection timeout |
+---------------------+-------+------------------+-----------+--------------------+
2 rows in set (0.01 sec)
```

## Deleting Data

You can effectively delete data by specifying tags and time index.
Deleting data without specifying the tag and time index columns is not efficient, as it requires two steps: querying the data and then deleting it by tag and time index.
For more information about column types, please refer to the [Data Model](../concepts/data-model.md).

:::warning Warning
Excessive deletions can negatively impact query performance.
:::

You can only delete data using SQL.
For example, to delete a row from the `monitor` table with tag `host` and timestamp index `ts`:

```sql
DELETE FROM monitor WHERE host='127.0.0.2' AND ts=1667446798450;
```

The output will be:

```sql
Query OK, 1 row affected (0.00 sec)
```

For more information about the `DELETE` statement, please refer to the [SQL DELETE](/reference/sql/delete.md).

























## Update data

### Update data by the same tags and time index

Updates can be effectively performed by insertions.
Be default, If the tags and time index have identical column values, the old data will be replaced with the new one.
For more information about column types, please refer to [Data Model](../concepts/data-model.md).

:::warning NOTE
The performance of updates is the same as insertion, but excessive updates may negatively impact query performance.
:::

You can update data by inserting data with the same tag and time index as the existing data.
This updating machanism is supported by all GreptimeDB protocols in the [Ingest Data documents](/user-guide/ingest-data/overview.md).
This section uses SQL as an example.

For example, a table named `monitor` has the following schema.


```sql
CREATE TABLE monitor (
  host STRING,
  ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP() TIME INDEX,
  cpu FLOAT64 DEFAULT 0,
  memory FLOAT64,
  PRIMARY KEY(host));
```

Insert a new row into the `monitor` table:

```sql
INSERT INTO monitor (host, ts, cpu, memory)
VALUES
    ("127.0.0.1", "2024-07-11 20:00:00", 0.8, 0.1);
```

Check the data in the table:

```sql
select * from monitor;
```

```sql
+-----------+---------------------+------+--------+
| host      | ts                  | cpu  | memory |
+-----------+---------------------+------+--------+
| 127.0.0.1 | 2024-07-11 20:00:00 |  0.8 |    0.1 |
+-----------+---------------------+------+--------+
1 row in set (0.00 sec)
```

To update the data, you can use the same `host` and `ts` values as the existing data
and set the new `cpu` value to `0.5`:

```sql
INSERT INTO monitor (host, ts, cpu, memory)
VALUES
    -- The same tag `127.0.0.1` and the same time index 2024-07-11 20:00:00
    ("127.0.0.1", "2024-07-11 20:00:00", 0.5, 0.1);
```

The new data is:

```sql
select * from monitor;
```

```sql
+-----------+---------------------+------+--------+
| host      | ts                  | cpu  | memory |
+-----------+---------------------+------+--------+
| 127.0.0.1 | 2024-07-11 20:00:00 |  0.5 |    0.1 |
+-----------+---------------------+------+--------+
1 row in set (0.01 sec)
```

Note that you **cannot omit** the other columns in the `INSERT INTO` statement if you only want to update one column.
If you omit the other columns,
they will be overwritten with the default values. For example:

```sql
INSERT INTO monitor (host, ts, cpu)
VALUES
    ("127.0.0.1", "2024-07-11 20:00:00", 0.5);
```

The default value of the `memory` column in the `monitor` table is `NULL`. Therefore, the new data will be:

```sql
select * from monitor;
```

```sql
+-----------+---------------------+------+--------+
| host      | ts                  | cpu  | memory |
+-----------+---------------------+------+--------+
| 127.0.0.1 | 2024-07-11 20:00:00 |  0.5 |   NULL |
+-----------+---------------------+------+--------+
1 row in set (0.01 sec)
```

### Do not update data by creating table with `append_mode` option

GreptimeDB supports an `append_mode` option when creating a table,
which will always insert new data to tables.
This is especially useful when you want to keep all historical data such as logs.

You can only create a table with the `append_mode` option by SQL.
After table creation successfully, all protocols [ingest data](/user-guide/ingest-data/overview.md) to the table will always insert new data.

For example, you can create an `app_logs` table with the `append_mode` option as follows.
The `host` and `log_level` columns represent tags and the `ts` column represents the time index.

```sql
CREATE TABLE app_logs (
  ts TIMESTAMP TIME INDEX,
  host STRING,
  api_path STRING FULLTEXT,
  log_level STRING,
  log STRING FULLTEXT,
  PRIMARY KEY (host, log_level)
) with('append_mode'='true');
```

Insert a new row into the `app_logs` table:

```sql
INSERT INTO app_logs (ts, host, api_path, log_level, log) VALUES
  ('2024-07-11 20:00:10', 'host1', '/api/v1/resource', 'ERROR', 'Connection timeout');
```

Check the data in the table:

```sql
select * from app_logs;
```

```sql
+---------------------+-------+------------------+-----------+--------------------+
| ts                  | host  | api_path         | log_level | log                |
+---------------------+-------+------------------+-----------+--------------------+
| 2024-07-11 20:00:10 | host1 | /api/v1/resource | ERROR     | Connection timeout |
+---------------------+-------+------------------+-----------+--------------------+
1 row in set (0.01 sec)
```

You can insert new data with the same tag and time index:
    
```sql
INSERT INTO app_logs (ts, host, api_path, log_level, log) VALUES
  -- The same tag `host1` and `ERROR`, the same time index 2024-07-11 20:00:10
  ('2024-07-11 20:00:10', 'host1', '/api/v1/resource', 'ERROR', 'Connection reset');
```

Then you will find two rows in the table:

```sql
select * from app_logs;
```

```sql
+---------------------+-------+------------------+-----------+--------------------+
| ts                  | host  | api_path         | log_level | log                |
+---------------------+-------+------------------+-----------+--------------------+
| 2024-07-11 20:00:10 | host1 | /api/v1/resource | ERROR     | Connection reset   |
| 2024-07-11 20:00:10 | host1 | /api/v1/resource | ERROR     | Connection timeout |
+---------------------+-------+------------------+-----------+--------------------+
2 rows in set (0.01 sec)
```

## Delete data

You can effectively delete data by specifying tags and time index.
Deleting data without specifying the tag and time index columns is not efficient, as it requires two steps: querying the data and then deleting it by tag and time index.
For more information about column types, please refer to [Data Model](../concepts/data-model.md).

:::warning WARNING
Excessive deletions can negatively impact query performance.
:::

You can only delete data by SQL.
For example, delete a row from it by tag `host` and timestamp index `ts`:

```sql
DELETE FROM monitor WHERE host='127.0.0.2' and ts=1667446798450;
```

```sql
Query OK, 1 row affected (0.00 sec)
```

For more information about the `DELETE` statement, please refer to the [SQL DELETE](/reference/sql/delete.md).
