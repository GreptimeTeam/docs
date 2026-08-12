---
keywords: [GreptimeDB 事件, 查询事件]
description: 查询 GreptimeDB 事件记录。
---

# 查询事件

可以查询 `greptime_private.events` 系统表来排查最近事件。事件异步写入，刚提交的操作可能
不会马上出现。事件列说明请参阅[事件数据模型](/user-guide/deployments-administration/monitoring/events/event-data-model.md)。

## 查看最近事件

查看最近记录的事件：

```sql
SELECT *
FROM greptime_private.events
ORDER BY timestamp DESC
LIMIT 20;
```

若需聚焦近期操作并只选择所需列，可以加上时间范围：

```sql
SELECT timestamp, type, json_to_string(payload) AS payload
FROM greptime_private.events
WHERE timestamp >= now() - INTERVAL '1' hour
ORDER BY timestamp DESC
LIMIT 20;
```

## 查看并筛选事件类型

按类型筛选前，先查看集群已记录的事件类型：

```sql
SELECT type, COUNT(*) AS event_rows
FROM greptime_private.events
WHERE timestamp >= now() - INTERVAL '1' hour
GROUP BY type
ORDER BY type;
```

该结果只涵盖所选时间范围，不能作为已配置或 GreptimeDB 支持类型的完整清单。
已配置的类型列表请参阅[生命周期事件记录器](/user-guide/deployments-administration/configuration.md#生命周期事件记录器)。
查询示例请参阅 [DDL 事件](/user-guide/deployments-administration/monitoring/events/ddl-events.md)、
[Region 事件](/user-guide/deployments-administration/monitoring/events/region-events.md)和
[维护事件](/user-guide/deployments-administration/monitoring/events/maintenance-events.md)。

将事件类型、数据库和对象名称组合，可以避免混入无关事件：

```sql
SELECT timestamp, type, procedure_state,
       json_get_string(procedure_trigger, 'type') AS trigger_type
FROM greptime_private.events
WHERE type = 'create_table'
  AND timestamp >= now() - INTERVAL '1' hour
  AND schema_name = '<database_name>'
  AND table_name = '<table_name>'
ORDER BY timestamp;
```

示例输出：

```sql
+-------------------------------+--------------+-----------------+--------------+
| timestamp                     | type         | procedure_state | trigger_type |
+-------------------------------+--------------+-----------------+--------------+
| 2026-08-10 11:28:40.590240203 | create_table | Running         | Submitted    |
| 2026-08-10 11:28:40.659064297 | create_table | Done            | Succeeded    |
+-------------------------------+--------------+-----------------+--------------+
```

## 查询对象的最新事件

将占位符替换为对象名称；需要时再填入数据库。每个查询只返回匹配结果中最新的一条事件。

### 数据库

```sql
SELECT timestamp, type, schema_name, procedure_state,
       json_get_string(procedure_trigger, 'type') AS trigger_type
FROM greptime_private.events
WHERE timestamp >= now() - INTERVAL '1' hour
  AND schema_name = '<database_name>'
  AND type IN ('create_database', 'alter_database', 'drop_database')
ORDER BY timestamp DESC
LIMIT 1;
```

### 表

```sql
SELECT timestamp, type, schema_name, table_name, table_id, procedure_state
FROM greptime_private.events
WHERE timestamp >= now() - INTERVAL '1' hour
  AND schema_name = '<database_name>'
  AND table_name = '<table_name>'
ORDER BY timestamp DESC
LIMIT 1;
```

### Flow

```sql
SELECT timestamp, type, flow_name, flow_id, procedure_state
FROM greptime_private.events
WHERE timestamp >= now() - INTERVAL '1' hour
  AND flow_name = '<flow_name>'
ORDER BY timestamp DESC
LIMIT 1;
```

### 视图

```sql
SELECT timestamp, type, schema_name, view_name, view_id, procedure_state
FROM greptime_private.events
WHERE timestamp >= now() - INTERVAL '1' hour
  AND schema_name = '<database_name>'
  AND view_name = '<view_name>'
ORDER BY timestamp DESC
LIMIT 1;
```

### Region

Region 事件是全局事件，不按数据库隔离。下面的查询返回某个 Region 在
`region_migration`、`batch_gc` 和 `repartition_group` 中最新的一条匹配事件。

运行该查询前，events 表必须至少记录过这三类事件各一次。它会在首次记录某类事件时加入
该类事件的列；某列不适用于当前行时，其值为 SQL `NULL`。

```sql
SELECT timestamp, type, procedure_state,
       region_id, source_region_id, target_region_id,
       region_migration_trigger_reason,
       region_migration_src_node_id, region_migration_dst_node_id
FROM greptime_private.events
WHERE type IN ('region_migration', 'batch_gc', 'repartition_group')
  AND timestamp >= now() - INTERVAL '1' hour
  AND (region_id = <region_id>
       OR source_region_id = <region_id>
       OR target_region_id = <region_id>)
ORDER BY timestamp DESC
LIMIT 1;
```

## 查询 Procedure 事件

Procedure 事件共享 `procedure_id`。

### 获取 Procedure ID

对于创建表的 Procedure，按数据库和表筛选，再将 `procedure_trigger` 的类型筛为
`Submitted`，即可找到提交行：

```sql
SELECT procedure_id
FROM greptime_private.events
WHERE type = 'create_table'
  AND timestamp >= now() - INTERVAL '1' hour
  AND schema_name = '<database_name>'
  AND table_name = '<table_name>'
  AND json_path_match(procedure_trigger, '$.type == "Submitted"')
ORDER BY timestamp DESC
LIMIT 1;
```

示例结果：

```sql
+--------------------------------------+
| procedure_id                         |
+--------------------------------------+
| a5788f51-5726-4db7-a85e-e9afc36da557 |
+--------------------------------------+
```

在后续查询中使用返回的 ID 查看该 Procedure 的事件记录。加上 `schema_name` 和
`table_name` 可以避免选中名称相似但属于其他对象的 Procedure。

### 查询一个 Procedure

要查询某个 Procedure 的所有事件记录，请按其 ID 查询：

```sql
SELECT *
FROM greptime_private.events
WHERE procedure_id = '<procedure_id>'
ORDER BY timestamp ASC;
```

若只需查看部分列，可以使用更小的投影：

```sql
SELECT timestamp, type, procedure_state,
       json_get_string(procedure_trigger, 'type') AS trigger_type,
       procedure_error, json_to_string(payload) AS payload
FROM greptime_private.events
WHERE procedure_id = '<procedure_id>'
ORDER BY timestamp;
```

以下是一次 MySQL 操作的示例输出：

```sql
+-------------------------------+--------------+-----------------+--------------+-----------------+------------------------------------------------------------+
| timestamp                     | type         | procedure_state | trigger_type | procedure_error | payload                                                    |
+-------------------------------+--------------+-----------------+--------------+-----------------+------------------------------------------------------------+
| 2026-08-10 11:23:14.388632208 | create_table | Running         | Submitted    |                 | {"create_if_not_exists":false,"engine":"mito","version":1} |
| 2026-08-10 11:23:14.463992155 | create_table | Done            | Succeeded    |                 | null                                                       |
+-------------------------------+--------------+-----------------+--------------+-----------------+------------------------------------------------------------+
```

### 查询失败的 Procedure

查询最近失败的 Procedure：

```sql
SELECT timestamp, type, procedure_id, procedure_state,
       json_get_string(procedure_trigger, 'type') AS trigger_type,
       procedure_error
FROM greptime_private.events
WHERE procedure_state IN ('Failed', 'Poisoned')
  AND timestamp >= now() - INTERVAL '1' hour
ORDER BY timestamp DESC
LIMIT 20;
```
