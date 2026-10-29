---
keywords: [GreptimeDB 事件, 查询事件]
description: 查询 GreptimeDB 事件记录。
---

# 查询事件

查询 `greptime_private.events` 系统表可以排查最近事件。事件异步写入，刚提交的操作可能不会立即出现。
有关事件列，请参阅[事件数据模型](/user-guide/deployments-administration/monitoring/events/event-data-model.md)。

## 查看最近事件

以下查询返回最近一小时内记录的最多 20 条事件的所有列：

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

## 按 actor 筛选事件

使用 `actor` 查询为某个数据库用户记录的最近事件：

```sql
SELECT timestamp, type, actor, json_to_string(payload) AS payload
FROM greptime_private.events
WHERE actor = '<username>'
  AND timestamp >= now() - INTERVAL '1' hour
ORDER BY timestamp DESC
LIMIT 20;
```

GreptimeDB 如何确定该字段的值，请参阅[事件发起人](/user-guide/deployments-administration/monitoring/events/event-data-model.md#actor)。

## 查询管理函数事件

`admin_function` 事件记录管理函数名称、当前数据库用户、立即执行状态、输入参数
和立即返回结果：

```sql
SELECT timestamp,
       actor,
       admin_function_name,
       admin_function_status,
       json_to_string(payload) AS payload,
       json_to_string(admin_function_output) AS output
FROM greptime_private.events
WHERE type = 'admin_function'
  AND timestamp >= now() - INTERVAL '1' hour
ORDER BY timestamp DESC
LIMIT 20;
```

管理函数执行成功时，`output` 包含 `result`；执行失败时，包含 `error`：

```text
| actor | admin_function_name | admin_function_status | output        |
| root  | flush_table         | Succeeded              | {"result":0} |
| root  | unknown_function     | Failed                 | {"error":"..."} |
```

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

涉及 Region 的运维事件是全局事件，不按数据库隔离。下面的查询返回某个
Region 最近的一条事件。`region_migration`、`batch_gc` 和
`repartition_group` 都至少需要有一条记录：events 表会在首次记录某类事件时，
加入该类事件的列。每条记录只填写该事件类型适用的列，其余选出的列为 SQL `NULL`。

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
