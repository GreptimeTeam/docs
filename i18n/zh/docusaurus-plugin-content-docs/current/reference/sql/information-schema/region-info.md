---
keywords: [Region 信息, 运行时元数据, manifest 元数据, committed sequence, flushed sequence]
description: 提供 Region 的运行时和 manifest 详细元数据，用于排查和调试。
---

# REGION_INFO

`REGION_INFO` 表提供 Region 的运行时和 manifest 详细元数据，用于排查和调试。

```sql
USE INFORMATION_SCHEMA;
DESC REGION_INFO;
```

输出如下：

```sql
+------------------------+---------+------+------+---------+---------------+
| Column                 | Type    | Key  | Null | Default | Semantic Type |
+------------------------+---------+------+------+---------+---------------+
| region_id              | UInt64  |      | NO   |         | FIELD         |
| table_id               | UInt32  |      | NO   |         | FIELD         |
| region_number          | UInt32  |      | NO   |         | FIELD         |
| region_group           | UInt8   |      | NO   |         | FIELD         |
| region_sequence        | UInt32  |      | NO   |         | FIELD         |
| state                  | String  |      | NO   |         | FIELD         |
| role                   | String  |      | NO   |         | FIELD         |
| writable               | Boolean |      | NO   |         | FIELD         |
| committed_sequence     | UInt64  |      | NO   |         | FIELD         |
| flushed_sequence       | UInt64  |      | YES  |         | FIELD         |
| manifest_version       | UInt64  |      | NO   |         | FIELD         |
| compaction_time_window | String  |      | YES  |         | FIELD         |
| region_options         | String  |      | NO   |         | FIELD         |
| sst_format             | String  |      | NO   |         | FIELD         |
| node_id                | UInt64  |      | YES  |         | FIELD         |
+------------------------+---------+------+------+---------+---------------+
```

`REGION_INFO` 表中的字段描述如下：

- `region_id`：Region 的 ID。
- `table_id`：表的 ID。
- `region_number`：Region 在表中的编号。
- `region_group`：Region 组编号。
- `region_sequence`：Region 在组内的序号。
- `state`：详细的运行时角色/状态标签，例如 `Leader(Writable)` 或 `Follower`。
- `role`：Region 的粗粒度角色，例如 `Leader` 或 `Follower`。
- `writable`：Region 是否可写。
- `committed_sequence`：Region 的已提交 sequence。
- `flushed_sequence`：最近已刷入 SST 文件的 sequence。
- `manifest_version`：Region 的 manifest 版本。
- `compaction_time_window`：可读格式的 compaction 时间窗口。
- `region_options`：JSON 编码的 Region 配置项。
- `sst_format`：Region 使用的 SST 格式。
- `node_id`：上报该行信息的 datanode ID。

查询某张表的 Region 信息示例如下：

```sql
SELECT r.*
FROM REGION_INFO r
LEFT JOIN REGION_PEERS p ON r.region_id = p.region_id
WHERE p.table_name = 'region_info_case';
```
