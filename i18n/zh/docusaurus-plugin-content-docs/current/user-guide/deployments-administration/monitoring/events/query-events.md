---
keywords: [GreptimeDB 事件, 查询事件]
description: 查询 GreptimeDB 事件记录。
---

# 查询事件

查询 `greptime_private.events` 系统表可以排查最近事件。事件异步写入，刚提交的操作可能不会立即出现。
有关事件列，请参阅[事件数据模型](/user-guide/deployments-administration/monitoring/events/event-data-model.md)。

## 查看最近事件

以下查询会返回完整的事件记录：

```sql
SELECT *
FROM greptime_private.events
WHERE timestamp >= now() - INTERVAL '1' hour
ORDER BY timestamp DESC
LIMIT 20;
```

该查询适合初步探索，但会返回所有列。日常排查时，建议只选择所需列：

```sql
SELECT timestamp, type, json_to_string(payload) AS payload
FROM greptime_private.events
WHERE timestamp >= now() - INTERVAL '1' hour
ORDER BY timestamp DESC
LIMIT 20;
```

这样只返回排查所需的时间、事件类型和 payload，结果会更容易阅读。

## 查看并筛选事件类型

先列出集群中实际存在的类型，再选择筛选条件：

```sql
SELECT type, COUNT(*) AS event_rows
FROM greptime_private.events
WHERE timestamp >= now() - INTERVAL '1' hour
GROUP BY type
ORDER BY type;
```

该结果仅反映最近一小时内实际出现的事件类型，不能作为已配置或受支持类型的完整清单。
支持的本地 DDL 事件类型请参阅 [DDL 事件](/user-guide/deployments-administration/monitoring/events/ddl-events.md)。

将 `type` 与 `catalog_name`、`schema_name` 和对象名称组合，可以避免混入无关事件：

```sql
SELECT timestamp, type, procedure_state,
       json_get_string(procedure_trigger, 'type') AS trigger_type
FROM greptime_private.events
WHERE type = 'create_table'
  AND timestamp >= now() - INTERVAL '1' hour
  AND catalog_name = 'greptime'
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

将占位符替换为实际定位条件。每个查询只返回匹配结果中最新的一条事件。

### 数据库

```sql
SELECT timestamp, type, schema_name, procedure_state,
       json_get_string(procedure_trigger, 'type') AS trigger_type
FROM greptime_private.events
WHERE catalog_name = 'greptime'
  AND timestamp >= now() - INTERVAL '1' hour
  AND schema_name = '<database_name>'
  AND type IN ('create_database', 'alter_database', 'drop_database')
ORDER BY timestamp DESC
LIMIT 1;
```

### 表

```sql
SELECT timestamp, type, schema_name, table_name, table_id, procedure_state
FROM greptime_private.events
WHERE catalog_name = 'greptime'
  AND timestamp >= now() - INTERVAL '1' hour
  AND schema_name = '<database_name>'
  AND table_name = '<table_name>'
ORDER BY timestamp DESC
LIMIT 1;
```

### Flow

Flow 没有 schema。请使用 `catalog_name` 加唯一的 `flow_name` 定位；因此 Flow 行的
`schema_name` 为 SQL `NULL`。

```sql
SELECT timestamp, type, catalog_name, schema_name,
       flow_name, flow_id, procedure_state
FROM greptime_private.events
WHERE catalog_name = 'greptime'
  AND timestamp >= now() - INTERVAL '1' hour
  AND flow_name = '<flow_name>'
ORDER BY timestamp DESC
LIMIT 1;
```

### 视图

```sql
SELECT timestamp, type, schema_name, view_name, view_id, procedure_state
FROM greptime_private.events
WHERE catalog_name = 'greptime'
  AND timestamp >= now() - INTERVAL '1' hour
  AND schema_name = '<database_name>'
  AND view_name = '<view_name>'
ORDER BY timestamp DESC
LIMIT 1;
```

### Region

带 Region 的运维事件是全局记录，不属于按数据库隔离的对象。以下查询返回某个
Region 的相关事件类型中最新的事件。每个列出的事件类型都必须已经产生过记录，因为该类型的列会在首次记录时加入表 schema：

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

对于创建表的 Procedure，可以根据 catalog、数据库、表和 `Submitted` 触发器定位提交行：

```sql
SELECT procedure_id
FROM greptime_private.events
WHERE type = 'create_table'
  AND timestamp >= now() - INTERVAL '1' hour
  AND catalog_name = 'greptime'
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

在后续查询中使用返回的 ID 查看该 Procedure 的事件记录。定位条件可以避免选中名称相似但属于其他对象的 Procedure。

### 查询一个 Procedure

需要探索所有可用列时，使用完整记录查询：

```sql
SELECT *
FROM greptime_private.events
WHERE procedure_id = '<procedure_id>'
  AND timestamp >= now() - INTERVAL '1' hour
ORDER BY timestamp ASC;
```

日常排查时，使用只选择所需列的投影：

```sql
SELECT timestamp, type, procedure_state,
       json_get_string(procedure_trigger, 'type') AS trigger_type,
       procedure_error, json_to_string(payload) AS payload
FROM greptime_private.events
WHERE procedure_id = '<procedure_id>'
  AND timestamp >= now() - INTERVAL '1' hour
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
