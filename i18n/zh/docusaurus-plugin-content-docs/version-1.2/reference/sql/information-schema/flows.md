---
keywords: [Flow 任务信息, FLOWS 表, 任务定义, 过期时间, 源表 id]
description: FLOWS 表提供 Flow 任务的相关信息。
---

# FLOWS
`Flows` 表提供了 Flow 任务的相关信息。

```sql
DESC TABLE INFORMATION_SCHEMA.FLOWS;
```

```sql
      Column      |  Type  | Key | Null | Default | Semantic Type 
------------------+--------+-----+------+---------+---------------
 flow_name        | String |     | NO   |         | FIELD
 flow_id          | UInt32 |     | NO   |         | FIELD
 table_catalog    | String |     | NO   |         | FIELD
 flow_definition  | String |     | NO   |         | FIELD
 comment          | String |     | YES  |         | FIELD
 expire_after     | Int64  |     | YES  |         | FIELD
 source_table_ids | String |     | YES  |         | FIELD
 sink_table_name  | String |     | NO   |         | FIELD
 flownode_ids     | String |     | YES  |         | FIELD
 options          | String |     | YES  |         | FIELD
(10 rows)
```

表中的列：

* `flow_name`: Flow 任务的名称。
* `flow_id`: Flow 任务的 id。
* `table_catalog`: 该 Flow 所属的目录，命名为 `table_catalog` 以保持与 `INFORMATION_SCHEMA` 标准一致。
* `flow_definition`: Flow 任务的定义，是用于创建 Flow 任务的 SQL 语句。
* `comment`: Flow 任务的注释。
* `expire_after`: Flow 任务的保留时长，单位为秒。
* `source_table_ids`: Flow 任务的源表 id。
* `sink_table_name`: Flow 任务的目标表名称。
* `flownode_ids`: Flow 任务使用的 flownode id。
* `options`: Flow 任务的其他额外选项。
## Flow 运行时统计信息

`information_schema.flow_statistics` 表提供 Flow 任务的运行时统计信息。
`SHOW FLOW STATUS` 是该表的便捷查询方式，并支持对 `flow_name` 使用可选的
`LIKE` 过滤条件。

```sql
DESC TABLE INFORMATION_SCHEMA.FLOW_STATISTICS;
```

```text
+---------------------+----------------------+-----+------+---------+---------------+
| Column              | Type                 | Key | Null | Default | Semantic Type |
+---------------------+----------------------+-----+------+---------+---------------+
| flow_id             | UInt32               |     | NO   |         | FIELD         |
| flow_name           | String               |     | NO   |         | FIELD         |
| start_time          | TimestampMillisecond |     | YES  |         | FIELD         |
| last_execution_time | TimestampMillisecond |     | YES  |         | FIELD         |
| uptime_seconds      | Int64                |     | YES  |         | FIELD         |
| state_size          | UInt64               |     | YES  |         | FIELD         |
+---------------------+----------------------+-----+------+---------+---------------+
6 rows in set (0.00 sec)
```

各列含义如下：

- `flow_id`：Flow 任务的唯一 ID。
- `flow_name`：Flow 任务的名称。
- `start_time`：Flow 首次执行的时间。
- `last_execution_time`：最近一次执行的时间。
- `uptime_seconds`：自 `start_time` 起经过的时间，单位为秒。
- `state_size`：内存中状态的大小，单位为字节，可作为内存使用量的参考。

```sql
SHOW FLOW STATUS;
SHOW FLOW STATUS LIKE 'orders%';
```

在 standalone 模式下，如果相应的运行时数据可用，六列都会填充。在分布式模式下，
v1.2 的跨节点 FlowStat heartbeat 不包含 start-time 信息，因此
`start_time` 和 `uptime_seconds` 不可用，会返回 SQL `NULL`。
