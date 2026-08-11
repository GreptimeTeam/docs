---
keywords: [GreptimeDB 事件, 查询事件]
description: 查询 GreptimeDB 事件记录。
---

# 查询事件

查询 `greptime_private.events` 系统表可以排查最近的 Procedure。事件异步写入，
刚提交的操作可能不会立即出现。有关 Procedure 状态和列，请参阅[Procedure 事件](/user-guide/deployments-administration/monitoring/events/procedure-lifecycle.md)
和[事件数据模型](/user-guide/deployments-administration/monitoring/events/event-data-model.md)。

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
SELECT timestamp, type, procedure_state,
       catalog_name, schema_name, table_name, view_name, flow_name, region_id
FROM greptime_private.events
WHERE timestamp >= now() - INTERVAL '1' hour
ORDER BY timestamp DESC
LIMIT 20;
```

这样可以保留时间、Procedure 状态、事件类型和主要对象定位列，而不必粘贴完整的
宽表输出。

## 查看并筛选事件类型

先列出集群中实际存在的类型，再选择筛选条件：

```sql
SELECT type, COUNT(*) AS event_rows
FROM greptime_private.events
WHERE timestamp >= now() - INTERVAL '1' hour
GROUP BY type
ORDER BY type;
```

查询结果是集群当前已有事件类型的时间点快照，会随工作负载变化，并不表示完整的
配置项或源码支持范围。支持的本地 DDL 事件类型请参阅 [DDL 事件](/user-guide/deployments-administration/monitoring/events/ddl-events.md)。

将类型与 catalog、schema 以及对象定位列组合，可以避免混入无关事件：

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

Flow 行的 `schema_name` 可能是 SQL `NULL`。因此使用 `catalog_name` 加唯一的
`flow_name` 定位。

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
Region 的相关事件类型中最新的事件：

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
