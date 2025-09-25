---
keywords: [update data, delete data, truncate table, data retention, TTL policies]
description: Provides an overview of managing data in GreptimeDB, including updating, deleting, truncating tables, and managing data retention with TTL policies.
---

# Manage Data

## Update data

### Update data with same tags and time index

Updates can be efficiently performed by inserting new data.
If rows of data have the same tags and time index,
the old data will be replaced with the new data.
This means that you can only update columns with a field type.
To update data, simply insert new data with the same tag and time index as the existing data.

For more information about column types, please refer to the [Data Model](../concepts/data-model.md).

:::warning Note
Excessive updates may negatively impact query performance, even though the performance of updates is the same as insertion.
:::

#### Update all fields in a table

By default, when updating data, all fields will be overwritten with the new values,
except for [InfluxDB line protocol](/user-guide/protocols/influxdb-line-protocol.md), which only [updates the specified fields](#overwrite-specific-fields-in-a-table).
The following example using SQL demonstrates the behavior of overwriting all fields in a table.

Assuming you have a table named `monitor` with the following schema.
The `host` column represents the tag and the `ts` column represents the time index.

```sql
CREATE TABLE monitor (
    host STRING,
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP() TIME INDEX,
    cpu FLOAT64,
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

With the default merge policy,
if columns are omitted in the `INSERT INTO` statement,
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

```sql
+-----------+---------------------+------+--------+
| host      | ts                  | cpu  | memory |
+-----------+---------------------+------+--------+
| 127.0.0.1 | 2024-07-11 20:00:00 | 0.5  | NULL   |
+-----------+---------------------+------+--------+
1 row in set (0.01 sec)
```

### Update specific fields in a table

This update policy is supported by default in the [InfluxDB line protocol](/user-guide/protocols/influxdb-line-protocol.md).
You can also enable this behavior by specifying the `merge_mode` option as `last_non_null` when creating a table using SQL.
Here's an example:

```sql
CREATE TABLE monitor (
    host STRING,
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP() TIME INDEX,
    cpu FLOAT64,
    memory FLOAT64,
    PRIMARY KEY(host)
) WITH ('merge_mode'='last_non_null');
```

```sql
INSERT INTO monitor (host, ts, cpu, memory)
VALUES ("127.0.0.1", "2024-07-11 20:00:00", 0.8, 0.1);
```

To update specific fields in the `monitor` table,
you can insert new data with only the fields you want to update.
For example:

```sql
INSERT INTO monitor (host, ts, cpu)
VALUES ("127.0.0.1", "2024-07-11 20:00:00", 0.5);
```

This will update the `cpu` field while leaving the `memory` field unchanged.
The result will be:

```sql
+-----------+---------------------+------+--------+
| host      | ts                  | cpu  | memory |
+-----------+---------------------+------+--------+
| 127.0.0.1 | 2024-07-11 20:00:00 |  0.5 |    0.1 |
+-----------+---------------------+------+--------+
```


Notice that the `last_non_null` merge mode cannot update the old value to `NULL`.
For example:


```sql
INSERT INTO monitor (host, ts, cpu, memory)
VALUES ("127.0.0.1", "2024-07-11 20:00:01", 0.8, 0.1);
```

```sql
INSERT INTO monitor (host, ts, cpu)
VALUES ("127.0.0.1", "2024-07-11 20:00:01", NULL);
```

That will not update anything:

```sql
+-----------+---------------------+------+--------+
| host      | ts                  | cpu  | memory |
+-----------+---------------------+------+--------+
| 127.0.0.1 | 2024-07-11 20:00:01 |  0.8 |    0.1 |
+-----------+---------------------+------+--------+
```

For more information about the `merge_mode` option, please refer to the [CREATE TABLE](/reference/sql/create.md#create-a-table-with-merge-mode) statement.

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
    api_path STRING FULLTEXT INDEX,
    log_level STRING,
    log STRING FULLTEXT INDEX,
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

## Delete Data

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

## Truncate Table

To delete all data in a table, you can use the `TRUNCATE TABLE` statement in SQL.
For example, to truncate the `monitor` table:

```sql
TRUNCATE TABLE monitor;
```

For more information about the `TRUNCATE TABLE` statement, refer to the [SQL TRUNCATE TABLE](/reference/sql/truncate.md) documentation.

## Manage data retention with TTL policies

You can use Time to Live (TTL) policies to automatically remove stale data from your databases. TTL allows you to set policies to periodically delete data from tables. Setting TTL policies has the following benefits:

- Decrease storage costs by cleaning out obsolete data.
- Reduce the number of rows the database has to scan for some queries, potentially increasing query performance.

> Please note that the expired data due to TTL policy may not be deleted right after the expiration time. Instead, they are deleted during the compaction, which is a background job run asynchronously.
> If you are testing the TTL policy, be sure to trigger data flush and compaction before querying the data.
> You can use our "[ADMIN](/reference/sql/admin.md)" functions to manually run them.

You can set TTL for every table when creating it. For example, the following SQL statement creates a table named `monitor` with a TTL policy of 7 days:

```sql
CREATE TABLE monitor (
    host STRING,
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP() TIME INDEX,
    cpu FLOAT64,
    memory FLOAT64,
    PRIMARY KEY(host)
) WITH ('ttl'='7d');
```

You can also create a database-level TTL policy. For example, the following SQL statement creates a database named `test` with a TTL policy of 7 days:

```sql
CREATE DATABASE test WITH ('ttl'='7d');
```

You can set TTL policies at both the table level and the database level simultaneously.
If a table has its own TTL policy,
it will take precedence over the database TTL policy.
Otherwise, the database TTL policy will be applied to the table.

The value of `'ttl'` can be one of duration (like `1hour 12min 5s`), `instant` or `forever`. See details in [CREATE](/reference/sql/create.md#create-a-table-with-ttl) statement.

Use [`ALTER`](/reference/sql/alter.md#alter-table-options) to modify the TTL of an existing table or database:

```sql
-- for table
ALTER TABLE monitor SET 'ttl'='1 month';
-- for database
ALTER DATABASE test SET 'ttl'='1 month';
```

If you want to remove the TTL policy, you can use the following SQL

```sql
-- for table
ALTER TABLE monitor UNSET 'ttl';
-- or for database
ALTER DATABASE test UNSET 'ttl';
```

For more information about TTL policies, please refer to the [CREATE](/reference/sql/create.md) statement.


## More data management operations

For more advanced data management operations, such as basic table operations, table sharding and region migration, please refer to the [Data Management](/user-guide/deployments-administration/manage-data/overview.md) in the administration section.

