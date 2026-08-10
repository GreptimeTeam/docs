---
keywords: [GreptimeDB 事件, 查询事件]
description: 查询 GreptimeDB 生命周期和运维事件。
---

# 查询事件

查询 `greptime_private.events` 系统表可以排查最近的 Procedure。事件异步写入，
刚提交的操作可能不会立即出现。有关生命周期状态和列，请参阅[Procedure 生命周期](/user-guide/deployments-administration/monitoring/events/procedure-lifecycle.md)
和[事件数据模型](/user-guide/deployments-administration/monitoring/events/event-data-model.md)。

## 查看最近事件

以下是 issue 要求的查询，会返回完整且较宽的事件记录：

```sql
SELECT *
FROM greptime_private.events
ORDER BY timestamp DESC
LIMIT 20;
```

该查询适合初步探索，但会返回 36 列。日常排查时，建议使用只选择所需列的
投影，输出更紧凑：

```sql
SELECT timestamp, type, procedure_state,
       catalog_name, schema_name, table_name, view_name, flow_name, region_id
FROM greptime_private.events
ORDER BY timestamp DESC
LIMIT 20;
```

这样可以保留时间、生命周期状态、事件类型和主要对象定位列，而不必粘贴完整的
宽表输出。

## 查看并筛选事件类型

先列出集群中实际存在的类型，再选择筛选条件：

```sql
SELECT type, COUNT(*) AS event_rows
FROM greptime_private.events
GROUP BY type
ORDER BY type;
```

测试集群中观察到的类型包括 `alter_table`、`batch_gc`、`create_database`、
`create_flow`、`create_logical_tables`、`create_table`、`create_view`、
`drop_database`、`drop_table`、`region_migration`、`repartition`、
`repartition_group` 和 `wal_prune`。这只是本次集群中观察到的集合，并不等于
完整的配置列表或源码支持列表。完整的事件族请参阅 [DDL 事件](/user-guide/deployments-administration/monitoring/events/ddl-events.md)
和[运维事件](/user-guide/deployments-administration/monitoring/events/operational-events.md)。

将类型与 catalog、schema 以及对象定位列组合，可以避免混入无关事件：

```sql
SELECT timestamp, type, procedure_state,
       json_to_string(procedure_trigger) AS procedure_trigger,
       schema_name, table_name
FROM greptime_private.events
WHERE type = 'create_table'
  AND catalog_name = 'greptime'
  AND schema_name = 'docs_ev2723_query_20260810'
  AND table_name = 'query_source'
ORDER BY timestamp;
```

`query_source` 的紧凑结果：

```text
+-------------------------------+--------------+-----------------+----------------------+----------------------------+--------------+
| timestamp                     | type         | procedure_state | procedure_trigger    | schema_name                | table_name   |
+-------------------------------+--------------+-----------------+----------------------+----------------------------+--------------+
| 2026-08-10 11:28:40.590240203 | create_table | Running         | {"type":"Submitted"} | docs_ev2723_query_20260810 | query_source |
| 2026-08-10 11:28:40.659064297 | create_table | Done            | {"type":"Succeeded"} | docs_ev2723_query_20260810 | query_source |
+-------------------------------+--------------+-----------------+----------------------+----------------------------+--------------+
```

## 查询对象的最新事件

将示例数据库名和对象名替换为实际定位条件。每个查询只返回匹配结果中最新的一条事件。

### 数据库

```sql
SELECT timestamp, type, schema_name, procedure_state,
       json_to_string(procedure_trigger) AS procedure_trigger
FROM greptime_private.events
WHERE catalog_name = 'greptime'
  AND schema_name = 'docs_ev2723_query_20260810'
  AND type IN ('create_database', 'alter_database', 'drop_database')
ORDER BY timestamp DESC
LIMIT 1;
```

### 表

```sql
SELECT timestamp, type, schema_name, table_name, table_id, procedure_state
FROM greptime_private.events
WHERE catalog_name = 'greptime'
  AND schema_name = 'docs_ev2723_query_20260810'
  AND table_name = 'query_source'
ORDER BY timestamp DESC
LIMIT 1;
```

### Flow

在测试集群中，生成的 Flow 行的 `schema_name` 是 SQL `NULL`。因此使用 catalog
加唯一的 `flow_name` 定位；此查询有意不假装使用了 schema 筛选：

```sql
SELECT timestamp, type, catalog_name, schema_name,
       flow_name, flow_id, procedure_state
FROM greptime_private.events
WHERE catalog_name = 'greptime'
  AND flow_name = 'query_flow'
ORDER BY timestamp DESC
LIMIT 1;
```

### 视图

```sql
SELECT timestamp, type, schema_name, view_name, view_id, procedure_state
FROM greptime_private.events
WHERE catalog_name = 'greptime'
  AND schema_name = 'docs_ev2723_query_20260810'
  AND view_name = 'query_view'
ORDER BY timestamp DESC
LIMIT 1;
```

### Region

Region migration 事件是全局运维记录，不属于按数据库隔离的对象。以下只读查询
返回最新的既有记录：

```sql
SELECT timestamp, type, region_id, region_migration_trigger_reason,
       region_migration_src_node_id, region_migration_dst_node_id,
       procedure_state
FROM greptime_private.events
WHERE type = 'region_migration'
ORDER BY timestamp DESC
LIMIT 1;
```
