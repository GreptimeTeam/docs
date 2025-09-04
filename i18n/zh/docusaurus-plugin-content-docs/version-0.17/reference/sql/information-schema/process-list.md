---
keywords: [查询, process_list, processlist, 查询管理]
description: 提供当前正在运行的查询列表的内部表。
---

# PROCESS_LIST

`PROCESS_LIST` 表提供了 GreptimeDB 集群中所有正在运行的查询的视图。

:::tip NOTE
`PROCESS_LIST`表特意选择了一个与 MySQL 的 `PROCESSLIST` 不同的名称，因为它们的列并不相通。
:::

```sql
USE INFORMATION_SCHEMA;
DESC PROCESS_LIST;
```

输出如下：

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

`PROCESS_LIST` 表中的字段描述如下：

- `id`: 查询的 ID。
- `catalog`: 查询的 catalog 名称。
- `schemas`: 客户端发出查询时所处的 schema 名称。
- `query`: 查询语句。
- `client`: 客户端信息，包括客户端地址和使用的协议。
- `frontend`: 查询正在运行的 frontend 实例。
- `start_timestamp`: 查询的开始时间戳。
- `elapsed_time`: 查询已运行多长时间。

:::tip NOTE
你还可以使用 `SHOW [FULL] PROCESSLIST` 语句作为直接查询 `INFORMATION_SCHEMA.PROCESS_LIST` 表的替代方法。
:::


# 终止一个查询

当从 `PROCESS_LIST` 表中识别到正在运行的查询时，你可以使用 `KILL <PROCESS_ID>` 语句终止该查询，其中 `<PROCESS_ID>` 是 `PROCESS_LIST` 表中的 `id` 字段。

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
