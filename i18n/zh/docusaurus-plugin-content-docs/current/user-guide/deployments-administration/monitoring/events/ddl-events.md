---
keywords: [GreptimeDB 事件, DDL 事件]
description: 查看 GreptimeDB 记录的 DDL 事件。
---

# DDL 事件

公共字段和 Procedure 状态请参阅[事件数据模型](/user-guide/deployments-administration/monitoring/events/event-data-model.md)。

## 数据库事件

```sql
SELECT timestamp, type, procedure_state AS state,
       json_get_string(procedure_trigger, 'type') AS trigger_type,
       json_to_string(payload) AS payload
FROM greptime_private.events
WHERE timestamp >= now() - INTERVAL '1' hour
  AND schema_name = '<database_name>'
  AND type = '<event_type>'
ORDER BY timestamp;
```

数据库事件类型包括 `create_database`、`alter_database` 和 `drop_database`。
事件记录保留 `schema_name`。本查询用该列筛选，但不在结果中显示它。

**`create_database`**

```sql
+-------------------------------+-----------------+---------+--------------+----------------------------------------------------------------------------------+
| timestamp                     | type            | state   | trigger_type | payload                                                                          |
+-------------------------------+-----------------+---------+--------------+----------------------------------------------------------------------------------+
| 2026-08-10 11:39:18.014737397 | create_database | Running | Submitted    | {"create_if_not_exists":true,"options":[{"key":"ttl","value":"1h"}],"version":1} |
| 2026-08-10 11:39:18.052757527 | create_database | Done    | Succeeded    | null                                                                             |
+-------------------------------+-----------------+---------+--------------+----------------------------------------------------------------------------------+
```

**`alter_database`**

```sql
+-------------------------------+----------------+---------+--------------+---------------------------------------------------------------------+
| timestamp                     | type           | state   | trigger_type | payload                                                             |
+-------------------------------+----------------+---------+--------------+---------------------------------------------------------------------+
| 2026-08-10 11:39:18.060198497 | alter_database | Running | Submitted    | {"action":"set","options":[{"key":"ttl","value":"2h"}],"version":1} |
| 2026-08-10 11:39:18.107764363 | alter_database | Done    | Succeeded    | null                                                                |
+-------------------------------+----------------+---------+--------------+---------------------------------------------------------------------+
```

**`drop_database`**

```sql
+-------------------------------+---------------+---------+--------------+-------------------------------------+
| timestamp                     | type          | state   | trigger_type | payload                             |
+-------------------------------+---------------+---------+--------------+-------------------------------------+
| 2026-08-10 11:39:18.113713574 | drop_database | Running | Submitted    | {"drop_if_exists":true,"version":1} |
| 2026-08-10 11:39:18.197868233 | drop_database | Done    | Succeeded    | null                                |
+-------------------------------+---------------+---------+--------------+-------------------------------------+
```

## 表事件

```sql
SELECT timestamp, type, procedure_state,
       json_get_string(procedure_trigger, 'type') AS trigger_type,
       table_name, table_id, json_to_string(payload) AS payload
FROM greptime_private.events
WHERE timestamp >= now() - INTERVAL '1' hour
  AND schema_name = '<database_name>'
  AND type = '<event_type>'
ORDER BY timestamp;
```

该查询返回过去一小时内、指定数据库中指定类型的表事件。若只查询某张表，
请在 `WHERE` 子句中添加 `AND table_name = '<table_name>'`。

同一张表的事件记录会保留 `table_name`。`create_table` 和
`create_logical_tables` 成功后，只有 Procedure 返回分配的 ID，记录中才会包含
`table_id`。`alter_table`、`truncate_table` 和 `drop_table` 在提交时已经知道
表 ID，因此它们的事件记录会包含 `table_id`。

GreptimeDB 还会记录 `create_logical_tables` 和 `alter_logical_tables` 事件。两者会为每张逻辑表的每个生命周期触发类型各写入一行，因此按 `procedure_id` 查询时，同一触发类型可能返回多行。`undrop_table` 和 `purge_dropped_table` 仅企业版支持。

**`create_table`**

```sql
+-------------------------------+--------------+-----------------+--------------+----------------+----------+------------------------------------------------------------+
| timestamp                     | type         | procedure_state | trigger_type | table_name     | table_id | payload                                                    |
+-------------------------------+--------------+-----------------+--------------+----------------+----------+------------------------------------------------------------+
| 2026-08-10 11:39:53.544351589 | create_table | Running         | Submitted    | ddl_source     |     NULL | {"create_if_not_exists":false,"engine":"mito","version":1} |
| 2026-08-10 11:39:53.620080844 | create_table | Done            | Succeeded    | ddl_source     |     1449 | null                                                       |
+-------------------------------+--------------+-----------------+--------------+----------------+----------+------------------------------------------------------------+
```

**`alter_table`**

```sql
+-------------------------------+-------------+-----------------+--------------+------------+----------+------------------------------------+
| timestamp                     | type        | procedure_state | trigger_type | table_name | table_id | payload                            |
+-------------------------------+-------------+-----------------+--------------+------------+----------+------------------------------------+
| 2026-08-10 11:40:23.445906161 | alter_table | Running         | Submitted    | ddl_source |     1449 | {"kind":"add_columns","version":1} |
| 2026-08-10 11:40:23.539710789 | alter_table | Done            | Succeeded    | ddl_source |     1449 | null                               |
+-------------------------------+-------------+-----------------+--------------+------------+----------+------------------------------------+
```

**`truncate_table`**

```sql
+-------------------------------+----------------+-----------------+--------------+----------------+----------+------------------------------------+
| timestamp                     | type           | procedure_state | trigger_type | table_name     | table_id | payload                            |
+-------------------------------+----------------+-----------------+--------------+----------------+----------+------------------------------------+
| 2026-08-10 11:40:51.949349425 | truncate_table | Running         | Submitted    | ddl_drop_probe |     1451 | {"time_range_count":0,"version":1} |
| 2026-08-10 11:40:51.982366731 | truncate_table | Done            | Succeeded    | ddl_drop_probe |     1451 | null                               |
+-------------------------------+----------------+-----------------+--------------+----------------+----------+------------------------------------+
```

**`drop_table`**

```sql
+-------------------------------+------------+-----------------+--------------+----------------+----------+--------------------------------------+
| timestamp                     | type       | procedure_state | trigger_type | table_name     | table_id | payload                              |
+-------------------------------+------------+-----------------+--------------+----------------+----------+--------------------------------------+
| 2026-08-10 11:40:51.986072827 | drop_table | Running         | Submitted    | ddl_drop_probe |     1451 | {"drop_if_exists":false,"version":1} |
| 2026-08-10 11:40:52.061732144 | drop_table | Done            | Succeeded    | ddl_drop_probe |     1451 | null                                 |
+-------------------------------+------------+-----------------+--------------+----------------+----------+--------------------------------------+
```

## Flow 事件

Flow 行保留 `catalog_name` 和 `flow_name`。Flow 的 `schema_name` 是 SQL `NULL`，
但 `flow_name` 仍会保留。`create_flow` 在可用时新增 `flow_id`，`drop_flow` 保留已知的 ID。

```sql
SELECT timestamp, type, procedure_state,
       json_get_string(procedure_trigger, 'type') AS trigger_type,
       catalog_name, schema_name, flow_name, flow_id,
       json_to_string(payload) AS payload
FROM greptime_private.events
WHERE timestamp >= now() - INTERVAL '1' hour
  AND flow_name = '<flow_name>'
  AND type = '<event_type>'
ORDER BY timestamp;
```

**`create_flow`**

```sql
+-------------------------------+-------------+-----------------+--------------+--------------+-------------+-----------+---------+-----------------------------------------------------------------------------------------------------------+
| timestamp                     | type        | procedure_state | trigger_type | catalog_name | schema_name | flow_name | flow_id | payload                                                                                                   |
+-------------------------------+-------------+-----------------+--------------+--------------+-------------+-----------+---------+-----------------------------------------------------------------------------------------------------------+
| 2026-08-10 11:41:47.833758897 | create_flow | Running         | Submitted    | greptime     | NULL        | ddl_flow  |    NULL | {"create_if_not_exists":false,"eval_interval_secs":10,"expire_after":null,"or_replace":false,"version":1} |
| 2026-08-10 11:41:47.857319802 | create_flow | Done            | Succeeded    | greptime     | NULL        | ddl_flow  |    1025 | null                                                                                                      |
+-------------------------------+-------------+-----------------+--------------+--------------+-------------+-----------+---------+-----------------------------------------------------------------------------------------------------------+
```

**`drop_flow`**

```sql
+-------------------------------+-----------+-----------------+--------------+--------------+-------------+-----------+---------+--------------------------------------+
| timestamp                     | type      | procedure_state | trigger_type | catalog_name | schema_name | flow_name | flow_id | payload                              |
+-------------------------------+-----------+-----------------+--------------+--------------+-------------+-----------+---------+--------------------------------------+
| 2026-08-10 11:41:47.864231473 | drop_flow | Running         | Submitted    | greptime     | NULL        | ddl_flow  |    1025 | {"drop_if_exists":false,"version":1} |
| 2026-08-10 11:41:47.926665304 | drop_flow | Done            | Succeeded    | greptime     | NULL        | ddl_flow  |    1025 | null                                 |
+-------------------------------+-----------+-----------------+--------------+--------------+-------------+-----------+---------+--------------------------------------+
```

## View 事件

View 行保留稳定的 `view_name`。`create_view` 只有在可用时才新增 `view_id`，
`drop_view` 保留已知的 ID。

```sql
SELECT timestamp, type, procedure_state,
       json_get_string(procedure_trigger, 'type') AS trigger_type,
       view_name, view_id, json_to_string(payload) AS payload
FROM greptime_private.events
WHERE timestamp >= now() - INTERVAL '1' hour
  AND schema_name = '<database_name>'
  AND view_name = '<view_name>'
  AND type = '<event_type>'
ORDER BY timestamp;
```

本查询使用 `schema_name` 筛选，但不在结果中显示它。

**`create_view`**

```sql
+-------------------------------+-------------+-----------------+--------------+-----------+---------+-----------------------------------------------------------------------------------------------------------+
| timestamp                     | type        | procedure_state | trigger_type | view_name | view_id | payload                                                                                                   |
+-------------------------------+-------------+-----------------+--------------+-----------+---------+-----------------------------------------------------------------------------------------------------------+
| 2026-08-10 11:41:18.483028192 | create_view | Running         | Submitted    | ddl_view  |    NULL | {"column_count":0,"create_if_not_exists":false,"or_replace":false,"referenced_table_count":1,"version":1} |
| 2026-08-10 11:41:18.513571854 | create_view | Done            | Succeeded    | ddl_view  |    1452 | null                                                                                                      |
+-------------------------------+-------------+-----------------+--------------+-----------+---------+-----------------------------------------------------------------------------------------------------------+
```

**`drop_view`**

```sql
+-------------------------------+-----------+-----------------+--------------+-----------+---------+--------------------------------------+
| timestamp                     | type      | procedure_state | trigger_type | view_name | view_id | payload                              |
+-------------------------------+-----------+-----------------+--------------+-----------+---------+--------------------------------------+
| 2026-08-10 11:41:18.520281932 | drop_view | Running         | Submitted    | ddl_view  |    1452 | {"drop_if_exists":false,"version":1} |
| 2026-08-10 11:41:18.572632167 | drop_view | Done            | Succeeded    | ddl_view  |    1452 | null                                 |
+-------------------------------+-----------+-----------------+--------------+-----------+---------+--------------------------------------+
```
