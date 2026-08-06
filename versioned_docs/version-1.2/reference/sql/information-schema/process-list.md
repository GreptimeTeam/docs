---
keywords: [query, process_list, processlist, task management]
description: Provides a view of running queries in cluster.
---

# PROCESS_LIST

The `PROCESS_LIST` table provides a view of all running queries in GreptimeDB cluster.

:::tip NOTE
It's intentionally to have a different table name than MySQL's `PROCESSLIST` because it has a very different set of columns.
:::

```sql
USE INFORMATION_SCHEMA;
DESC PROCESS_LIST;
```

The output is as follows:

```sql
+-----------------+----------------------+------+------+---------+---------------+
| Column          | Type                 | Key  | Null | Default | Semantic Type |
+-----------------+----------------------+------+------+---------+---------------+
| id              | String               |      | NO   |         | FIELD         |
| catalog         | String               |      | NO   |         | FIELD         |
| schemas         | String               |      | NO   |         | FIELD         |
| query           | String               |      | NO   |         | FIELD         |
| client          | String               |      | NO   |         | FIELD         |
| frontend        | String               |      | NO   |         | FIELD         |
| start_timestamp | TimestampMillisecond |      | NO   |         | FIELD         |
| elapsed_time    | DurationMillisecond  |      | NO   |         | FIELD         |
+-----------------+----------------------+------+------+---------+---------------+
```

Fields in the `PROCESS_LIST` table are described as follows:

- `id`: The ID of query.
- `catalog`: The catalog name of the query.
- `schemas`: The schema name in which client issues the query.
- `query`: The query statement.
- `client`: Client information, including client address and channel.
- `frontend`: On which frontend instance the query is running.
- `start_timestamp`: The start timestamp of query.
- `elapsed_time`: How long the query has been running.

:::tip NOTE
You can also use `SHOW [FULL] PROCESSLIST` statement as an alternative to querying from `INFORMATION_SCHEMA.PROCESS_LIST` table.
:::


# Terminating a query
When identified a running query from `PROCESS_LIST` table, you can terminate the query using `KILL <PROCESS_ID>` statement, where the `<PROCESS_ID>` is the `id` field in `PROCESS_LIST` table.

```sql
mysql> select * from process_list;
+-----------------------+----------+--------------------+----------------------------+------------------------+---------------------+----------------------------+-----------------+
| id                    | catalog  | schemas            | query                      | client                 | frontend            | start_timestamp            | elapsed_time    |
+-----------------------+----------+--------------------+----------------------------+------------------------+---------------------+----------------------------+-----------------+
| 112.40.36.208/7 | greptime | public | SELECT * FROM some_very_large_table | mysql[127.0.0.1:34692] | 112.40.36.208:4001 | 2025-06-30 07:04:11.118000 | 00:00:12.002000 |
+-----------------------+----------+--------------------+----------------------------+------------------------+---------------------+----------------------------+-----------------+

KILL '112.40.36.208/7';
Query OK, 1 row affected (0.00 sec)
```
