---
keywords: [Flow 运行统计, FLOW_STATISTICS 表, 运行时长, 状态大小, 上次执行时间]
description: FLOW_STATISTICS 表提供 Flow 的运行统计信息，包括启动时间、上次执行时间、运行时长和状态大小。
---

# FLOW_STATISTICS

`FLOW_STATISTICS` 表提供 Flow 的运行统计信息。当前 catalog 下的所有 Flow 都会列出，
包括尚未上报统计信息的 Flow。

```sql
DESC TABLE INFORMATION_SCHEMA.FLOW_STATISTICS;
```

```sql
+---------------------+----------------------+------+------+---------+---------------+
| Column              | Type                 | Key  | Null | Default | Semantic Type |
+---------------------+----------------------+------+------+---------+---------------+
| flow_id             | UInt32               |      | NO   |         | FIELD         |
| flow_name           | String               |      | NO   |         | FIELD         |
| start_time          | TimestampMillisecond |      | YES  |         | FIELD         |
| last_execution_time | TimestampMillisecond |      | YES  |         | FIELD         |
| uptime_seconds      | Int64                |      | YES  |         | FIELD         |
| state_size          | UInt64               |      | YES  |         | FIELD         |
+---------------------+----------------------+------+------+---------+---------------+
```

`FLOW_STATISTICS` 表中的字段含义如下：

- `flow_id`：Flow 的 ID。
- `flow_name`：Flow 的名称。
- `start_time`：Flownode 开始运行该 Flow 的时间。
- `last_execution_time`：该 Flow 最近一次执行的时间。
- `uptime_seconds`：距 `start_time` 经过的秒数。
- `state_size`：该 Flow 在内存中状态的大小，单位为字节。

统计信息由 Flownode 通过心跳上报。尚未上报统计信息的 Flow，后四列为 `NULL`，例如刚创建
完成或 Flownode 重启之后。

集群部署下 `start_time` 和 `uptime_seconds` 始终为 `NULL`：为集群持久化的 Flownode 状态
不包含 Flow 的启动时间。这两列只在单机部署下有值。

[`SHOW FLOW STATUS`](/reference/sql/show.md#show-flow-status) 返回的列与该表相同。
